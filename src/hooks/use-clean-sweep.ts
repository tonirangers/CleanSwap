import { useState, useCallback } from 'react'
import { useAccount, useChainId, useWalletClient, usePublicClient, useSendTransaction } from 'wagmi'
import { erc20Abi, maxUint256, type Hex } from 'viem'
import { toast } from 'sonner'
import { getOdosQuote, assembleOdosTransaction } from '@/api/odos-v3'
import { PERMIT2_ADDRESS, DEFAULT_SLIPPAGE } from '@/config/constants'
import { getChainConfig } from '@/config/chains'
import type { SweepBatch, SweepStatus } from '@/types'

/** Detects user rejection from wallet */
function isUserRejection(err: unknown): boolean {
  if (!(err instanceof Error)) return false
  const msg = err.message.toLowerCase()
  return (
    msg.includes('user rejected') ||
    msg.includes('user denied') ||
    msg.includes('rejected the request') ||
    msg.includes('user cancelled') ||
    msg.includes('action_rejected') ||
    msg.includes('user refused')
  )
}

export function useCleanSweep() {
  const { address } = useAccount()
  const chainId = useChainId()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const { sendTransactionAsync } = useSendTransaction()
  const [status, setStatus] = useState<SweepStatus>('idle')
  const [activeBatch, setActiveBatch] = useState(0)
  const [totalBatches, setTotalBatches] = useState(0)

  const sweep = useCallback(
    async (batches: SweepBatch[], onSuccess?: () => void) => {
      if (!address || !walletClient || !publicClient || batches.length === 0) return

      const chainConfig = getChainConfig(chainId)
      if (!chainConfig) return

      setTotalBatches(batches.length)

      try {
        for (let i = 0; i < batches.length; i++) {
          const batch = batches[i]
          setActiveBatch(i)

          const toastId = `sweep-batch-${i}`

          const inputTokens = batch.tokens.map((t) => ({
            tokenAddress: t.address,
            amount: t.balance.toString(),
          }))

          // ──────────────────────────────────────────────
          // Step 1: Approve all tokens to Permit2
          // Permit2 is the universal approval target — approve once,
          // then every swap only needs a gasless EIP-712 signature.
          // ──────────────────────────────────────────────
          const tokensNeedingApproval = batch.tokens.filter((t) => !t.permit2Approved)

          if (tokensNeedingApproval.length > 0) {
            setStatus('approving')
            toast.loading(
              `Approving ${tokensNeedingApproval.length} token(s)...`,
              { id: toastId },
            )

            for (const token of tokensNeedingApproval) {
              try {
                toast.loading(`Approving ${token.symbol}...`, { id: `approve-${token.address}` })
                await walletClient.writeContract({
                  address: token.address,
                  abi: erc20Abi,
                  functionName: 'approve',
                  args: [PERMIT2_ADDRESS as `0x${string}`, maxUint256],
                })
                toast.success(`Approved ${token.symbol}`, { id: `approve-${token.address}` })
              } catch (err) {
                toast.dismiss(`approve-${token.address}`)
                if (isUserRejection(err)) {
                  toast.error(`Approval cancelled for ${token.symbol}`, { duration: 10000 })
                  setStatus('idle')
                  return
                }
                toast.error(`Failed to approve ${token.symbol}`, { duration: 10000 })
                throw err
              }
            }
          }

          // ──────────────────────────────────────────────
          // Step 2: Get quote from Odos
          // Now that tokens are approved to Permit2, Odos will
          // return permit2Message for gasless signing
          // ──────────────────────────────────────────────
          setStatus('sweeping')
          toast.loading(
            batches.length > 1
              ? `Getting quote for batch ${i + 1}/${batches.length}...`
              : 'Getting quote...',
            { id: toastId },
          )

          let quote
          try {
            quote = await getOdosQuote({
              chainId,
              inputTokens,
              userAddr: address,
              slippageLimitPercent: DEFAULT_SLIPPAGE,
              referralCode: chainConfig.referralCode,
            })
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown error'
            console.error('[Sweep] Quote error:', msg)
            toast.error(msg.length > 120 ? 'Odos cannot route these tokens' : msg, { id: toastId, duration: 10000 })
            throw err
          }

          console.log('[Sweep] Permit2 available:', !!quote.permit2Message)

          // ──────────────────────────────────────────────
          // Step 3: Sign Permit2 if available (gasless!)
          // ──────────────────────────────────────────────
          let permit2Signature: string | undefined

          if (quote.permit2Message) {
            setStatus('signing')
            toast.loading('Sign permit in wallet (no gas)...', { id: toastId })

            try {
              const msg = quote.permit2Message
              permit2Signature = await walletClient.signTypedData({
                domain: msg.domain as Record<string, unknown>,
                types: msg.types as Record<string, { name: string; type: string }[]>,
                primaryType: msg.primaryType,
                message: msg.message as Record<string, unknown>,
              })
            } catch (err) {
              toast.dismiss(toastId)
              if (isUserRejection(err)) {
                toast.error('Permit signature cancelled', { duration: 10000 })
                setStatus('idle')
                return
              }
              console.warn('[Sweep] Permit2 signing failed, using standard flow:', err)
              permit2Signature = undefined
            }
          }

          // ──────────────────────────────────────────────
          // Step 4: Assemble with simulation + send
          // ──────────────────────────────────────────────
          setStatus('sweeping')
          toast.loading(
            batches.length > 1
              ? `Assembling batch ${i + 1}/${batches.length}...`
              : 'Assembling transaction...',
            { id: toastId },
          )

          let assembled
          try {
            // Don't use Odos simulation — their gas estimation can be stale.
            // Let the wallet (Rabby/MetaMask) handle gas pricing and simulation.
            assembled = await assembleOdosTransaction({
              userAddr: address,
              pathId: quote.pathId,
              simulate: false,
              permit2Signature,
            })
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown error'
            console.error('[Sweep] Assemble error:', msg)
            toast.error(msg.length > 150 ? 'Failed to assemble transaction' : msg, { id: toastId, duration: 10000 })
            throw err
          }

          // Send transaction
          toast.loading(
            batches.length > 1
              ? `Confirm sweep ${i + 1}/${batches.length} in wallet...`
              : 'Confirm sweep in wallet...',
            { id: toastId },
          )

          try {
            await sendTransactionAsync({
              to: assembled.transaction.to as `0x${string}`,
              data: assembled.transaction.data as Hex,
              value: BigInt(assembled.transaction.value),
            })
            toast.success(
              batches.length > 1 ? `Batch ${i + 1} complete!` : 'Sweep complete!',
              { id: toastId },
            )
          } catch (err) {
            toast.dismiss(toastId)
            if (isUserRejection(err)) {
              toast.error('Transaction cancelled', { duration: 10000 })
              setStatus('idle')
              return
            }
            toast.error('Transaction failed', { duration: 10000 })
            throw err
          }
        }

        setStatus('done')
        toast.success('All dust swept! Check your wallet.', { duration: 5000 })
        onSuccess?.()
      } catch (err: unknown) {
        if (status !== 'idle') {
          setStatus('error')
        }
        const message = err instanceof Error ? err.message : 'Sweep failed'
        console.error('Sweep error:', message)
      }
    },
    [address, chainId, walletClient, publicClient, sendTransactionAsync, status],
  )

  const reset = useCallback(() => {
    setStatus('idle')
    setActiveBatch(0)
    setTotalBatches(0)
  }, [])

  return { sweep, status, activeBatch, totalBatches, reset }
}

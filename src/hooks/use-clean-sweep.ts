import { useState, useCallback } from 'react'
import { useAccount, useChainId, useWalletClient, useSendTransaction } from 'wagmi'
import { erc20Abi, maxUint256, type Hex } from 'viem'
import { toast } from 'sonner'
import { getOdosQuote, assembleOdosTransaction } from '@/api/odos-v3'
import { PERMIT2_ADDRESS, ODOS_V3_ROUTER, DEFAULT_SLIPPAGE } from '@/config/constants'
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
  const { sendTransactionAsync } = useSendTransaction()
  const [status, setStatus] = useState<SweepStatus>('idle')
  const [activeBatch, setActiveBatch] = useState(0)
  const [totalBatches, setTotalBatches] = useState(0)

  const sweep = useCallback(
    async (batches: SweepBatch[], onSuccess?: () => void) => {
      if (!address || !walletClient || batches.length === 0) return

      const chainConfig = getChainConfig(chainId)
      if (!chainConfig) return

      setTotalBatches(batches.length)

      try {
        setStatus('sweeping')

        for (let i = 0; i < batches.length; i++) {
          const batch = batches[i]
          setActiveBatch(i)

          const toastId = `sweep-batch-${i}`
          toast.loading(
            batches.length > 1
              ? `Getting quote for batch ${i + 1}/${batches.length}...`
              : 'Getting quote...',
            { id: toastId },
          )

          // ──────────────────────────────────────────────
          // Step 1: Get quote from Odos
          // ──────────────────────────────────────────────
          const inputTokens = batch.tokens.map((t) => ({
            tokenAddress: t.address,
            amount: t.balance.toString(),
          }))

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
            toast.error('Failed to get quote from Odos', { id: toastId })
            throw err
          }

          // ──────────────────────────────────────────────
          // Step 2: Determine approval target
          // If Odos returned permit2Message → use Permit2 flow
          // Otherwise → approve directly to Odos router
          // ──────────────────────────────────────────────
          const usePermit2 = !!quote.permit2Message
          const approvalTarget = usePermit2
            ? (PERMIT2_ADDRESS as `0x${string}`)
            : (ODOS_V3_ROUTER as `0x${string}`)

          // Check which tokens need approval to the target
          const tokensNeedingApproval = batch.tokens.filter((t) => {
            if (usePermit2) return !t.permit2Approved
            return !t.routerApproved
          })

          if (tokensNeedingApproval.length > 0) {
            setStatus('approving')
            toast.loading(
              usePermit2
                ? `Approving ${tokensNeedingApproval.length} token(s) for Permit2...`
                : `Approving ${tokensNeedingApproval.length} token(s) for swap...`,
              { id: toastId },
            )

            for (const token of tokensNeedingApproval) {
              try {
                toast.loading(`Approving ${token.symbol}...`, { id: `approve-${token.address}` })
                await walletClient.writeContract({
                  address: token.address,
                  abi: erc20Abi,
                  functionName: 'approve',
                  args: [approvalTarget, maxUint256],
                })
                toast.success(`Approved ${token.symbol}`, { id: `approve-${token.address}` })
              } catch (err) {
                toast.dismiss(`approve-${token.address}`)
                if (isUserRejection(err)) {
                  toast.error(`Approval cancelled for ${token.symbol}`)
                  setStatus('idle')
                  return
                }
                toast.error(`Failed to approve ${token.symbol}`)
                throw err
              }
            }
          }

          // ──────────────────────────────────────────────
          // Step 3: Sign Permit2 message if available (gasless!)
          // ──────────────────────────────────────────────
          let permit2Signature: string | undefined

          if (usePermit2 && quote.permit2Message) {
            setStatus('signing')
            toast.loading('Sign Permit2 in wallet...', { id: toastId })

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
                toast.error('Permit2 signature cancelled')
                setStatus('idle')
                return
              }
              // Permit2 signing failed — fall back to standard flow
              console.warn('[Sweep] Permit2 signing failed, using standard flow:', err)
              permit2Signature = undefined
            }
          }

          // ──────────────────────────────────────────────
          // Step 4: Assemble + send transaction
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
            assembled = await assembleOdosTransaction({
              userAddr: address,
              pathId: quote.pathId,
              simulate: true,
              permit2Signature,
            })
          } catch (err) {
            toast.error('Failed to assemble transaction', { id: toastId })
            throw err
          }

          // Check simulation
          if (assembled.simulation && !assembled.simulation.isSuccess) {
            const errorMsg = assembled.simulation.simulationError?.errorMessage ?? 'Simulation failed'
            toast.error(errorMsg, { id: toastId })
            throw new Error(errorMsg)
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
              toast.error('Transaction cancelled')
              setStatus('idle')
              return
            }
            toast.error('Transaction failed')
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
    [address, chainId, walletClient, sendTransactionAsync, status],
  )

  const reset = useCallback(() => {
    setStatus('idle')
    setActiveBatch(0)
    setTotalBatches(0)
  }, [])

  return { sweep, status, activeBatch, totalBatches, reset }
}

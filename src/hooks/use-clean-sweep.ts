import { useState, useCallback } from 'react'
import { useAccount, useChainId, useWalletClient, useSendTransaction } from 'wagmi'
import { erc20Abi, maxUint256, type Hex } from 'viem'
import { toast } from 'sonner'
import { getOdosQuote, assembleOdosTransaction } from '@/api/odos-v3'
import { ODOS_V3_ROUTER, DEFAULT_SLIPPAGE } from '@/config/constants'
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
        // Step 1: Approve unapproved tokens
        const tokensNeedingApproval = batches
          .flatMap((b) => b.tokens)
          .filter((t) => !t.permit2Approved)

        if (tokensNeedingApproval.length > 0) {
          setStatus('approving')

          for (const token of tokensNeedingApproval) {
            try {
              toast.loading(`Approving ${token.symbol}...`, { id: `approve-${token.address}` })
              await walletClient.writeContract({
                address: token.address,
                abi: erc20Abi,
                functionName: 'approve',
                args: [ODOS_V3_ROUTER as `0x${string}`, maxUint256],
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

        // Step 2: Execute each batch
        setStatus('sweeping')

        for (let i = 0; i < batches.length; i++) {
          const batch = batches[i]
          setActiveBatch(i)

          const toastId = `sweep-batch-${i}`
          toast.loading(
            batches.length > 1
              ? `Sweeping batch ${i + 1}/${batches.length}...`
              : 'Sweeping your dust...',
            { id: toastId },
          )

          // Get quote
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

          // Assemble tx
          let assembled
          try {
            assembled = await assembleOdosTransaction({
              userAddr: address,
              pathId: quote.pathId,
              simulate: true,
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
        // Only set error if we haven't already reset to idle (user rejection)
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

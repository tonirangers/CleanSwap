import { useState, useCallback } from 'react'
import { useAccount, useChainId, useWalletClient, useSendTransaction } from 'wagmi'
import { erc20Abi, maxUint256, type Hex } from 'viem'
import { toast } from 'sonner'
import { getOdosQuote, assembleOdosTransaction } from '@/api/odos-v3'
import { ODOS_V3_ROUTER, DEFAULT_SLIPPAGE } from '@/config/constants'
import { getChainConfig } from '@/config/chains'
import type { SweepBatch, SweepStatus } from '@/types'

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
        // Step 1: Approve unapproved tokens to the Odos router
        const tokensNeedingApproval = batches
          .flatMap((b) => b.tokens)
          .filter((t) => !t.permit2Approved)

        if (tokensNeedingApproval.length > 0) {
          setStatus('approving')
          toast.loading(`Approving ${tokensNeedingApproval.length} token(s)...`)

          for (const token of tokensNeedingApproval) {
            try {
              await walletClient.writeContract({
                address: token.address,
                abi: erc20Abi,
                functionName: 'approve',
                args: [ODOS_V3_ROUTER as `0x${string}`, maxUint256],
              })
              toast.success(`Approved ${token.symbol}`)
            } catch (err) {
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

          if (batches.length > 1) {
            toast.loading(`Sweeping batch ${i + 1} of ${batches.length}...`)
          } else {
            toast.loading('Sweeping your dust...')
          }

          // Get quote
          const inputTokens = batch.tokens.map((t) => ({
            tokenAddress: t.address,
            amount: t.balance.toString(),
          }))

          const quote = await getOdosQuote({
            chainId,
            inputTokens,
            userAddr: address,
            slippageLimitPercent: DEFAULT_SLIPPAGE,
            referralCode: chainConfig.referralCode,
          })

          // Assemble transaction
          const assembled = await assembleOdosTransaction({
            userAddr: address,
            pathId: quote.pathId,
            simulate: true,
          })

          // Check simulation
          if (assembled.simulation && !assembled.simulation.isSuccess) {
            const errorMsg = assembled.simulation.simulationError?.errorMessage ?? 'Simulation failed'
            throw new Error(errorMsg)
          }

          // Send transaction
          await sendTransactionAsync({
            to: assembled.transaction.to as `0x${string}`,
            data: assembled.transaction.data as Hex,
            value: BigInt(assembled.transaction.value),
          })

          toast.success(
            batches.length > 1
              ? `Batch ${i + 1} complete!`
              : 'Sweep complete!',
          )
        }

        setStatus('done')
        toast.success('All dust swept! Check your wallet.', { duration: 5000 })
        onSuccess?.()
      } catch (err: unknown) {
        setStatus('error')
        const message = err instanceof Error ? err.message : 'Sweep failed'
        toast.error(message)
        console.error('Sweep error:', err)
      }
    },
    [address, chainId, walletClient, sendTransactionAsync],
  )

  const reset = useCallback(() => {
    setStatus('idle')
    setActiveBatch(0)
    setTotalBatches(0)
  }, [])

  return { sweep, status, activeBatch, totalBatches, reset }
}

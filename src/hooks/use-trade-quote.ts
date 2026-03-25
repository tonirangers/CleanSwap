import { useQuery } from '@tanstack/react-query'
import { useAccount, useChainId } from 'wagmi'
import { getOdosQuote } from '@/api/odos-v3'
import { DEFAULT_SLIPPAGE } from '@/config/constants'
import { getChainConfig } from '@/config/chains'
import type { DustToken, SweepQuote } from '@/types'

export function useTradeQuote(tokens: DustToken[]) {
  const { address } = useAccount()
  const chainId = useChainId()

  return useQuery({
    queryKey: ['trade-quote', tokens.map((t) => t.address).join(','), chainId],
    queryFn: async (): Promise<SweepQuote | null> => {
      if (!address || tokens.length === 0) return null

      const chainConfig = getChainConfig(chainId)
      if (!chainConfig) return null

      const inputTokens = tokens.map((t) => ({
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

      return {
        pathId: quote.pathId,
        inputTokens,
        outputAmounts: quote.outAmounts,
        outputValuesUsd: quote.outValues,
        gasEstimate: quote.gasEstimate,
        gasEstimateUsd: quote.gasEstimateValue,
        pathVizImage: quote.pathVizImage,
      }
    },
    enabled: !!address && tokens.length > 0 && chainId > 0,
    staleTime: 15_000,
    retry: 1,
  })
}

import { useQuery } from '@tanstack/react-query'
import { erc20Abi } from 'viem'
import { usePublicClient } from 'wagmi'
import { fetchWalletTokens } from '@/api/zerion'
import { getOdosSupportedTokens } from '@/api/odos-v3'
import { getChainConfig } from '@/config/chains'
import { ODOS_V3_ROUTER } from '@/config/constants'
import type { DustToken } from '@/types'

export function useDustTokens(address: `0x${string}` | undefined, chainId: number) {
  const publicClient = usePublicClient()

  return useQuery({
    queryKey: ['dust-tokens', address, chainId],
    queryFn: async (): Promise<DustToken[]> => {
      if (!address || !publicClient) return []

      const chainConfig = getChainConfig(chainId)
      if (!chainConfig) return []

      // Fetch wallet tokens and Odos supported tokens in parallel
      const [walletTokens, odosSupported] = await Promise.all([
        fetchWalletTokens(address, chainId),
        getOdosSupportedTokens(chainId),
      ])

      console.log(`[DustTokens] Wallet: ${walletTokens.length} tokens, Odos supported: ${odosSupported.size} tokens`)

      // Show ALL ERC20 tokens from wallet (not just dust).
      // Filter: must have some value > 0 AND be under the dust threshold
      // The threshold is generous ($200-$2000 depending on chain)
      const dustTokens = walletTokens.filter(
        (t) => t.usdValue >= 0.001 && t.usdValue <= chainConfig.minimumDustInUSD,
      )

      // Also include tokens with $0 value if they have a balance (might be unpriced)
      const unpricedTokens = walletTokens.filter(
        (t) => t.usdValue === 0 && t.balanceFormatted > 0,
      )

      const allTokens = [...dustTokens, ...unpricedTokens]

      if (allTokens.length === 0) {
        console.log('[DustTokens] No qualifying tokens found')
        return []
      }

      console.log(`[DustTokens] ${dustTokens.length} priced + ${unpricedTokens.length} unpriced = ${allTokens.length} total`)

      // Batch check allowances via multicall
      const spender = ODOS_V3_ROUTER as `0x${string}`
      const approvalCalls = allTokens.map((t) => ({
        address: t.address as `0x${string}`,
        abi: erc20Abi,
        functionName: 'allowance' as const,
        args: [address, spender] as const,
      }))

      let allowances: bigint[] = []
      try {
        const results = await publicClient.multicall({ contracts: approvalCalls })
        allowances = results.map((r) =>
          r.status === 'success' ? (r.result as bigint) : 0n,
        )
      } catch (err) {
        console.warn('[DustTokens] Multicall failed, skipping allowance check:', err)
        allowances = allTokens.map(() => 0n)
      }

      return allTokens
        .map((t, i) => ({
          address: t.address as `0x${string}`,
          symbol: t.symbol,
          name: t.name,
          decimals: t.decimals,
          balance: BigInt(t.balance),
          balanceFormatted: String(t.balanceFormatted),
          usdPrice: t.usdPrice,
          usdValue: t.usdValue,
          logoUrl: t.logoUrl,
          isOdosSupported: odosSupported.has(t.address.toLowerCase()),
          permit2Approved: allowances[i] > 0n,
        }))
        // Sort: supported first, then by USD value desc
        .sort((a, b) => {
          if (a.isOdosSupported !== b.isOdosSupported) {
            return a.isOdosSupported ? -1 : 1
          }
          return b.usdValue - a.usdValue
        })
    },
    enabled: !!address && chainId > 0,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })
}

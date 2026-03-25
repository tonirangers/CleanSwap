import { useQuery } from '@tanstack/react-query'
import { erc20Abi } from 'viem'
import { usePublicClient } from 'wagmi'
import { fetchWalletTokens } from '@/api/zerion'
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

      // Fetch ALL wallet tokens from Zerion
      const walletTokens = await fetchWalletTokens(address, chainId)

      console.log(`[DustTokens] Wallet has ${walletTokens.length} tokens on ${chainConfig.name}`)

      // Include ALL tokens with balance, even if $0 value:
      // - Tokens WITH value: must be under dust threshold
      // - Tokens WITHOUT value ($0): include them too — Odos might still route them
      //   (Zerion doesn't price every token, but they may have liquidity on-chain)
      const dustTokens = walletTokens.filter(
        (t) => t.usdValue === 0 || t.usdValue <= chainConfig.minimumDustInUSD,
      )

      if (dustTokens.length === 0) {
        console.log('[DustTokens] No dust tokens found')
        return []
      }

      console.log(`[DustTokens] Found ${dustTokens.length} dust tokens (${dustTokens.filter(t => t.usdValue === 0).length} unpriced)`)

      // Batch check allowances via multicall
      const spender = ODOS_V3_ROUTER as `0x${string}`
      const approvalCalls = dustTokens.map((t) => ({
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
        console.warn('[DustTokens] Multicall failed:', err)
        allowances = dustTokens.map(() => 0n)
      }

      return dustTokens
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
          isOdosSupported: true,
          permit2Approved: allowances[i] > 0n,
        }))
        // Sort: priced tokens first (by value desc), then unpriced at bottom
        .sort((a, b) => {
          if (a.usdValue > 0 && b.usdValue === 0) return -1
          if (a.usdValue === 0 && b.usdValue > 0) return 1
          return b.usdValue - a.usdValue
        })
    },
    enabled: !!address && chainId > 0,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })
}

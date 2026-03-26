import { useQuery } from '@tanstack/react-query'
import { erc20Abi } from 'viem'
import { usePublicClient } from 'wagmi'
import { fetchWalletTokens } from '@/api/zerion'
import { getChainConfig } from '@/config/chains'
import { PERMIT2_ADDRESS } from '@/config/constants'
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

      // Include ALL tokens with balance, even if $0 value
      const dustTokens = walletTokens.filter(
        (t) => t.usdValue === 0 || t.usdValue <= chainConfig.minimumDustInUSD,
      )

      if (dustTokens.length === 0) {
        console.log('[DustTokens] No dust tokens found')
        return []
      }

      console.log(`[DustTokens] Found ${dustTokens.length} dust tokens (${dustTokens.filter(t => t.usdValue === 0).length} unpriced)`)

      // Batch check allowances against both Permit2 AND per-chain Odos Router
      const permit2Spender = PERMIT2_ADDRESS as `0x${string}`
      const routerSpender = chainConfig.odosRouterAddress

      const permit2Calls = dustTokens.map((t) => ({
        address: t.address as `0x${string}`,
        abi: erc20Abi,
        functionName: 'allowance' as const,
        args: [address, permit2Spender] as const,
      }))

      const routerCalls = dustTokens.map((t) => ({
        address: t.address as `0x${string}`,
        abi: erc20Abi,
        functionName: 'allowance' as const,
        args: [address, routerSpender] as const,
      }))

      let permit2Allowances: bigint[] = []
      let routerAllowances: bigint[] = []
      try {
        const [permit2Results, routerResults] = await Promise.all([
          publicClient.multicall({ contracts: permit2Calls }),
          publicClient.multicall({ contracts: routerCalls }),
        ])
        permit2Allowances = permit2Results.map((r) =>
          r.status === 'success' ? (r.result as bigint) : 0n,
        )
        routerAllowances = routerResults.map((r) =>
          r.status === 'success' ? (r.result as bigint) : 0n,
        )
      } catch (err) {
        console.warn('[DustTokens] Multicall failed:', err)
        permit2Allowances = dustTokens.map(() => 0n)
        routerAllowances = dustTokens.map(() => 0n)
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
          permit2Approved: permit2Allowances[i] > 0n,
          routerApproved: routerAllowances[i] > 0n,
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

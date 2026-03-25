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

      // Filter dust tokens (below minimumDustInUSD threshold, above $0)
      const dustTokens = walletTokens.filter(
        (t) => t.usdValue > 0 && t.usdValue <= chainConfig.minimumDustInUSD,
      )

      if (dustTokens.length === 0) return []

      // Batch check Permit2 approvals via multicall
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
      } catch {
        allowances = dustTokens.map(() => 0n)
      }

      return dustTokens.map((t, i) => ({
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
    },
    enabled: !!address && chainId > 0,
    staleTime: 30_000,
  })
}

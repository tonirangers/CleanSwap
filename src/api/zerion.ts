import { ZERION_BASE_URL } from '@/config/constants'

interface ZerionPosition {
  id: string
  type: string
  attributes: {
    quantity: {
      int: string
      decimals: number
      float: number
      numeric: string
    }
    value: number | null
    price: number
    changes: Record<string, unknown> | null
    fungible_info: {
      name: string
      symbol: string
      icon: { url: string } | null
      implementations: {
        chain_id: string
        address: string | null
        decimals: number
      }[]
    }
  }
}

interface ZerionResponse {
  data: ZerionPosition[]
}

export interface WalletToken {
  address: string
  symbol: string
  name: string
  decimals: number
  balance: string
  balanceFormatted: number
  usdPrice: number
  usdValue: number
  logoUrl?: string
}

// Chain ID to Zerion chain name mapping
const chainIdToZerion: Record<number, string> = {
  1: 'ethereum',
  56: 'binance-smart-chain',
  42161: 'arbitrum',
  137: 'polygon',
  43114: 'avalanche',
  8453: 'base',
  10: 'optimism',
  250: 'fantom',
  324: 'zksync-era',
  34443: 'mode',
  59144: 'linea',
}

export async function fetchWalletTokens(
  address: string,
  chainId: number,
): Promise<WalletToken[]> {
  const zerionChain = chainIdToZerion[chainId]
  if (!zerionChain) return []

  const apiKey = import.meta.env.VITE_ZERION_API_KEY

  // If no Zerion API key, fall back to Odos pricing
  if (!apiKey) {
    return fetchWalletTokensFallback(address, chainId)
  }

  const url = `${ZERION_BASE_URL}/wallets/${address}/positions/?filter[chain_ids]=${zerionChain}&currency=usd&filter[position_types]=wallet&sort=value`

  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${btoa(apiKey + ':')}`,
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Zerion API error (${response.status})`)
  }

  const data: ZerionResponse = await response.json()

  return data.data
    .filter((pos) => {
      // Only fungible tokens with a contract address (skip native token)
      const impl = pos.attributes.fungible_info.implementations.find(
        (i) => i.chain_id === zerionChain,
      )
      return impl?.address != null
    })
    .map((pos) => {
      const impl = pos.attributes.fungible_info.implementations.find(
        (i) => i.chain_id === zerionChain,
      )!
      return {
        address: impl.address!,
        symbol: pos.attributes.fungible_info.symbol,
        name: pos.attributes.fungible_info.name,
        decimals: impl.decimals,
        balance: pos.attributes.quantity.int,
        balanceFormatted: pos.attributes.quantity.float,
        usdPrice: pos.attributes.price,
        usdValue: pos.attributes.value ?? 0,
        logoUrl: pos.attributes.fungible_info.icon?.url,
      }
    })
}

// Fallback: use Odos pricing API directly when Zerion key is not available
async function fetchWalletTokensFallback(
  _address: string,
  _chainId: number,
): Promise<WalletToken[]> {
  // TODO: Implement fallback using on-chain multicall + Odos pricing
  // For now, return empty — Zerion API key required
  console.warn('No Zerion API key configured. Set VITE_ZERION_API_KEY in .env')
  return []
}

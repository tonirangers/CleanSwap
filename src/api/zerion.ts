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
  links?: { next?: string }
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

  if (!apiKey) {
    console.warn('No Zerion API key configured. Set VITE_ZERION_API_KEY in .env')
    return []
  }

  // Encode the full Zerion API path as a query param to avoid Vercel rewrite issues
  const zerionPath = `/wallets/${address}/positions/?filter[chain_ids]=${zerionChain}&currency=usd&filter[position_types]=wallet&sort=value`
  const url = `/api/zerion?url=${encodeURIComponent(zerionPath)}`

  console.log(`[Zerion] Fetching tokens for ${address} on ${zerionChain}`)

  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${btoa(apiKey + ':')}`,
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    console.error(`Zerion API error (${response.status}):`, errorText)
    throw new Error(`Token scan failed (${response.status})`)
  }

  const data: ZerionResponse = await response.json()

  if (!data.data || data.data.length === 0) {
    console.log('[Zerion] No positions found for', address, 'on', zerionChain)
    return []
  }

  console.log(`[Zerion] Found ${data.data.length} positions on ${zerionChain}`)

  return data.data
    .filter((pos) => {
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

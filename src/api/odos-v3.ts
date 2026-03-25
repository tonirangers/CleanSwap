import { NATIVE_TOKEN_ADDRESS, REFERRAL_CODE } from '@/config/constants'

// Always use proxy — Vite dev server and Vercel rewrites handle routing
function odosUrl(path: string): string {
  return `/api/odos${path}`
}

export interface OdosQuoteRequest {
  chainId: number
  inputTokens: { tokenAddress: string; amount: string }[]
  userAddr: string
  slippageLimitPercent: number
  referralCode?: number
  signal?: AbortSignal
}

export interface Permit2Message {
  domain: Record<string, unknown>
  types: Record<string, unknown[]>
  primaryType: string
  message: Record<string, unknown>
}

export interface OdosQuoteResponse {
  pathId: string
  outAmounts: string[]
  outValues: number[]
  gasEstimate: number
  gasEstimateValue: number
  pathVizImage?: string
  // Permit2 fields — populated when user has approved tokens to Permit2
  permit2Message?: Permit2Message | null
  permit2Hash?: string | null
}

export interface OdosAssembleResponse {
  transaction: {
    to: string
    data: string
    value: string
    from: string
    gasPrice?: string
    gas?: string
    chainId: number
  }
  simulation?: {
    isSuccess: boolean
    simulationError?: {
      errorMessage: string
    }
  }
}

export async function getOdosQuote(params: OdosQuoteRequest): Promise<OdosQuoteResponse> {
  const response = await fetch(odosUrl('/sor/quote/v2'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chainId: params.chainId,
      inputTokens: params.inputTokens,
      outputTokens: [
        { tokenAddress: NATIVE_TOKEN_ADDRESS, proportion: 1 },
      ],
      userAddr: params.userAddr,
      slippageLimitPercent: params.slippageLimitPercent,
      referralCode: params.referralCode ?? REFERRAL_CODE,
      compact: true,
    }),
    signal: params.signal,
  })

  if (!response.ok) {
    const text = await response.text().catch(() => 'Unknown error')
    throw new Error(`Odos quote failed (${response.status}): ${text}`)
  }

  return response.json()
}

export async function assembleOdosTransaction(params: {
  userAddr: string
  pathId: string
  simulate?: boolean
  permit2Signature?: string
}): Promise<OdosAssembleResponse> {
  const body: Record<string, unknown> = {
    userAddr: params.userAddr,
    pathId: params.pathId,
    simulate: params.simulate ?? true,
  }

  // Include Permit2 signature if available — Odos will use swapMultiPermit2
  if (params.permit2Signature) {
    body.permit2Signature = params.permit2Signature
  }

  const response = await fetch(odosUrl('/sor/assemble'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => 'Unknown error')
    throw new Error(`Odos assemble failed (${response.status}): ${text}`)
  }

  return response.json()
}

export async function getOdosSupportedTokens(chainId: number): Promise<Set<string>> {
  const response = await fetch(odosUrl(`/info/tokens/${chainId}`))
  if (!response.ok) return new Set()

  const data = await response.json()
  const tokens = new Set<string>()

  if (data.tokenMap) {
    for (const addr of Object.keys(data.tokenMap)) {
      tokens.add(addr.toLowerCase())
    }
  }

  return tokens
}

export async function getOdosTokenPrice(chainId: number, tokenAddress: string): Promise<number | null> {
  const response = await fetch(odosUrl(`/pricing/token/${chainId}/${tokenAddress}`))
  if (!response.ok) return null

  const data = await response.json()
  return data.price ?? null
}

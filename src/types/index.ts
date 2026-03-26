export interface ChainConfig {
  id: number
  name: string
  symbol: string
  network: string
  nativeTokenAddress: `0x${string}`
  minimumDustInUSD: number
  referralCode: number
  enabled: boolean
  explorerUrl: string
}

export interface DustToken {
  address: `0x${string}`
  symbol: string
  name: string
  decimals: number
  balance: bigint
  balanceFormatted: string
  usdPrice: number
  usdValue: number
  logoUrl?: string
  isOdosSupported: boolean
  permit2Approved: boolean
  routerApproved: boolean
}

export interface SweepQuote {
  pathId: string
  inputTokens: { tokenAddress: string; amount: string }[]
  outputAmounts: string[]
  outputValuesUsd: number[]
  gasEstimate: number
  gasEstimateUsd: number
  pathVizImage?: string
}

export interface SweepBatch {
  id: number
  tokens: DustToken[]
  quote?: SweepQuote
  status: 'pending' | 'quoting' | 'signing' | 'executing' | 'done' | 'error'
  txHash?: `0x${string}`
  error?: string
}

export type SweepStatus =
  | 'idle'
  | 'scanning'
  | 'approving'
  | 'signing'
  | 'sweeping'
  | 'done'
  | 'error'

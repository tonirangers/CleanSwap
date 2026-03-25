import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number, options?: { maxDecimals?: number; minDecimals?: number }): string {
  const { maxDecimals = 6, minDecimals = 0 } = options ?? {}

  if (value === 0) return '0'
  if (value < 0.000001) return '<0.000001'

  const formatted = value.toFixed(maxDecimals)
  // Remove trailing zeros but keep at least minDecimals
  const parts = formatted.split('.')
  if (!parts[1]) return parts[0]

  let decimals = parts[1].replace(/0+$/, '')
  if (decimals.length < minDecimals) {
    decimals = decimals.padEnd(minDecimals, '0')
  }

  return decimals.length > 0 ? `${parts[0]}.${decimals}` : parts[0]
}

export function formatUsd(value: number): string {
  if (value < 0.01) return '<$0.01'
  return `$${formatNumber(value, { maxDecimals: 2, minDecimals: 2 })}`
}

export function truncateAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export function explorerTxUrl(explorerUrl: string, txHash: string): string {
  return `${explorerUrl}/tx/${txHash}`
}

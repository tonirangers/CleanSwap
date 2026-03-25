import { useMemo } from 'react'
import { MAX_TOKENS_PER_BATCH } from '@/config/constants'
import type { DustToken, SweepBatch } from '@/types'

export function useBatchStrategy(tokens: DustToken[]): SweepBatch[] {
  return useMemo(() => {
    if (tokens.length === 0) return []

    // Sort by USD value descending — highest value dust first
    const sorted = [...tokens].sort((a, b) => b.usdValue - a.usdValue)

    const batches: SweepBatch[] = []
    for (let i = 0; i < sorted.length; i += MAX_TOKENS_PER_BATCH) {
      batches.push({
        id: batches.length,
        tokens: sorted.slice(i, i + MAX_TOKENS_PER_BATCH),
        status: 'pending',
      })
    }

    return batches
  }, [tokens])
}

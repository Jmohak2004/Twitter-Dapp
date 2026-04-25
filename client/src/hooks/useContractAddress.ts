import { useEffect, useState } from 'react'
import { type Address, isAddress } from 'viem'

export function useContractAddress() {
  const fromEnv = import.meta.env.VITE_CONTRACT_ADDRESS as string | undefined
  const [fromApi, setFromApi] = useState<Address | null>(null)
  const [tried, setTried] = useState(false)

  useEffect(() => {
    if (fromEnv) return
    const base =
      (import.meta.env.VITE_API_URL as string | undefined) ?? ''
    const url = base ? `${base.replace(/\/$/, '')}/api/contract` : '/api/contract'
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('bad status'))))
      .then((d: { address?: string }) => {
        if (d?.address && isAddress(d.address)) {
          setFromApi(d.address)
        }
      })
      .catch(() => {
        // Server optional; VITE fallback only
      })
      .finally(() => {
        setTried(true)
      })
  }, [fromEnv])

  if (fromEnv && isAddress(fromEnv)) {
    return { address: fromEnv as Address, source: 'env' as const, ready: true }
  }
  if (fromApi) {
    return { address: fromApi, source: 'api' as const, ready: true }
  }
  return { address: undefined, source: undefined, ready: tried || !fromEnv }
}

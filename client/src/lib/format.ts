import type { Address } from 'viem'

export function shortAddress(addr: string, left = 6, right = 4) {
  if (addr.length <= left + right) return addr
  return `${addr.slice(0, left)}…${addr.slice(-right)}`
}

export function formatAuthor(addr: Address, handle: string) {
  const h = handle.trim()
  if (h.length > 0) return `@${h}`
  return shortAddress(addr)
}

const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

export function timeAgoFromUnix(ts: bigint) {
  const sec = Number(ts)
  const now = Date.now() / 1000
  const diff = now - sec
  if (diff < 60) return formatter.format(-Math.round(Math.max(1, diff)), 'second')
  if (diff < 3600) {
    return formatter.format(-Math.round(diff / 60), 'minute')
  }
  if (diff < 86400) {
    return formatter.format(-Math.round(diff / 3600), 'hour')
  }
  if (diff < 86400 * 7) {
    return formatter.format(-Math.round(diff / 86400), 'day')
  }
  return new Date(sec * 1000).toLocaleDateString()
}

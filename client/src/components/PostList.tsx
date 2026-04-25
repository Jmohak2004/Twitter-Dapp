import { useMemo, useEffect } from 'react'
import {
  useAccount,
  useReadContract,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import type { Address } from 'viem'
import { twitterAbi } from '../abi/contract'
import { timeAgoFromUnix, formatAuthor } from '../lib/format'

const MAX_FEED = 200

type Props = { contract: Address; enabled: boolean }

type RowPost = {
  id: bigint
  author: Address
  content: string
  timestamp: bigint
  likeCount: bigint
  exists: boolean
}

export function PostList({ contract, enabled }: Props) {
  const { address: user, isConnected } = useAccount()
  const queryClient = useQueryClient()
  const { data: count, isLoading: countLoading } = useReadContract({
    address: contract,
    abi: twitterAbi,
    functionName: 'postCount',
    query: { enabled: enabled, refetchInterval: 10_000 },
  })

  const ids = useMemo((): bigint[] => {
    if (count == null) return []
    const c = Number(count)
    if (c < 1) return []
    const n = Math.min(MAX_FEED, c)
    return Array.from({ length: n }, (_, i) => BigInt(c - i))
  }, [count])

  const { data: getResults, isLoading: getLoading } = useReadContracts({
    allowFailure: true,
    contracts: ids.map((postId) => ({
      address: contract,
      abi: twitterAbi,
      functionName: 'getPost' as const,
      args: [postId],
    })),
    query: { enabled: enabled && ids.length > 0 },
  })

  const posts = useMemo((): RowPost[] => {
    if (!getResults) return []
    const out: RowPost[] = []
    getResults.forEach((r, i) => {
      const id = ids[i]
      if (id === undefined) return
      if (r.status !== 'success' || r.result == null) return
      const t = r.result as readonly [Address, string, bigint, bigint, boolean]
      const [author, content, timestamp, likeCount, exists] = t
      if (exists) {
        out.push({ id, author, content, timestamp, likeCount, exists })
      }
    })
    return out
  }, [getResults, ids])

  const uniqueAuthors = useMemo(() => {
    const s = new Set<string>()
    for (const p of posts) s.add(p.author)
    return [...s] as Address[]
  }, [posts])

  const { data: nameResults } = useReadContracts({
    allowFailure: true,
    contracts: uniqueAuthors.map((a) => ({
      address: contract,
      abi: twitterAbi,
      functionName: 'profileHandle' as const,
      args: [a],
    })),
    query: { enabled: enabled && uniqueAuthors.length > 0 },
  })

  const handleBy = useMemo(() => {
    const m = new Map<string, string>()
    if (!nameResults) return m
    uniqueAuthors.forEach((a, i) => {
      const r = nameResults[i]
      if (r?.status === 'success' && typeof r.result === 'string') {
        m.set(a.toLowerCase(), r.result)
      }
    })
    return m
  }, [nameResults, uniqueAuthors])

  const { data: likeResults, isLoading: likeLoading } = useReadContracts({
    allowFailure: true,
    contracts:
      user && posts.length
        ? posts.map((p) => ({
            address: contract,
            abi: twitterAbi,
            functionName: 'hasLiked' as const,
            args: [user, p.id],
          }))
        : [],
    query: { enabled: enabled && isConnected && !!user && posts.length > 0 },
  })

  const { writeContract, data: actHash, isPending, reset: resetAct } = useWriteContract()
  const { isLoading: actConfirming, isSuccess: actSuccess } = useWaitForTransactionReceipt({
    hash: actHash,
  })

  useEffect(() => {
    if (actSuccess) {
      void queryClient.invalidateQueries()
      resetAct()
    }
  }, [actSuccess, queryClient, resetAct])

  if (!enabled) {
    return null
  }
  if (countLoading) {
    return <p className="muted">Loading post count…</p>
  }
  if (count == null) {
    return <p className="error-text">Could not read the contract. Check the address and network.</p>
  }
  if (count === 0n) {
    return <p className="muted">No posts yet. Be the first to post.</p>
  }
  if (getLoading) {
    return <p className="muted">Loading feed…</p>
  }

  return (
    <section className="feed" aria-label="On-chain feed">
      <h2 className="feed-title">Feed</h2>
      {posts.length === 0 ? (
        <p className="muted">No visible posts in the latest window.</p>
      ) : (
        <ul className="post-list">
          {posts.map((p, idx) => {
            const h = handleBy.get(p.author.toLowerCase()) ?? ''
            const liked =
              !likeLoading &&
              likeResults?.[idx]?.status === 'success' &&
              likeResults[idx]?.result === true
            const isAuthor = user && p.author.toLowerCase() === user.toLowerCase()
            return (
              <li key={p.id.toString()} className="post-card">
                <div className="post-meta">
                  <span className="author">{formatAuthor(p.author, h)}</span>
                  <time className="time" dateTime={new Date(Number(p.timestamp) * 1000).toISOString()}>
                    {timeAgoFromUnix(p.timestamp)}
                  </time>
                </div>
                <p className="post-body">{p.content}</p>
                <div className="post-actions">
                  <span className="like-count">{p.likeCount.toString()} likes</span>
                  {isConnected && user && (
                    <button
                      type="button"
                      className="btn sm ghost"
                      disabled={likeLoading || isPending || actConfirming}
                      onClick={() => {
                        writeContract({
                          address: contract,
                          abi: twitterAbi,
                          functionName: liked ? 'unlikePost' : 'likePost',
                          args: [p.id],
                        })
                      }}
                    >
                      {liked ? 'Unlike' : 'Like'}
                    </button>
                  )}
                  {isAuthor && (
                    <button
                      type="button"
                      className="btn sm danger"
                      disabled={isPending || actConfirming}
                      onClick={() => {
                        writeContract({
                          address: contract,
                          abi: twitterAbi,
                          functionName: 'deletePost',
                          args: [p.id],
                        })
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

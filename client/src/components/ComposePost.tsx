import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Address } from 'viem'
import { twitterAbi } from '../abi/contract'

type Props = { contract: Address; enabled: boolean }

export function ComposePost({ contract, enabled }: Props) {
  const { isConnected } = useAccount()
  const [text, setText] = useState('')
  const queryClient = useQueryClient()
  const { data: maxPostLen } = useReadContract({
    address: contract,
    abi: twitterAbi,
    functionName: 'MAX_POST_LENGTH',
    query: { enabled: enabled && isConnected },
  })
  const max =
    maxPostLen != null && typeof maxPostLen === 'bigint' ? Number(maxPostLen) : 280
  const { writeContract, data: hash, error: writeError, isPending, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const remaining = max - text.length
  const canPost =
    isConnected && text.length > 0 && text.length <= max && !isPending && !isConfirming

  useEffect(() => {
    if (!isSuccess) return
    setText('')
    void queryClient.invalidateQueries()
    reset()
  }, [isSuccess, queryClient, reset])

  if (!isConnected) {
    return <p className="muted">Connect your wallet to post on-chain.</p>
  }

  return (
    <section className="card compose-card">
      <h2>New post</h2>
      <textarea
        className="textarea"
        value={text}
        maxLength={max}
        placeholder="What is happening?"
        rows={3}
        onChange={(e) => {
          setText(e.target.value)
        }}
      />
      <div className="compose-footer">
        <span className={remaining < 0 ? 'error-text' : 'muted small'}>
          {remaining} characters left
        </span>
        <button
          type="button"
          className="btn primary"
          disabled={!canPost}
          onClick={() => {
            writeContract({
              address: contract,
              abi: twitterAbi,
              functionName: 'createPost',
              args: [text],
            })
          }}
        >
          {isPending || isConfirming ? 'Posting…' : 'Post'}
        </button>
      </div>
      {writeError && <p className="error-text">{writeError.message}</p>}
    </section>
  )
}

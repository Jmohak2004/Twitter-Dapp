import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { isValidHandle, MAX_HANDLE_LEN, MIN_HANDLE_LEN } from '../lib/handleValidation'
import { useQueryClient } from '@tanstack/react-query'
import type { Address } from 'viem'
import { twitterAbi } from '../abi/contract'
import { formatAuthor } from '../lib/format'

type Props = { contract: Address; enabled: boolean }

export function ProfilePanel({ contract, enabled }: Props) {
  const { address, isConnected } = useAccount()
  const [edit, setEdit] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { data: onChainHandle } = useReadContract({
    address: contract,
    abi: twitterAbi,
    functionName: 'profileHandle',
    args: address ? [address] : undefined,
    query: { enabled: enabled && isConnected && !!address },
  })
  const { data: minLen } = useReadContract({
    address: contract,
    abi: twitterAbi,
    functionName: 'MIN_HANDLE_LENGTH',
    query: { enabled: enabled && isConnected },
  })
  const { data: maxLen } = useReadContract({
    address: contract,
    abi: twitterAbi,
    functionName: 'MAX_HANDLE_LENGTH',
    query: { enabled: enabled && isConnected },
  })
  const { writeContract, data: hash, error: writeError, isPending, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    if (!isSuccess) return
    setEdit(null)
    void queryClient.invalidateQueries()
    reset()
  }, [isSuccess, queryClient, reset])

  if (!isConnected || !address) {
    return <p className="muted">Connect a wallet to set your @handle.</p>
  }

  const fromChain = typeof onChainHandle === 'string' ? onChainHandle : ''
  const value = edit !== null ? edit : fromChain
  const canSave = isValidHandle(value) && !isPending && !isConfirming
  const min =
    minLen != null && typeof minLen === 'bigint' ? Number(minLen) : MIN_HANDLE_LEN
  const max =
    maxLen != null && typeof maxLen === 'bigint' ? Number(maxLen) : MAX_HANDLE_LEN

  return (
    <section className="card profile-card">
      <h2>Profile</h2>
      <p className="muted small">
        Current:{' '}
        <strong>
          {fromChain && isValidHandle(fromChain) ? formatAuthor(address, fromChain) : '— not set —'}
        </strong>
      </p>
      <div className="row">
        <label htmlFor="handle-input" className="visually-hidden">
          Handle
        </label>
        <input
          id="handle-input"
          className="input"
          value={value}
          maxLength={max}
          placeholder={`${min}–${max} chars, letters, numbers, _`}
          onChange={(e) => {
            setEdit(e.target.value)
          }}
        />
        <button
          type="button"
          className="btn primary"
          disabled={!canSave}
          onClick={() => {
            writeContract({
              address: contract,
              abi: twitterAbi,
              functionName: 'setProfile',
              args: [value],
            })
          }}
        >
          {isPending || isConfirming ? 'Saving…' : 'Save handle'}
        </button>
      </div>
      {writeError && <p className="error-text">{writeError.message}</p>}
    </section>
  )
}

import { useAccount, useSwitchChain, useChainId } from 'wagmi'
import { preferredChain, preferredChainId } from '../lib/chains'

export function NetworkGuard() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain, isPending } = useSwitchChain()
  const wrong = isConnected && chainId !== preferredChainId

  if (!wrong) return null

  return (
    <div className="network-guard" role="alert">
      <p>Switch to {preferredChain.name} to use the dapp (chain {preferredChainId}).</p>
      <button
        type="button"
        className="btn primary"
        disabled={isPending}
        onClick={() => switchChain({ chainId: preferredChainId })}
      >
        {isPending ? 'Switching…' : `Use ${preferredChain.name}`}
      </button>
    </div>
  )
}

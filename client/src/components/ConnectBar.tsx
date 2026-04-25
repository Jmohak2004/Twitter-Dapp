import { useAccount, useChainId, useConnect, useDisconnect } from 'wagmi'
import { shortAddress } from '../lib/format'
import { preferredChainId } from '../lib/chains'

export function ConnectBar() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending, error } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const okChain = !isConnected || chainId === preferredChainId

  return (
    <header className="connect-bar">
      <div className="brand">Chain Twitter</div>
      <div className="connect-actions">
        {error && (
          <span className="error-text small" title={error.message}>
            {error.message}
          </span>
        )}
        {isConnected && address && (
          <span className="wallet-id" title={address}>
            {okChain ? shortAddress(address) : 'Wrong network'}
          </span>
        )}
        {isConnected ? (
          <button type="button" className="btn ghost" onClick={() => disconnect()}>
            Disconnect
          </button>
        ) : (
          <button
            type="button"
            className="btn primary"
            disabled={isPending}
            onClick={() => {
              const c = connectors[0]
              if (c) {
                void connect({ connector: c })
              }
            }}
          >
            {isPending ? 'Connecting…' : 'Connect wallet'}
          </button>
        )}
      </div>
    </header>
  )
}

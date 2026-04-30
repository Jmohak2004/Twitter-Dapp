import { useAccount, useSwitchChain, useChainId } from 'wagmi'
import { hardhat, sepolia } from 'viem/chains'
import { preferredChain, preferredChainId } from '../lib/chains'

export function NetworkGuard() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain, isPending } = useSwitchChain()
  const wrong = isConnected && chainId !== preferredChainId

  const walletOnSepolia = chainId === sepolia.id
  const appWantsHardhat = preferredChainId === hardhat.id
  const walletOnHardhat = chainId === hardhat.id
  const appWantsSepolia = preferredChainId === sepolia.id

  if (!wrong) return null

  return (
    <div className="network-guard" role="alert">
      <p>
        This app is configured for <strong>{preferredChain.name}</strong> (chain {preferredChainId}
        ). Your wallet is on a different network.
      </p>
      <button
        type="button"
        className="btn primary"
        disabled={isPending}
        onClick={() => switchChain({ chainId: preferredChainId })}
      >
        {isPending ? 'Switching…' : `Switch to ${preferredChain.name}`}
      </button>

      {walletOnSepolia && appWantsHardhat && (
        <p className="network-guard-hint small muted">
          If you meant to use <strong>Sepolia</strong> (not local Hardhat), add{' '}
          <code>VITE_PREFERRED_CHAIN_ID=11155111</code> and your <strong>Sepolia</strong> contract
          address as <code>VITE_CONTRACT_ADDRESS</code> in <code>client/.env</code>, then restart{' '}
          <code>npm run dev</code>. The Hardhat address from <code>deploy:local</code> does not work
          on Sepolia — deploy the contract to Sepolia first.
        </p>
      )}

      {walletOnHardhat && appWantsSepolia && (
        <p className="network-guard-hint small muted">
          Add the Sepolia network in your wallet if needed, then switch. You need a small amount of
          Sepolia ETH for gas.
        </p>
      )}
    </div>
  )
}

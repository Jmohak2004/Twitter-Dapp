import { useAccount } from 'wagmi'
import { useContractAddress } from './hooks/useContractAddress'
import { ConnectBar } from './components/ConnectBar'
import { NetworkGuard } from './components/NetworkGuard'
import { ProfilePanel } from './components/ProfilePanel'
import { ComposePost } from './components/ComposePost'
import { PostList } from './components/PostList'
import { preferredChain } from './lib/chains'
import './App.css'

function App() {
  const { isConnected, chain } = useAccount()
  const { address: contract, ready } = useContractAddress()
  const onPreferredChain = chain?.id === undefined || chain.id === preferredChain.id
  const canUseContract = Boolean(
    isConnected && contract && onPreferredChain
  )

  return (
    <div className="app">
      <ConnectBar />
      <NetworkGuard />
      <main className="main">
        {(!ready || !contract) && (
          <p className="lede">Posts, likes, and @handles — on-chain. Connect a wallet to read and write.</p>
        )}

        {!ready && <p className="muted">Resolving contract address…</p>}
        {ready && !contract && (
          <div className="callout" role="status">
            <p>
              <strong>No contract configured.</strong> Set <code>VITE_CONTRACT_ADDRESS=0x…</code> in{' '}
              <code>client/.env</code>, or run the server with <code>CONTRACT_ADDRESS</code> (Vite
              proxies <code>/api/contract</code> in dev).
            </p>
            <p className="callout-commands small muted">
              <span>Local:</span> <code>npm run node</code> + <code>npm run deploy:local</code> in{' '}
              <code>contracts/</code> — deploy script updates <code>.env</code>.
            </p>
            <p className="callout-commands small muted">
              <span>Sepolia:</span> deploy there, same address in <code>.env</code>, add{' '}
              <code>VITE_PREFERRED_CHAIN_ID=11155111</code>, pick Sepolia in your wallet.
            </p>
          </div>
        )}

        {ready && contract && (
          <p className="contract-line muted small">
            <code className="addr">{contract}</code> · {preferredChain.name}
          </p>
        )}

        {ready && contract && (
          <div className="grid">
            <ProfilePanel contract={contract} enabled={canUseContract} />
            <ComposePost contract={contract} enabled={canUseContract} />
            <div className="span-2">
              <PostList contract={contract} enabled={!!contract} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App

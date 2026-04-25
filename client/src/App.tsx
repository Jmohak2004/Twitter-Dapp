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
        <p className="lede">
          A minimal Twitter-style feed on Ethereum: posts, likes, and handles are stored in{' '}
          <code>DecentralizedTwitter</code>. Use Hardhat (chain <strong>31337</strong>) for local
          development, or switch to <strong>Sepolia</strong> in your wallet and set{' '}
          <code>VITE_PREFERRED_CHAIN_ID=11155111</code> when you deploy there.
        </p>

        {!ready && <p className="muted">Resolving contract address…</p>}
        {ready && !contract && (
          <div className="callout" role="status">
            <p>
              <strong>No contract address found.</strong> Deploy the contract, then set{' '}
              <code>VITE_CONTRACT_ADDRESS</code> in <code>client/.env</code> or set{' '}
              <code>CONTRACT_ADDRESS</code> in the server (see <code>server/.env</code>).
            </p>
            <p className="small muted">
              Start chain: <code>npm run node</code> in <code>contracts</code> · deploy:{' '}
              <code>npm run deploy:local</code>
            </p>
          </div>
        )}

        {ready && contract && (
          <p className="contract-line muted small">
            Contract: <code className="addr">{contract}</code> · network: {preferredChain.name}
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

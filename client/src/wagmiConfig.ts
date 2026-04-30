import { createConfig, http } from 'wagmi'
import { hardhat, sepolia } from 'viem/chains'
import { injected } from 'wagmi/connectors'

const localRpc = import.meta.env.VITE_HARDHAT_RPC ?? 'http://127.0.0.1:8545'
const sepoliaRpc = import.meta.env.VITE_SEPOLIA_RPC ?? 'https://rpc.sepolia.org'

/** Fails fast instead of “Loading…” forever when nothing listens on 8545, etc. */
const transportOpts = { timeout: 15_000 as const }

export const config = createConfig({
  chains: [hardhat, sepolia],
  connectors: [injected()],
  transports: {
    [hardhat.id]: http(localRpc, transportOpts),
    [sepolia.id]: http(sepoliaRpc, transportOpts),
  },
  ssr: false,
})

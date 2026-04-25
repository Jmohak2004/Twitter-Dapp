import { createConfig, http } from 'wagmi'
import { hardhat, sepolia } from 'viem/chains'
import { injected } from 'wagmi/connectors'

const localRpc = import.meta.env.VITE_HARDHAT_RPC ?? 'http://127.0.0.1:8545'
const sepoliaRpc = import.meta.env.VITE_SEPOLIA_RPC ?? 'https://rpc.sepolia.org'

export const config = createConfig({
  chains: [hardhat, sepolia],
  connectors: [injected()],
  transports: {
    [hardhat.id]: http(localRpc),
    [sepolia.id]: http(sepoliaRpc),
  },
  ssr: false,
})

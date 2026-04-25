import { hardhat, sepolia } from 'viem/chains'

const pid = Number(import.meta.env.VITE_PREFERRED_CHAIN_ID) || 31337

export const preferredChain = pid === 11155111 ? sepolia : hardhat
export const preferredChainId = preferredChain.id

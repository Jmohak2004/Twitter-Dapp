import { hardhat, sepolia } from 'viem/chains'

/**
 * Which chain the UI treats as "home" (NetworkGuard + contract reads).
 * - Default 31337 = local Hardhat (matches `npm run deploy:local`).
 * - Set VITE_PREFERRED_CHAIN_ID=11155111 for Sepolia, then restart `npm run dev`.
 * You must also set VITE_CONTRACT_ADDRESS to a contract deployed on that same chain.
 */
const pid = Number(import.meta.env.VITE_PREFERRED_CHAIN_ID) || 31337

export const preferredChain = pid === 11155111 ? sepolia : hardhat
export const preferredChainId = preferredChain.id

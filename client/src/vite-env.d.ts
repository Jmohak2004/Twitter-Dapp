/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTRACT_ADDRESS?: string
  readonly VITE_API_URL?: string
  readonly VITE_HARDHAT_RPC?: string
  readonly VITE_SEPOLIA_RPC?: string
  /** 31337 (Hardhat) or 11155111 (Sepolia) */
  readonly VITE_PREFERRED_CHAIN_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http } from 'wagmi'
import {
  bsc,
  base,
  mainnet,
  arbitrum,
  polygon,
  avalanche,
  optimism,
  fantom,
  zkSync,
  mode,
  linea,
} from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'CleanSwap',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '37a1ee8cab4dec8b64af48eb3dc77834',
  chains: [bsc, base, mainnet, arbitrum, polygon, avalanche, optimism, fantom, zkSync, mode, linea],
  transports: {
    [mainnet.id]: http(),
    [bsc.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
    [polygon.id]: http(),
    [avalanche.id]: http(),
    [optimism.id]: http(),
    [fantom.id]: http(),
    [zkSync.id]: http(),
    [mode.id]: http(),
    [linea.id]: http(),
  },
})

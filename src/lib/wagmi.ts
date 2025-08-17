import { createConfig, http } from 'wagmi';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// Define Monad chain configuration
const monadChain = {
  id: 41500,
  name: 'Monad',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: { 
      name: 'Monad Explorer', 
      url: 'https://explorer.monad.xyz',
      apiUrl: 'https://api.explorer.monad.xyz'
    },
  },
} as const;

export const config = getDefaultConfig({
  appName: 'AZKAMI Staking',
  projectId: 'default',
  chains: [monadChain as any],
  ssr: false,
});
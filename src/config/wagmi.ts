import { BASE_RPC_ENDPOINT, BSC_RPC_ENDPOINT, ETH_RPC_ENDPOINT } from '@/constants';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'viem';
import {
  mainnet,
  polygon,
  arbitrum,
  base,
  sepolia,
  cronos,
  bsc,
  bscTestnet,
  baseSepolia,
} from 'wagmi/chains';

const projectId = '51a8a52bcc0730097ea92eed587f88cb'; // Replace with your WalletConnect Project ID

export const config = getDefaultConfig({
  appName: 'Bridge',
  projectId,
  chains: [
    mainnet,
    polygon,
    arbitrum,
    base,
    bsc,
    cronos,
    bscTestnet,
    baseSepolia,
    sepolia,
  ],
  transports: {
    [mainnet.id]: http(ETH_RPC_ENDPOINT),
    [bsc.id]: http(BSC_RPC_ENDPOINT),
    [base.id]: http(BASE_RPC_ENDPOINT)
  },
  ssr: true,
});

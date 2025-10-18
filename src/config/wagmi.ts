import { BASE_RPC_ENDPOINT, 
		 BSC_RPC_ENDPOINT, 
		 ETH_RPC_ENDPOINT, 
		 TICS_RPC_ENDPOINT } from '@/constants';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'viem';
import { tics } from './ticsMainnet';
import { ticsTestnet } from './ticsTestnet';
import {
  mainnet,
  base,
  sepolia,
  bsc,
  bscTestnet,
  baseSepolia,
} from 'wagmi/chains';

const projectId = 'ddb178684424212b84e1152976b6a519'; // QubeBridge

export const config = getDefaultConfig({
  appName: 'QubeBridge',
  projectId,
  chains: [
    mainnet,
    base,
    bsc,
	tics,
    bscTestnet,
	ticsTestnet,
    baseSepolia,
    sepolia,
  ],
  transports: {
    [mainnet.id]: http(ETH_RPC_ENDPOINT),
    [bsc.id]: http(BSC_RPC_ENDPOINT),
    [base.id]: http(BASE_RPC_ENDPOINT),
	[tics.id]: http(TICS_RPC_ENDPOINT)
  },
  ssr: true,
});

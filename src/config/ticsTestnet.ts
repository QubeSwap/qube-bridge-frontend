import { defineChain } from 'viem'; // or import { Chain } from 'wagmi' and define manually

export const ticsTestnet = defineChain({
    id: 9029, // Unique chain ID
    name: 'Qubetics Testnet',
    network: 'ticsTestnet',
    nativeCurrency: {
      decimals: 18,
      name: 'Qubetics Testnet',
      symbol: 'TICS',
    },
    rpcUrls: {
      default: {
        http: ['https://rpc-testnet.qubetics.work'],
      },
      public: {
        http: ['https://rpc-testnet.qubetics.work'],
      },
    },
    blockExplorers: {
      default: {
        name: 'Qubetics Testnet Explorer',
        url: 'https://https://testnet-v2.qubetics.work/',
      },
    },
    //iconUrl: 'https://example.com/my-custom-chain-icon.png', // Optional icon
    //iconBackground: '#FF00FF', // Optional background color for the icon
});
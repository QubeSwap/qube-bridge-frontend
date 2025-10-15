import { defineChain } from 'viem'; // or import { Chain } from 'wagmi' and define manually

export const tics = defineChain({
    id: 9030, // Unique chain ID
    name: 'Qubetics',
    network: 'ticsMainnet',
    nativeCurrency: {
      decimals: 18,
      name: 'Qubetics',
      symbol: 'TICS',
    },
    rpcUrls: {
      default: {
        http: ['https://rpc.qubetics.com'],
      },
      public: {
        http: ['https://rpc.qubetics.com'],
      },
    },
    blockExplorers: {
      default: {
        name: 'Qubetics Explorer',
        url: 'https://v2.ticsscan.com/',
      },
    },
    //iconUrl: 'https://example.com/my-custom-chain-icon.png', // Optional icon
    //iconBackground: '#FF00FF', // Optional background color for the icon
});
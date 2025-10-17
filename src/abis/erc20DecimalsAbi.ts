// src/abis/erc20DecimalsAbi.ts
export const erc20DecimalsAbi = [
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8", // ERC-20 standard specifies uint8 for decimals
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

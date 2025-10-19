import * as dotenv from 'dotenv';
dotenv.config();

export const retrieveEnvVariable = (variableName: string) => {
    const variable = process.env[variableName] || '';
    if (!variable) {
      console.log(`${variableName} is not set`);
      process.exit(1);
    }
    return variable;
  };

export const ETH_RPC_ENDPOINT = process.env.NEXT_PUBLIC_ETH_RPC_ENDPOINT || "" ;
export const BSC_RPC_ENDPOINT = process.env.NEXT_PUBLIC_BSC_RPC_ENDPOINT || "" ;
export const BASE_RPC_ENDPOINT = process.env.NEXT_PUBLIC_BASE_RPC_ENDPOINT || "" ;
export const TICS_RPC_ENDPOINT = process.env.NEXT_PUBLIC_TICS_RPC_ENDPOINT || "" ;

export const BNB_ChainId = 56 // 97;
export const BASE_ChainId = 8453 //84532;
export const ETHEREUM_ChainId = 1 // 11155111;
export const QUBETICS_ChainId = 9030 // 9029;

export const CHAIN_LIST = [
  {
    chain: "BNB",
    id: 56
  },
  {
    chain: "QUBETICS",
    id: 90230
  },
  {
    chain: "ETHEREUM",
    id: 1
  },
  {
    chain: "BASE",
    id: 8453
  }
]

export const ADMIN_WALLET_ADDRESS = process.env.NEXT_PUBLIC_MAIN_WALLET_ADDRESS || "" ;
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

export const BNB_tokenAddress = "0x4ae9656e67557e55f2f4ca719a2e2429041b1730";
export const BNB_USDCAddress = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";

export const Ether_tokenAddress = "0xbc9c3be7bb3605aae053bcc4d514643b0525bd13";
export const Ether_USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

export const Base_tokenAddress = "0xa5ee6Bf543d032E0cB4DA2057ef0b40941EAe8Bc";    
export const Base_USDCAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";     

export const BNB_BRIDGE_CONTRACT = "0xa5ee6bf543d032e0cb4da2057ef0b40941eae8bc";
export const BASE_BRIDGE_CONTRACT = "0xa357ba150811ff04bd739d92622a10185df4b3cc"; 
export const ETHEREUM_BRIDGE_CONTRACT = "0xa5ee6bf543d032e0cb4da2057ef0b40941eae8bc";

export const BNB_ChainId = 56 // 97;
export const BASE_ChainId = 8453 //84532;
export const ETHEREUM_ChainId = 1 // 11155111;
export const QUBETICS_ChainId = 9030 // 9029;

export const CHAIN_LIST = [
  {
    chain: "ETHERIUM",
    id: 1
  },
  {
    chain: "BASE",
    id: 8453
  },
  {
    chain: "BNB",
    id: 56
  },
  {
    chain: "QUBETICS",
    id: 9029
  }
]

export const ADMIN_WALLET_ADDRESS = process.env.NEXT_PUBLIC_MAIN_WALLET_ADDRESS || "" ;
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

export const ETH_RPC_ENDPOINT = process.env.NEXT_PUBLIC_ETH_RPC_ENDPOINT || "";    
export const ETH_BRIDGE_CONTRACT = "0xa5ee6bf543d032e0cb4da2057ef0b40941eae8bc";

export const ETH_tokenAddress = "0xbc9c3be7bb3605aae053bcc4d514643b0525bd13";
export const ETH_USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
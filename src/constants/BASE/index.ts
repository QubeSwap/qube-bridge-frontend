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

export const BASE_RPC_ENDPOINT = process.env.NEXT_PUBLIC_BASE_RPC_ENDPOINT || "";
export const BASE_BRIDGE_CONTRACT = "0xa357ba150811ff04bd739d92622a10185df4b3cc";

export const BASE_tokenAddress = "0xa5ee6Bf543d032E0cB4DA2057ef0b40941EAe8Bc";
export const BASE_USDCAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
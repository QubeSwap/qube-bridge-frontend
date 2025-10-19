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

export const BASE_BRIDGE_CONTRACT = "0xa357ba150811ff04bd739d92622a10185df4b3cc";

export const BASE_USDT_Address = "0xa5ee6Bf543d032E0cB4DA2057ef0b40941EAe8Bc";
export const BASE_USDC_Address = "0xa5";

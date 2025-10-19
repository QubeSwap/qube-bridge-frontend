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
   
export const BNB_BRIDGE_CONTRACT = "0xa5ee6bf543d032e0cb4da2057ef0b40941eae8bc";

export const BNB_USDT_Address = "0x4ae9656e67557e55f2f4ca719a2e2429041b1730";
export const BNB_QST_Address = "0x4";

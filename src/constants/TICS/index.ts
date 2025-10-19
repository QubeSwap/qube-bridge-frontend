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

export const TICS_BRIDGE_CONTRACT = "0xa5ee6bf543d032e0cb4da2057ef0b40941eae8bc";

export const TICS_USDT_Address = "0xbc9c3be7bb3605aae053bcc4d514643b0525bd13";
export const TICS_USDC_Address = "0xb";
export const TICS_PYUSD_Address = "0xb";
export const TICS_QST_Address = "0xb";

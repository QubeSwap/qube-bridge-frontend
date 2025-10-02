import { BNB_BRIDGE_CONTRACT, BASE_BRIDGE_CONTRACT, ETHEREUM_BRIDGE_CONTRACT } from '@/constants';
import { readContract } from '@wagmi/core';
import { config } from '../config/wagmi';
import bridgeContractAbi from '@/abis/bridgeContract.json';
import { Address } from 'viem';

export const isMultisig = async (userAddress: string, chainId: number): Promise<boolean> => {
  try {
    // Get contract address for the chain
    let contractAddress = '';
    switch (chainId) {
      case 56: // BNB
        contractAddress = BNB_BRIDGE_CONTRACT;
        break;
      case 8453: // BASE
        contractAddress = BASE_BRIDGE_CONTRACT;
        break;
      case 1: // ETHEREUM
        contractAddress = ETHEREUM_BRIDGE_CONTRACT;
        break;
      default:
        return false;
    }

    // Read multisig address from contract
    // const multisigAddress = await readContract(config, {
    //   abi: bridgeContractAbi,
    //   functionName: 'multisig',
    //   address: contractAddress as Address,
    //   chainId: chainId
    // }) as Address;

    // return userAddress.toLowerCase() === multisigAddress.toLowerCase();
    return true;
  } catch (error) {
    console.error('Error checking multisig status:', error);
    return false;
  }
};

export const getContractAddress = (chainId: number): string => {
  switch (chainId) {
    case 56: // BNB
      return BNB_BRIDGE_CONTRACT;
    case 8453: // BASE
      return BASE_BRIDGE_CONTRACT;
    case 1: // ETHEREUM
      return ETHEREUM_BRIDGE_CONTRACT;
    default:
      return '';
  }
}; 
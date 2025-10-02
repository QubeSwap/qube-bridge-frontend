import Contract from '@/abis/Contract.json';
import ERC20 from '@/abis/erc20.json';
import TokenAbi from '@/abis/tokenAbi.json';
import BridgeContract from '@/abis/bridgeContract.json';
import { ContractAbi } from 'web3';

export const CONTRACT_ABI = Contract;

export function get_erc20_abi(): ContractAbi {
  return ERC20;
}

export function get_token_abi(): ContractAbi {
  return TokenAbi;
}

export function get_bridge_abi(): ContractAbi {
  return BridgeContract;
}

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

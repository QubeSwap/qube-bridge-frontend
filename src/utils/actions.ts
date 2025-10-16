import { writeContract } from '@wagmi/core';
import { config } from '../config/wagmi';
import { Address, parseUnits } from 'viem';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { toast } from 'react-toastify';
import { BNB_ChainId, 
		 BASE_ChainId, 
		 ETHEREUM_ChainId,  
		 QUBETICS_ChainId } from '@/constants';

import { BNB_BRIDGE_CONTRACT, 
		 ETHEREUM_BRIDGE_CONTRACT, 
		 BASE_BRIDGE_CONTRACT,  
		 QUBETICS_BRIDGE_CONTRACT } from '@/constants';

import { BNB_USDCAddress, 
		 Ether_USDCAddress, 
		 Base_USDCAddress,
		 Qubetics_USDCAddress } from '@/constants';		 

import bridgeContractAbi from '@/abis/bridgeContract.json';

export interface IVolume {
  user: Address;
  volume: BigInt;
}

export const approveAndBridge = async (
  tokenAddress: string,
  amount: any,
  receiver: Address,
  srcChainId: number,
  destChainId: number,
  onProgress?: (step: number) => void
) => {
  try {
    console.log("tokenAddress ==> ", tokenAddress)
    console.log("receiver ==> ", receiver)
    console.log("amount ==> ", amount)
    console.log("chianId ==> ", srcChainId)

    if (amount == 0) {
      return toast.warning("invalid amount")
    }
    let BridgeContractAddress: Address | undefined;
    // let ApproveUsdcAddress: Address | undefined;

    if (srcChainId == BNB_ChainId) {
      console.log("BSC contract selected ===")
      BridgeContractAddress = BNB_BRIDGE_CONTRACT
    }
    else if (srcChainId == BASE_ChainId) {
      console.log("base contract selected ====")
      BridgeContractAddress = BASE_BRIDGE_CONTRACT
    }
    else if (srcChainId == ETHEREUM_ChainId) {
      console.log("ether contract selected ====")
      BridgeContractAddress = ETHEREUM_BRIDGE_CONTRACT
    }
	else if (srcChainId == QUBETICS_ChainId) {
      console.log("qubetics contract selected ====")
      BridgeContractAddress = QUBETICS_BRIDGE_CONTRACT
    }

    if (!BridgeContractAddress) {
      throw new Error("Unsupported srcChainId: missing Bridge contract address");
    }

    
    const feePercent = 100; // 1% (should fetch from contract in production)
    let feeAmount;
    feeAmount = (BigInt(amount) * BigInt(feePercent)) / BigInt(10000);
	//
    const totalAmount = BigInt(amount) + feeAmount; // Only approve the bridge amount, contract will take fee internally

    // Step 1: Approve token for bridge contract
    if (onProgress) onProgress(1);
    let tokenApprove = await writeContract(config, {
      abi: [{
        "constant": false,
        "inputs": [
          { "name": "_spender", "type": "address" },
          { "name": "_value", "type": "uint256" }
        ],
        "name": "approve",
        "outputs": [{ "name": "", "type": "bool" }],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      }],
      functionName: "approve",
      address: tokenAddress as Address,
      args: [BridgeContractAddress, totalAmount],
      gas: BigInt(100000)
    }).then(async (hash) => {
      console.log("Approve token Tx:", hash);
      toast.warning('Please wait');
      await waitForTransactionReceipt(config, { hash });
      return true
    }).catch((reason) => {
      console.log("Approve token failed:", reason);
      toast.error("Transaction failed");
      return false
    });

    if (tokenApprove) {
      toast.success("Approve token success")
      // Step 2: Bridge tokens
      if (onProgress) onProgress(2);
      const bridgeResult = await writeContract(config, {
        abi: bridgeContractAbi,
        functionName: "bridge",
        address: BridgeContractAddress as Address,
        args: [tokenAddress as Address, receiver, amount, BigInt(Number(destChainId))]
      }).then(async (hash) => {
        console.log("Bridge Tx:", hash);
        toast.warning('Please wait');
        await waitForTransactionReceipt(config, { hash });
        return true
      }).catch((reason) => {
        console.log("Bridge failed:", reason);
        toast.error("Transaction failed");
        return false
      });

      console.log("bridgeResult ==> ", bridgeResult)
      if (bridgeResult) {
        toast.success("Bridge Success")
      }
    }
  } catch (err) {
    console.log("Approve and bridge error ==> ", err)
  }
}

// Admin functions for multisig operations
export const adminFunctions = {
  setWhitelist: async (user: string, status: boolean, chainId: number) => {
    const contractAddress = getContractAddress(chainId);
    if (!contractAddress) throw new Error("Invalid chain ID");
    
    return await writeContract(config, {
      abi: bridgeContractAbi,
      functionName: "setWhitelist",
      address: contractAddress as Address,
      args: [user as Address, status]
    });
  },

  updateFeePercent: async (newPercent: number, chainId: number) => {
    const contractAddress = getContractAddress(chainId);
    if (!contractAddress) throw new Error("Invalid chain ID");
    
    return await writeContract(config, {
      abi: bridgeContractAbi,
      functionName: "updateFeePercent",
      address: contractAddress as Address,
      args: [BigInt(newPercent)]
    });
  },

  updateController: async (newController: string, chainId: number) => {
    const contractAddress = getContractAddress(chainId);
    if (!contractAddress) throw new Error("Invalid chain ID");
    
    return await writeContract(config, {
      abi: bridgeContractAbi,
      functionName: "updateController",
      address: contractAddress as Address,
      args: [newController as Address]
    });
  },

  updateMultisig: async (newMultisig: string, chainId: number) => {
    const contractAddress = getContractAddress(chainId);
    if (!contractAddress) throw new Error("Invalid chain ID");
    
    return await writeContract(config, {
      abi: bridgeContractAbi,
      functionName: "updateMultisig",
      address: contractAddress as Address,
      args: [newMultisig as Address]
    });
  },

  withdrawETH: async (to: string, chainId: number) => {
    const contractAddress = getContractAddress(chainId);
    if (!contractAddress) throw new Error("Invalid chain ID");
    
    return await writeContract(config, {
      abi: bridgeContractAbi,
      functionName: "withdrawETH",
      address: contractAddress as Address,
      args: [to as Address]
    });
  },

  withdrawERC20: async (tokenAddress: string, to: string, chainId: number) => {
    const contractAddress = getContractAddress(chainId);
    if (!contractAddress) throw new Error("Invalid chain ID");
    
    return await writeContract(config, {
      abi: bridgeContractAbi,
      functionName: "withdrawERC20",
      address: contractAddress as Address,
      args: [tokenAddress as Address, to as Address]
    });
  }
};

function getContractAddress(chainId: number): string | null {
  switch (chainId) {
    case BNB_ChainId:
      return BNB_BRIDGE_CONTRACT;
    case BASE_ChainId:
      return BASE_BRIDGE_CONTRACT;
    case ETHEREUM_ChainId:
      return ETHEREUM_BRIDGE_CONTRACT;
	case QUBETICS_ChainId:
      return QUBETICS_BRIDGE_CONTRACT;
    default:
      return null;
  }
}
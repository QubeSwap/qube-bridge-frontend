//actions.ts

import { useReadContract } from "wagmi";
import { writeContract } from '@wagmi/core';
import { config } from '../config/wagmi';
import { Address, parseUnits } from 'viem';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { toast } from 'react-toastify';

import { 
	BNB_ChainId, 
	BASE_ChainId, 
	ETHEREUM_ChainId,  
	QUBETICS_ChainId 
} from '@/constants';

import { 
  BNB_BRIDGE_CONTRACT
} from '@/constants/BNB';
import {  
  ETH_BRIDGE_CONTRACT
} from '@/constants/ETH';
import {  
  BASE_BRIDGE_CONTRACT 
} from '@/constants/BASE';
import {  
  TICS_BRIDGE_CONTRACT 
} from '@/constants/TICS';

import {
  BNB_USDT_Address,
  BNB_QST_Address
} from '@/constants/BNB';
import {
  ETH_USDT_Address,
  ETH_USDC_Address,
  ETH_PYUSD_Address,
  ETH_QST_Address
} from '@/constants/ETH';
import {
  BASE_USDT_Address,
  BASE_USDC_Address
} from '@/constants/BASE';
import {
  TICS_USDT_Address,
  TICS_USDC_Address,
  TICS_PYUSD_Address,
  TICS_QST_Address
} from '@/constants/TICS';
 
//
import bridgeContractAbi from '@/abis/bridgeContract.json';
// Import the new ABI
import { erc20DecimalsAbi } from '@/abis/erc20DecimalsAbi';

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
      console.log("bsc contract selected ===")
      BridgeContractAddress = BNB_BRIDGE_CONTRACT
    }
    else if (srcChainId == BASE_ChainId) {
      console.log("base contract selected ====")
      BridgeContractAddress = BASE_BRIDGE_CONTRACT
    }
    else if (srcChainId == ETHEREUM_ChainId) {
      console.log("ether contract selected ====")
      BridgeContractAddress = ETH_BRIDGE_CONTRACT
    }
	else if (srcChainId == QUBETICS_ChainId) {
      console.log("qubetics contract selected ====")
      BridgeContractAddress = TICS_BRIDGE_CONTRACT
    }

    if (!BridgeContractAddress) {
      throw new Error("Unsupported srcChainId: missing Bridge contract address");
    }
	
	const chainIndexToTokenAddress = [
		//ETHEREUM
		ETH_USDT_Address,
		ETH_USDC_Address,
		ETH_PYUSD_Address,
		ETH_QST_Address,
		//BNB
		BNB_USDT_Address,
		BNB_QST_Address,
		//BASE
		BASE_USDT_Address,
		BASE_USDC_Address,
		//QUBETICS
		TICS_USDT_Address,
		TICS_USDC_Address,
		TICS_PYUSD_Address,
		TICS_QST_Address
	];
	
	// NOTE: The decimal value for ETH is 18. This may vary for other tokens.
	// For a production app, you would need to fetch the decimals for the selected token.
	//const TOKEN_DECIMALS = 18;
	
	// The decimals is fetched from tokenAddress
	const tokenAddress = chainIndexToTokenAddress[chain];

	// Fetch token decimals
	const { data: tokenDecimalsData, isLoading: isDecimalsLoading } = useReadContract({
		address: tokenAddress,
		abi: erc20DecimalsAbi,
		functionName: "decimals",
		query: { enabled: !!tokenAddress }
	});

	const [tokenDecimals, setTokenDecimals] = useState<number | undefined>(undefined);
	useEffect(() => {
		if (tokenDecimalsData !== undefined) {
			setTokenDecimals(Number(tokenDecimalsData));
		}
	}, [tokenDecimalsData]);

	//const FEE_PERCENT = BigInt(100);
	const SCALE = BigInt(10000);

	// Fetch the fee percentage from the smart contract
	const { data: feePercentData, isLoading: isFeeLoading, error: feeError } = useReadContract({
		address: BridgeContractAddress,
		abi: bridgeContractAbi,
		functionName: "feePercent",
		// Only fetch if a valid contract address exists
		query: { enabled: !!BridgeContractAddress }
	});

	const [feePercent, setFeePercent] = useState<bigint>(BigInt(100)); // Default to 1%

	// Update the feePercent state when the contract data is loaded
	useEffect(() => {
		if (feePercentData !== undefined) {
			setFeePercent(feePercentData);
		}
	}, [feePercentData]);
	
	const bigIntAmount = parseUnits(value, tokenDecimals);
	let feeAmount;
	//feeAmount = (bigIntAmount * FEE_PERCENT) / SCALE;
	// Use the fetched feePercent for calculation
	feeAmount = (bigIntAmount * feePercent) / SCALE;
	//
    const totalAmount = bigIntAmount + feeAmount; // Approve the total amount included fee.

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
      return ETH_BRIDGE_CONTRACT;
	case QUBETICS_ChainId:
      return TICS_BRIDGE_CONTRACT;
    default:
      return null;
  }
}
//SwapSide.tsx
'use client';

import { useReadContract } from "wagmi";
import { useEffect, useState } from "react";
import TokenSelect from "./TokenSelect";
import { useAccount, useChainId, useConfig } from "wagmi";
import { useAppContext } from "@/context/AppContext";
import InputSkeleton from "./InputSkeleton";
//import { get_erc20_abi } from '@/utils';
//import bridgeContractAbi from '@/abis/bridgeContract.json';

// Import Viem utilities
import { Address, parseUnits, formatUnits } from "viem";

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

// Import the new ABI
import { bridgeFeeContractAbi } from '@/abis/bridgeFeeContractAbi';
// Import the new ABI
import { erc20DecimalsAbi } from '@/abis/erc20DecimalsAbi';

interface SwapSideProps {
  className?: string;
  disabled?: boolean;
  chain?: number;
  opChain?: number;
  amount?: string; // Change amount to string to match BigInt input
  setChain?: (value: any) => void;
  setAmount?: (value: string) => void; // Change setAmount to use string
  isFirst?: boolean;
  balance?: string; // Change balance to string to match BigInt input
}

// Contract addresses for different chains
const chainIdToBridgeContractAddress: { [key: number]: Address } = {
  // Bridge Contract Address from each ChainId
  [ETHEREUM_ChainId]: ETH_BRIDGE_CONTRACT,
  [BASE_ChainId]: BASE_BRIDGE_CONTRACT,
  [BNB_ChainId]: BNB_BRIDGE_CONTRACT,
  [QUBETICS_ChainId]: TICS_BRIDGE_CONTRACT
};

// NOTE: The decimal value for ETH is 18. This may vary for other tokens.
// For a production app, you would need to fetch the decimals for the selected token.
//const tokenDecimals = 18;

const SCALE = BigInt(10000);

export const SwapUSDC = SwapSide;

export default function SwapSide({ className = "", disabled = false, chain = 0, opChain, setChain, amount, setAmount = () => { }, isFirst = false, balance = "0" }: SwapSideProps) {
  const config = useConfig();
  const { address } = useAccount();
  const { isQuoteLoading, isAbleSwap, setIsAbleSwap } = useAppContext();
  const [isWarning, setIsWarning] = useState(false);
  const [totalWithFee, setTotalWithFee] = useState(BigInt(0));
  const { isSwapped } = useAppContext();
  
	// Map chain index to chainId and token address
	const chainIndexToChainId = [
		ETHEREUM_ChainId,
		BASE_ChainId,
		BNB_ChainId,
		QUBETICS_ChainId
	];
							   
	const chainIndexToTokenAddress = [
		ETH_USDT_Address,
		ETH_USDC_Address,
		ETH_PYUSD_Address,
		ETH_QST_Address,
		BNB_USDT_Address,
		BNB_QST_Address,
		BASE_USDT_Address,
		BASE_USDC_Address,
		TICS_USDT_Address,
		TICS_USDC_Address,
		TICS_PYUSD_Address,
		TICS_QST_Address
	];
  
  // Get the chainId from wagmi, reflecting the user's connected network
  const chainId = useChainId();
  
  // Find the correct contract address based on the current chain
  const BridgeContractAddress = chainIdToBridgeContractAddress[chainId];
  
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
  
  // Fetch the fee percentage from the smart contract
	const { data: feePercentData, isLoading: isFeeLoading, error: feeError } = useReadContract({
		address: BridgeContractAddress,
		abi: bridgeFeeContractAbi,
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
	

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);

    // Reset state for empty input
    if (value === "") {
      setIsWarning(false);
      setIsAbleSwap(false);
      setTotalWithFee(BigInt(0));
      return;
    }

    try {
	  // 1. Parse the user's decimal string value into the base integer unit (Wei).	
	  const bigIntAmount = parseUnits(value, tokenDecimals);
	  
	  // Use the fetched feePercent for calculation
	  const feeAmount = (bigIntAmount * feePercent) / SCALE;
	  
      const calculatedTotal = bigIntAmount + feeAmount;
      setTotalWithFee(calculatedTotal);

      // Perform balance check with BigInt values
      const bigIntBalance = BigInt(balance);
      if (calculatedTotal > bigIntBalance) {
        setIsWarning(true);
        setIsAbleSwap(false);
      } else {
        setIsWarning(false);
        setIsAbleSwap(true);
      }
    } catch (error) {
      // Handle non-numeric input gracefully
      console.error("Invalid number format for BigInt conversion", error);
      setIsWarning(true);
      setIsAbleSwap(false);
    }
  };

  const selectMax = () => {
    try {
      // Use Viem to convert the string balance into BigInt
      const bigIntBalance = parseUnits(balance, tokenDecimals);
      
      // Calculate the approximate fee to subtract from the total balance
      // Note: This is an estimation. For maximum precision, you might need a more complex calculation.
      const maxAmountFee = (bigIntBalance * feePercent) / (SCALE + feePercent);
      const maxSendableAmount = bigIntBalance - maxAmountFee;

      // Convert the BigInt amount back to a string for the input field
      const formattedMaxAmount = formatUnits(maxSendableAmount, tokenDecimals);
      
      // Update the state
      setAmount(formattedMaxAmount);
      setTotalWithFee(bigIntBalance); // The total will be the full balance
      setIsWarning(false);
      setIsAbleSwap(true);
    } catch (error) {
      console.error("Failed to set max amount", error);
    }
  };

  return (
    <div className={`bg-[#341309] px-4 py-9 relative rounded-2xl ${className}`}>
      <div className="absolute right-4 top-2 z-20">
        {
          isFirst && (
            <div className="flex items-center gap-3 text-[#d84f25]">
              Balance: <span>{balance}</span>
              {!disabled && (
                <button
                  onClick={selectMax}
                  className="bg-primary-gray-300 text-xs text-white px-2 rounded-md hover:cursor-pointer hover:shadow-[#BD4822] hover:text-gray-400 hover:shadow-button hover:bg-primary-gray-300/80"
                >
                  MAX
                </button>
              )}
            </div>
          )
        }
      </div>
      <div className="flex items-center justify-between gap-3">
        <TokenSelect chain={chain} opChain={opChain} setChain={setChain} isFirst={isFirst} />
        <div className="flex items-center w-2/3">
          {disabled && isQuoteLoading ? <InputSkeleton /> :
            <input
              className={`bg-transparent w-full text-right focus:outline-0 font-bold pr-2 text-2xl px-3 h-9 z-20 ${isWarning || !isAbleSwap ? "text-red-400" : "text-white"}`}
              value={amount ? amount : ""}
              placeholder="0.00"
              type="number"
              disabled={disabled}
              onChange={handleAmountChange}
            />}
        </div>
      </div>
      {isFirst && (
        <div className="text-right text-2xs mt-2 text-gray-200">
		  Total amount to be sent (including 1% fee): {formatUnits(totalWithFee, tokenDecimals)}
        </div>
      )}
      <div className="flex justify-end w-1/2 h-full absolute right-0 top-0"></div>
    </div>
  );
}

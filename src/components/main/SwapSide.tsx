//SwapSide.tsx
'use client';

import { useEffect, useState } from "react";
import TokenSelect from "./TokenSelect";
import { useAccount, useChainId, useConfig } from "wagmi";
import { useAppContext } from "@/context/AppContext";
import InputSkeleton from "./InputSkeleton";
import { get_erc20_abi } from '@/utils';

// Import Viem utilities
import { Address, parseUnits, formatUnits } from "viem";

import {
  BNB_ChainId,
  BASE_ChainId,
  ETHEREUM_ChainId,
  QUBETICS_ChainId
} from '@/constants';

import {
  BNB_tokenAddress,
  Ether_tokenAddress,
  Base_tokenAddress,
  Qubetics_tokenAddress
} from '@/constants';

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

// NOTE: The decimal value for ETH is 18. This may vary for other tokens.
// For a production app, you would need to fetch the decimals for the selected token.
const TOKEN_DECIMALS = 18;

const FEE_PERCENT = BigInt(100); // 1% scaled by 100 for BigInt (100 * 100 = 10000)
const SCALE = BigInt(10000);

export default function SwapSide({ className = "", disabled = false, chain = 0, opChain, setChain, amount, setAmount = () => { }, isFirst = false, balance = "0" }: SwapSideProps) {
  const config = useConfig();
  const { address } = useAccount();
  const chainId = useChainId();
  const { isQuoteLoading, isAbleSwap, setIsAbleSwap } = useAppContext();
  const [isWarning, setIsWarning] = useState(false);
  const [totalWithFee, setTotalWithFee] = useState(BigInt(0));
  const { isSwapped } = useAppContext();

  // Map chain index to chainId and token address
  const chainIndexToChainId = [ETHEREUM_ChainId,
							   BASE_ChainId,
							   BNB_ChainId,
							   QUBETICS_ChainId];
  const chainIndexToTokenAddress = [Ether_tokenAddress,
									Base_tokenAddress,
									BNB_tokenAddress,
									Qubetics_tokenAddress];

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
	  const bigIntAmount = parseUnits(value, TOKEN_DECIMALS);	
	  
      const feeAmount = (bigIntAmount * FEE_PERCENT) / SCALE;
	  
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
    // Note: This needs careful consideration for how fees are handled on max.
    // If the fee is included, you may need to reduce the amount slightly.
    // For now, we'll set the amount to the balance, which will trigger the warning.
    // You could also calculate `amount = balance - fee` here.
    setAmount(balance);
  };

  return (
    <div className={`bg-[#282f2bb3] px-4 py-9 relative rounded-2xl ${className}`}>
      <div className="absolute right-4 top-4 z-20">
        {
          isFirst && (
            <div className="flex items-center gap-2">
              Balance: <span>{balance}</span>
              {!disabled && (
                <button
                  onClick={selectMax}
                  className="bg-primary-gray-300 text-xs text-white px-2 rounded-md hover:cursor-pointer hover:shadow-blue-400 hover:text-blue-400 hover:shadow-button hover:bg-primary-gray-300/80"
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
              className={`bg-transparent w-full text-right focus:outline-0 font-bold pr-2 text-2xl px-3 h-12 z-20 ${isWarning || !isAbleSwap ? "text-red-400" : "text-white"}`}
              value={amount ? amount : ""}
              placeholder="0.00"
              type="number"
              disabled={disabled}
              onChange={handleAmountChange}
            />}
        </div>
      </div>
      {isFirst && (
        <div className="text-right text-2xs mt-2 text-gray-400">
		  Total amount to be sent (including fee): {formatUnits(totalWithFee, TOKEN_DECIMALS)}
        </div>
      )}
      <div className="flex justify-end w-1/2 h-full absolute right-0 top-0"></div>
    </div>
  );
}

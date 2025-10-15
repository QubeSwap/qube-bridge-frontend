// SwapSide.tsx
'use client';

import { useEffect, useState } from "react";
import TokenSelect from "./TokenSelect";
import { useAccount, useChainId, useConfig } from "wagmi";
import { Address } from "viem";
import { useAppContext } from "@/context/AppContext";
import InputSkeleton from "./InputSkeleton";
import { get_erc20_abi } from '@/utils';
import { BNB_ChainId, BASE_ChainId, ETHEREUM_ChainId, BNB_tokenAddress, Ether_tokenAddress, Base_tokenAddress } from '@/constants';

interface SwapSideProps {
  className?: string;
  disabled?: boolean;
  chain?: number;
  opChain?: number;
  amount?: number;
  setChain?: (value: any) => void;
  setAmount?: (value: any) => void;
  isFirst?: boolean;
  balance?: number;
}

export default function SwapSide({ className = "", disabled = false, chain = 0, opChain, setChain, amount, setAmount = () => { }, isFirst = false, balance = 0 }: SwapSideProps) {
  const config = useConfig();
  const { address } = useAccount();
  const chainId = useChainId();
  const { isQuoteLoading, isAbleSwap, setIsAbleSwap } = useAppContext();
  const [isWarning, setIsWarning] = useState(false);
  const { isSwapped } = useAppContext();

  // Map chain index to chainId and token address
  const chainIndexToChainId = [ETHEREUM_ChainId, BASE_ChainId, BNB_ChainId];
  const chainIndexToTokenAddress = [Ether_tokenAddress, Base_tokenAddress, BNB_tokenAddress];

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (parseFloat(value) > balance) {
      setIsWarning(true);
      setIsAbleSwap(false);
    } else {
      setIsWarning(false);
      setIsAbleSwap(true);
    }
    setAmount(value);
  };

  const selectMax = () => {
    setAmount(balance);
  }

  return (
    <div className={`bg-[#282f2bb3] px-4 py-9 relative rounded-2xl ${className}`}>
      <div className="absolute right-4 top-4 z-20">
        {
          isFirst == true ?
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
            :
            <></>
        }
      </div>
      <div className="flex items-center justify-between gap-3">
        <TokenSelect chain={chain} opChain={opChain} setChain={setChain} isFirst={isFirst} />
        <div className="flex items-center w-2/3">
          {disabled && isQuoteLoading ? <InputSkeleton /> :
            <input
              className={`bg-transparent w-full text-right focus:outline-0 font-bold pr-2 text-2xl px-3 h-12 z-20 ${isWarning || !isAbleSwap ? "text-red-400" : "text-white"}`}
              value={amount ? amount : ""}
              placeholder="0"
              type="number"
              disabled={disabled}
              onChange={handleAmountChange}
            />}
        </div>
      </div>
      <div className="flex justify-end w-1/2 h-full absolute right-0 top-0"></div>
    </div>
  );
}
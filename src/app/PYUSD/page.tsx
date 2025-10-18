'use client'
//PYUSD
import SwapSide from "@/components/main/SwapPYUSD"
import ActionButton from "@/components/ActionButton"
import AdminPanel from "@/components/AdminPanel"
import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { toast } from "react-toastify"
import { useAppContext } from "@/context/AppContext"
import { ADMIN_WALLET_ADDRESS, CHAIN_LIST } from "@/constants"
import { useAccount, useChainId, useConfig } from "wagmi";
import { Address } from "viem";
import { get_erc20_abi } from '@/utils';

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
  Tics_tokenAddress	
} from '@/constants';		

export default function Page() {
  const [baseChain, setBaseChain] = useState(0);
  const [quoteChain, setQuoteChain] = useState(1);
  const [baseAmount, setBaseAmount] = useState(0);
  const [quoteAmount, setQuoteAmount] = useState(0);
  const [isSwapping, setIsSwapping] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const { setIsQuoteLoading, swapChange } = useAppContext();
  const { address } = useAccount();
  const config = useConfig();
  const chainId = useChainId();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    setBaseAmount(0); // Reset on mount/refresh
  }, []);

  useEffect(() => {
    async function fetchBalance() {
      if (!address) {
        setBalance(0);
        return;
      }
      const chainIndexToChainId = [
			ETHEREUM_ChainId, 
			BASE_ChainId,
			BNB_ChainId,
			QUBETICS_ChainId
		];
      const chainIndexToTokenAddress = [
			Ether_tokenAddress, 
			Base_tokenAddress,
			BNB_tokenAddress,
			Tics_tokenAddress
		];
      const selectedChainId = chainIndexToChainId[baseChain];
      const tokenAddress = chainIndexToTokenAddress[baseChain];
      const abi = get_erc20_abi();
      let bal = 0;
      try {
        const decimals = 18;
        const { readContract } = await import('@wagmi/core');
        const tokenBalance = await readContract(config, {
          abi,
          functionName: 'balanceOf',
          address: tokenAddress as Address,
          args: [address],
          chainId: selectedChainId
        });
        bal = parseFloat((Number(tokenBalance) / Math.pow(10, decimals)).toFixed(3));
      } catch (e) {
        bal = 0;
      }
      setBalance(bal);
    }
    fetchBalance();
  }, [baseChain, address, config, chainId]);

  const handleBaseChainChange = (newChain: number) => {
    setBaseChain(newChain);
    // If the new base chain is the same as quote chain, change quote chain to a different one
    if (newChain === quoteChain) {
      const availableChains = CHAIN_LIST.filter((_, index) => index !== newChain);
      if (availableChains.length > 0) {
        const newQuoteChainIndex = CHAIN_LIST.indexOf(availableChains[0]);
        setQuoteChain(newQuoteChainIndex);
      }
    }
  };

  const changeQuote = async () => {
    // Here you would implement chain-specific quote logic
    setQuoteAmount(baseAmount); // Placeholder
  }
  useEffect(() => {
    changeQuote()
  }, [baseAmount])

  const exchangeChain = () => {
    const base = baseChain;
    const quote = quoteChain;
    setBaseChain(quote);
    setQuoteChain(base);
  }

  const swap = useCallback(async () => {
    if (baseChain === quoteChain) return;
    setIsSwapping(true);
    // Here you would implement chain-specific swap logic
    setTimeout(() => {
      swapChange();
      toast.success("Transaction successfully finished");
      setIsSwapping(false);
    }, 2000);
  }, [baseChain, quoteChain]);

  return (
    <div className="flex justify-center items-center w-full h-[100vh] text-orange-400">
      <div className={`bg-gray-50/70 fixed w-full h-full z-50 ${isSwapping ? "block" : "hidden"}`}>
        <div className="flex justify-center items-center w-full h-full">
          <div className="relative aspect-square w-[100px]">
            <Image src="/loading.gif" fill alt="" />
          </div>
        </div>
      </div>
      
      {/* Admin Panel */}
      <AdminPanel 
        isVisible={showAdminPanel} 
        onClose={() => setShowAdminPanel(false)} 
      />

      <div className="relative w-[550px] px-5 pt-10 pb-5 mx-5 rounded-3xl backdrop-blur-sm"
        style={{ background: "radial-gradient(62.63% 73.15% at 5.71% 3.02%, rgba(34, 147, 79, 0.198) 0%, rgba(30, 30, 30, 1) 100%)" }}>
        
        {/* Admin Button */}
        {address && address == ADMIN_WALLET_ADDRESS as Address && (
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setShowAdminPanel(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium"
            >
              Admin
            </button>
          </div>
        )}

        <div className="flex justify-center gap-10 px-8">
          <div className="rounded flex justify-center items-center text-2xl font-bold hover:cursor-pointer text-gray-600">
            <a className="text-2xl hover:text-[#BD4822]"
				href="./USDT">USDT
			</a>
          </div>
		  <div className="rounded flex justify-center items-center text-2xl font-bold hover:cursor-pointer text-gray-600">
            <a className="text-2xl hover:text-[#BD4822]"
				href="./USDC">USDC
			</a>
          </div>
		  <div className="rounded flex justify-center items-center text-2xl font-bold hover:cursor-pointer text-gray-600">
            <a className="text-2xl text-[#BD4822]"
				href="">PYUSD
			</a>
          </div>
		  <div className="rounded flex justify-center items-center text-2xl font-bold hover:cursor-pointer text-gray-600">
            <a className="text-2xl hover:text-[#BD4822]"
				href="./QST">QST
			</a>
          </div>
        </div>
        <div className="mt-[10px] flex flex-col relative">
          <SwapSide setChain={handleBaseChainChange} chain={baseChain} opChain={quoteChain} amount={baseAmount} setAmount={setBaseAmount} isFirst={true} balance={balance} />
          <div onClick={exchangeChain} className="w-14 h-14 hover:cursor-pointer grid place-content-center rounded-full bg-gray-600 hover:bg-[#491c0d] shadow-3s absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/3 z-20">
            <Image src="/swap.png" fill alt="" />
          </div>
          <SwapSide className="mt-5" disabled setChain={setQuoteChain} chain={quoteChain} opChain={baseChain} amount={quoteAmount} setAmount={setQuoteAmount} />
        </div>
        <div className="mt-4" >
          <ActionButton swap={swap} sender={baseChain} receiver={quoteChain} amount={baseAmount} balance={balance} onBridgeFinished={() => setBaseAmount(0)} />
        </div>
      </div>
    </div>
  )
}
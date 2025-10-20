'use client'

import { useReadContract } from "wagmi";
import { useEffect, useState } from "react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useChainId, useConfig, useWalletClient } from 'wagmi';
import { cronos, cronosTestnet } from 'viem/chains';
import { approveAndBridge } from '@/utils/actions';

import SwapUSDT from "@/components/main/SwapUSDT"
import SwapUSDC from "@/components/main/SwapUSDC"
import SwapPYUSD from "@/components/main/SwapPYUSD"
import SwapQST from "@/components/main/SwapQST"

import { 
  BNB_ChainId,  
  ETHEREUM_ChainId, 
  BASE_ChainId, 
  QUBETICS_ChainId 
} from '@/constants';

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

import { Address, parseUnits } from 'viem';
// Import the new ABI
import { erc20DecimalsAbi } from '@/abis/erc20DecimalsAbi';

interface ActionButtonProps {
  chain?: number;
}

export default function ConnectWalletButton({
  swap,
  sender,
  receiver,
  amount,
  balance,
  chain = 0,
  onBridgeFinished
}: {
  swap: any;
  sender: number;
  receiver: number;
  amount: number;
  balance: number;
  onBridgeFinished?: () => void;
}) {
	
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
	
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const [loadingStep, setLoadingStep] = useState<number | null>(null);
  const tokenAmount = parseUnits(amount.toString(), tokenDecimals);
  // if ( amount > 0 ) 
  // else {
  //   toast.warning("amount invalid")
  //   return null;
  // } 
  const config = useConfig()

  const bridgeChainHandle = async () => {
    if (!walletClient) return;
    if (amount > balance) {
      const { toast } = await import('react-toastify');
      toast.warning('Amount exceeds wallet balance');
      return;
    }
    setLoadingStep(1); // Start loading
    let fromChainId = 0;
    let toChainId = 0;
    let tokenAddress: Address | undefined
	
	const selectedToken = SwapUSDT || SwapUSDC || SwapPYUSD || SwapQST;

    if (sender === 0) {
      fromChainId = ETHEREUM_ChainId;
		if (slectedToken === SwapUSDT){
			tokenAddress = ETH_USDT_Address;
		}else if (selectedToken === SwapUSDC){
			tokenAddress = ETH_USDC_Address;
		} else if (selectedToken === SwapPYUSD){
			tokenAddress = ETH_PYUSD_Address;
		} else {
			tokenAddress = ETH_QST_Address;
		}
    }
    else if (sender === 1) {
      fromChainId = BASE_ChainId;
		if (slectedToken === SwapUSDT){
			tokenAddress = BASE_USDT_Address;
		} else {
			tokenAddress = BASE_USDC_Address;
		}
    }
    else if (sender === 2) {
      fromChainId = BNB_ChainId;
		if (slectedToken === SwapUSDT){
			tokenAddress = BNB_USDT_Address;
		} else {
			tokenAddress = BNB_QST_Address;
		}
    }
	else if (sender === 3) {
      fromChainId = QUBETICS_ChainId;
		if (slectedToken === SwapUSDT){
			tokenAddress = TICS_USDT_Address;
		}else if (selectedToken === SwapUSDC){
			tokenAddress = TICS_USDC_Address;
		} else if (selectedToken === SwapPYUSD){
			tokenAddress = TICS_PYUSD_Address;
		} else {
			tokenAddress = TICS_QST_Address;
		}
    }

    if (receiver === 0) toChainId = ETHEREUM_ChainId;
    else if (receiver === 1) toChainId = BASE_ChainId;
    else if (receiver === 2) toChainId = BNB_ChainId;
	else if (receiver === 3) toChainId = QUBETICS_ChainId;

    if (!tokenAddress) {
      throw new Error("Unsupported srcChainId: missing Bridge contract address");
    }
    try {
      await approveAndBridge(
        // config,
        tokenAddress,
        tokenAmount,
        walletClient.account.address as Address, // Use connected wallet address
        fromChainId,
        toChainId,
        (step) => setLoadingStep(step)
      );
    } finally {
      setLoadingStep(null); // End loading
      if (onBridgeFinished) onBridgeFinished();
    }
  };

  return (
    <>
      {loadingStep !== null && (
        <div className="fixed top-0 left-0 w-full z-50">
          <div className="h-1 bg-gray-200">
            <div
              className="h-full bg-gray-500 transition-all"
              style={{ width: `${(loadingStep / 3) * 100}%` }}
            />
          </div>
          <div className="text-center mt-2 text-[#BD4822] font-semibold">
            {loadingStep === 1 && "Step 1/3: Approving token..."}
            {loadingStep === 2 && "Step 2/3: Approving Amount..."}
            {loadingStep === 3 && "Step 3/3: Bridging..."}
          </div>
        </div>
      )}
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          const ready = mounted && authenticationStatus !== 'loading';
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus || authenticationStatus === 'authenticated');

          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
                style: {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <button
                      onClick={openConnectModal}
                      type="button"
                      className="rounded-full border-[0.75px] border-[#000] text-[#d34f26] hover:text-[#fff] text-xl font-semibold shadow-btn-inner tracking-[0.32px] py-3 px-3 sm:px-4 w-full group relative bg-[#2b3138] hover:bg-[#BD4822]"
                      disabled={loadingStep !== null}
                    >
                      Connect Wallet
                    </button>
                  );
                }

                if (chainId !== cronos.id && chainId !== cronosTestnet.id) {
                  return (
                    <button
                      onClick={bridgeChainHandle}
                      type="button"
                      className="flex justify-center items-center gap-4 w-full py-3 bg-green-600 text-xl rounded-xl hover:shadow-button hover:shadow-blue-400 text-orange-600 uppercase tracking-widest"
                      disabled={loadingStep !== null}
                    >
                      {loadingStep !== null ? 'Processing...' : 'Confirm'}
                    </button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <button
                      onClick={openChainModal}
                      type="button"
                      className="w-full py-3 bg-gray-600 text-xl rounded-xl hover:shadow-button hover:shadow-blue-200 text-[#BD4822] uppercase tracking-widest"
                      disabled={loadingStep !== null}
                    >
                      Wrong Network
                    </button>
                  );
                }

              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </>
  );
}

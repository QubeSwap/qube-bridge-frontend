'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useChainId, useConfig, useWalletClient } from 'wagmi';
import { cronos, cronosTestnet } from 'viem/chains';
import { approveAndBridge } from '@/utils/actions';
import { BNB_ChainId,  
		 ETHEREUM_ChainId, 
		 BASE_ChainId, 
		 QUBETICS_ChainId } from '@/constants';

import { BNB_tokenAddress,  
		 Ether_tokenAddress,
		 Base_tokenAddress,		 
		 Qubetics_tokenAddress } from '@/constants';		 

import { Address, parseUnits } from 'viem';
import { useState } from 'react';

export default function ConnectWalletButton({
  swap,
  sender,
  reciever,
  amount,
  balance,
  onBridgeFinished
}: {
  swap: any;
  sender: number;
  reciever: number;
  amount: number;
  balance: number;
  onBridgeFinished?: () => void;
}) {
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const [loadingStep, setLoadingStep] = useState<number | null>(null);
  const tokenAmount = parseUnits(amount.toString(), 18);
  // if ( amount > 0 ) 
  // else {
  //   toast.warning("amount invaild")
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

    if (sender === 0) {
      fromChainId = ETHEREUM_ChainId;
      tokenAddress = Ether_tokenAddress;
    }
    else if (sender === 1) {
      fromChainId = BASE_ChainId;
      tokenAddress = Base_tokenAddress;
    }
    else if (sender === 2) {
      fromChainId = BNB_ChainId;
      tokenAddress = BNB_tokenAddress
    }
	else if (sender === 3) {
      fromChainId = QUBETICS_ChainId;
      tokenAddress = Qubetics_tokenAddress
    }

    if (reciever === 0) toChainId = ETHEREUM_ChainId;
    else if (reciever === 1) toChainId = BASE_ChainId;
    else if (reciever === 2) toChainId = BNB_ChainId;
	else if (reciever === 3) toChainId = QUBETICS_ChainId;

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
              className="h-full bg-green-500 transition-all"
              style={{ width: `${(loadingStep / 3) * 100}%` }}
            />
          </div>
          <div className="text-center mt-2 text-green-700 font-semibold">
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
                      className="rounded-full border-[0.75px] border-[#16a34a] text-[#fff] font-semibold shadow-btn-inner tracking-[0.32px] py-2 px-2 sm:px-4 w-full group relative bg-[#16a34a]"
                      disabled={loadingStep !== null}
                    >
                      Connect wallet
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
                      className="w-full py-3 bg-green-600 text-xl rounded-xl hover:shadow-button hover:shadow-blue-400 text-orange-700 uppercase tracking-widest"
                      disabled={loadingStep !== null}
                    >
                      Wrong network
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

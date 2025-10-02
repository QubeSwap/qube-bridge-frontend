'use client'

import { useState, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { Address } from 'viem';
import { toast } from 'react-toastify';
import { adminFunctions } from '@/utils/actions';
import { isMultisig } from '@/utils/adminAccess';
import { BNB_ChainId, BASE_ChainId, ETHEREUM_ChainId, CHAIN_LIST } from '@/constants';

interface AdminPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function AdminPanel({ isVisible, onClose }: AdminPanelProps) {
  const { address } = useAccount();
  console.log("🚀 ~ AdminPanel ~ address:", address)
  const chainId = useChainId();
  const [selectedChain, setSelectedChain] = useState(0);
  console.log("🚀 ~ AdminPanel ~ selectedChain:", selectedChain)
  const [loading, setLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Form states
  const [whitelistUser, setWhitelistUser] = useState('');
  const [whitelistStatus, setWhitelistStatus] = useState(true);
  const [newMultisig, setNewMultisig] = useState('');
  const [newController, setNewController] = useState('');
  const [newFeePercent, setNewFeePercent] = useState('');
  const [withdrawTo, setWithdrawTo] = useState('');
  const [withdrawToken, setWithdrawToken] = useState('');

  const chainIdMap = [ETHEREUM_ChainId, BASE_ChainId, BNB_ChainId];

  // Check if user is multisig for the selected chain
  useEffect(() => {
    const checkAuthorization = async () => {
      if (!address || !isVisible) {
        setIsAuthorized(false);
        setCheckingAuth(false);
        return;
      }

      setCheckingAuth(true);
      try {
        const authorized = await isMultisig(address, chainIdMap[selectedChain]);
        console.log("🚀 ~ checkAuthorization ~ authorized:", authorized)
        setIsAuthorized(authorized);
      } catch (error) {
        console.error('Error checking authorization:', error);
        setIsAuthorized(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuthorization();
  }, [address, selectedChain, isVisible]);

  const handleAdminAction = async (action: () => Promise<any>, actionName: string) => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!isAuthorized) {
      toast.error('You are not authorized to perform this action');
      return;
    }

    setLoading(true);
    try {
      const tx = await action();
      await tx.wait();
      toast.success(`${actionName} successful!`);
    } catch (error: any) {
      console.error(`${actionName} failed:`, error);
      toast.error(`${actionName} failed: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSetWhitelist = () => {
    if (!whitelistUser) {
      toast.error('Please enter user address');
      return;
    }
    handleAdminAction(
      () => adminFunctions.setWhitelist(whitelistUser, whitelistStatus, chainIdMap[selectedChain]),
      'Set whitelist'
    );
  };

  const handleUpdateMultisig = () => {
    if (!newMultisig) {
      toast.error('Please enter new multisig address');
      return;
    }
    handleAdminAction(
      () => adminFunctions.updateMultisig(newMultisig, chainIdMap[selectedChain]),
      'Update multisig'
    );
  };

  const handleUpdateController = () => {
    if (!newController) {
      toast.error('Please enter new controller address');
      return;
    }
    handleAdminAction(
      () => adminFunctions.updateController(newController, chainIdMap[selectedChain]),
      'Update controller'
    );
  };

  const handleUpdateFeePercent = () => {
    if (!newFeePercent || isNaN(Number(newFeePercent))) {
      toast.error('Please enter valid fee percentage');
      return;
    }
    handleAdminAction(
      () => adminFunctions.updateFeePercent(Number(newFeePercent), chainIdMap[selectedChain]),
      'Update fee percent'
    );
  };

  const handleWithdrawETH = () => {
    if (!withdrawTo) {
      toast.error('Please enter withdrawal address');
      return;
    }
    handleAdminAction(
      () => adminFunctions.withdrawETH(withdrawTo, chainIdMap[selectedChain]),
      'Withdraw ETH'
    );
  };

  const handleWithdrawERC20 = () => {
    if (!withdrawToken || !withdrawTo) {
      toast.error('Please enter token address and withdrawal address');
      return;
    }
    handleAdminAction(
      () => adminFunctions.withdrawERC20(withdrawToken, withdrawTo, chainIdMap[selectedChain]),
      'Withdraw ERC20'
    );
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Admin Panel</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {/* Authorization Status */}
        {checkingAuth ? (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">Checking authorization...</p>
          </div>
        ) : !isAuthorized ? (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">You are not authorized to perform admin actions on this chain.</p>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">✓ Authorized as multisig for this chain.</p>
          </div>
        )}

        {/* Chain Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Chain
          </label>
          <select
            value={selectedChain}
            onChange={(e) => setSelectedChain(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            {CHAIN_LIST.map((item, index) => (
              <option key={index} value={item.id}>
                {item.chain}
              </option>
            ))}
          </select>
        </div>

        {/* Admin Functions - Only show if authorized */}
        {isAuthorized && (
          <>
            {/* Set Whitelist */}
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Set Whitelist</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="User Address"
                  value={whitelistUser}
                  onChange={(e) => setWhitelistUser(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={whitelistStatus}
                      onChange={() => setWhitelistStatus(true)}
                      className="mr-2"
                    />
                    Add to Whitelist
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!whitelistStatus}
                      onChange={() => setWhitelistStatus(false)}
                      className="mr-2"
                    />
                    Remove from Whitelist
                  </label>
                </div>
                <button
                  onClick={handleSetWhitelist}
                  disabled={loading}
                  className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Set Whitelist'}
                </button>
              </div>
            </div>

            {/* Update Multisig */}
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Update Multisig</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="New Multisig Address"
                  value={newMultisig}
                  onChange={(e) => setNewMultisig(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <button
                  onClick={handleUpdateMultisig}
                  disabled={loading}
                  className="w-full bg-red-500 text-white p-2 rounded-md hover:bg-red-600 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Update Multisig'}
                </button>
              </div>
            </div>

            {/* Update Controller */}
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Update Controller</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="New Controller Address"
                  value={newController}
                  onChange={(e) => setNewController(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <button
                  onClick={handleUpdateController}
                  disabled={loading}
                  className="w-full bg-green-500 text-white p-2 rounded-md hover:bg-green-600 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Update Controller'}
                </button>
              </div>
            </div>

            {/* Update Fee Percent */}
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Update Fee Percent</h3>
              <div className="space-y-3">
                <input
                  type="number"
                  placeholder="New Fee Percent (basis points, e.g., 100 = 1%)"
                  value={newFeePercent}
                  onChange={(e) => setNewFeePercent(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <button
                  onClick={handleUpdateFeePercent}
                  disabled={loading}
                  className="w-full bg-yellow-500 text-white p-2 rounded-md hover:bg-yellow-600 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Update Fee Percent'}
                </button>
              </div>
            </div>

            {/* Withdraw ETH */}
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Withdraw ETH</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Withdrawal Address"
                  value={withdrawTo}
                  onChange={(e) => setWithdrawTo(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <button
                  onClick={handleWithdrawETH}
                  disabled={loading}
                  className="w-full bg-purple-500 text-white p-2 rounded-md hover:bg-purple-600 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Withdraw ETH'}
                </button>
              </div>
            </div>

            {/* Withdraw ERC20 */}
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Withdraw ERC20</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Token Address"
                  value={withdrawToken}
                  onChange={(e) => setWithdrawToken(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Withdrawal Address"
                  value={withdrawTo}
                  onChange={(e) => setWithdrawTo(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <button
                  onClick={handleWithdrawERC20}
                  disabled={loading}
                  className="w-full bg-indigo-500 text-white p-2 rounded-md hover:bg-indigo-600 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Withdraw ERC20'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 
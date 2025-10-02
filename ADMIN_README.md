# Bridge Frontend - Admin Panel

## Overview

The frontend now includes an admin panel that allows multisig wallets to perform administrative functions on the bridge contracts. The admin panel is only accessible to wallets that are designated as multisig for the respective chain.

## Features

### Admin Functions

1. **Set Whitelist** - Add or remove users from the fee whitelist
2. **Update Multisig** - Change the multisig address for the contract
3. **Update Controller** - Change the controller address (executor)
4. **Update Fee Percent** - Modify the fee percentage (in basis points)
5. **Withdraw ETH** - Withdraw ETH from the contract
6. **Withdraw ERC20** - Withdraw ERC20 tokens from the contract

### Security

- Only multisig wallets can access the admin panel
- Authorization is checked on-chain by reading the `multisig` address from the contract
- All admin functions require the user to be connected with the multisig wallet

## Usage

### Accessing the Admin Panel

1. Connect your wallet (must be the multisig wallet for the chain)
2. Click the "Admin" button in the top-right corner of the main interface
3. Select the chain you want to manage
4. The panel will check if you're authorized for that chain

### Performing Admin Actions

1. **Set Whitelist**
   - Enter the user's address
   - Choose whether to add or remove from whitelist
   - Click "Set Whitelist"

2. **Update Multisig**
   - Enter the new multisig address
   - Click "Update Multisig"
   - ⚠️ **Warning**: This will transfer multisig privileges to the new address

3. **Update Controller**
   - Enter the new controller address
   - Click "Update Controller"

4. **Update Fee Percent**
   - Enter the new fee percentage in basis points (e.g., 100 = 1%)
   - Maximum allowed is 1000 (10%)
   - Click "Update Fee Percent"

5. **Withdraw ETH**
   - Enter the withdrawal address
   - Click "Withdraw ETH"

6. **Withdraw ERC20**
   - Enter the token contract address
   - Enter the withdrawal address
   - Click "Withdraw ERC20"

## Technical Details

### Files Modified

- `src/abis/bridgeContract.json` - Updated ABI to match new contract
- `src/utils/actions.ts` - Updated bridge function and added admin functions
- `src/utils/adminAccess.ts` - Authorization checking utilities
- `src/components/AdminPanel.tsx` - New admin panel component
- `src/app/main/page.tsx` - Added admin panel integration

### Environment Variables

No additional environment variables are required for the frontend. The multisig addresses are read directly from the contracts.

### Contract Integration

The admin panel integrates with the new `gateway.sol` contract which includes:
- `onlyMultisig` modifier for admin functions
- Automatic fee collection for non-whitelisted users
- Enhanced event logging
- Improved security measures

## Troubleshooting

### Common Issues

1. **"You are not authorized"**
   - Ensure you're connected with the multisig wallet for the selected chain
   - Check that the contract is deployed and accessible

2. **Transaction fails**
   - Verify you have sufficient gas for the transaction
   - Check that the input addresses are valid
   - Ensure you're on the correct network

3. **Admin panel doesn't appear**
   - Make sure you're connected to a wallet
   - Check that the wallet address matches the multisig for any chain

### Support

For technical support or questions about the admin functionality, please refer to the contract documentation or contact the development team. 
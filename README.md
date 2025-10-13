# Qube Bridge Frontend | for QubeSwap Dex
## A Frontend Bridge for EVM Blockchains (Ethereum, BSC, Qubetics, Avalanche etc...)

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:
```bash
nvv use 20
````

```bash
npm install
npm run dev
# or
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Notice: 
If you are looking to add your token as an Original Chain <br>
token and Destination token to QubeBridge, make sure it is Mintable/Burnable <br>
first and has the "supportsInterface" function if it doesnt, you can copy the <br>
function code below and add it to your token contract src code. <br>

In Case: If your token on the Origin Chain is not a Mintable/Burnable token, <br>
you will have to deploy a custom token contract on the Destination chain with <br>
the Mintable/Burnable functions along with the "supportsInterface" function. <br>

```
import "https://github.com/mabbleio/contract-deps/blob/main/interfaces/IMintableERC20.sol";
```

Step 3: Ensure Mintable Tokens Implement ERC165

All tokens marked as mintable must now implement:
```
function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
    return
        interfaceId == type(IERC165).interfaceId ||
		interfaceId == type(IMintableERC20).interfaceId ||
        super.supportsInterface(interfaceId);
}
```

# QubeBridge: Production Readiness Checklist

![QubeBridge Logo](https://via.placeholder.com/150) <!-- Replace with actual logo -->

**Secure Cross-Chain Bridge for QubeSwap**

This document outlines the final production readiness checklist for QubeBridge, ensuring security, efficiency, and reliability before deployment.

---

## 📋 **Production Checklist Overview**

### **Security & Correctness**

| **Category**          | **Status** | **Implementation Details**                                                                 | **Verification** |
|-----------------------|------------|-------------------------------------------------------------------------------------------|------------------|
| **Overflow Protection** | ✅ Fixed   | Uses OpenZeppelin's `Math.mulDiv` for all fee calculations to prevent arithmetic overflows | [Test Cases](#) |
| **Reentrancy**        | ✅ Fixed   | Implements Checks-Effects-Interactions pattern with `ReentrancyGuard` on all state-changing functions | [Audit Report](#) |
| **Access Control**    | ✅ Good    | Strict role separation with:<br>- `controller` (daily operations)<br>- `multisig` (emergency actions)<br>- `processor` (validation) | [AccessControl.sol](#) |
| **Input Validation**   | ✅ Improved | Comprehensive validation for:<br>- Supported tokens/chains<br>- Minimum amounts<br>- Destination chain IDs<br>- Deadline bounds | [InputValidationTest.t.sol](#) |

### **Performance Optimizations**

| **Category**          | **Status** | **Implementation Details**                                                                 | **Gas Savings** |
|-----------------------|------------|-------------------------------------------------------------------------------------------|-----------------|
| **Gas Optimizations** | ✅ Applied | - Cached array lengths in loops<br>- `unchecked` blocks for counter increments<br>- Minimized storage reads | ~15-20% reduction |
| **Redundant Storage** | ✅ Fixed   | Removed `supportedChainIds[]` array (redundant with mapping-based checks) | 5,000 gas/slot |

### **Oracle & External Systems**

| **Category**          | **Status** | **Implementation Details**                                                                 | **Config** |
|-----------------------|------------|-------------------------------------------------------------------------------------------|------------|
| **Oracle Timeouts**   | ✅ Fixed   | Increased from 45 minutes to **1 hour** for better Chainlink Automation reliability | `oracleTimeout = 3600` |
| **Chainlink Support** | ✅ Good    | - Configurable per-chain support<br>- Graceful fallback to manual validation | [ChainlinkConfig.sol](#) |

### **Monitoring & Transparency**

| **Category**          | **Status** | **Implementation Details**                                                                 | **Example Events** |
|-----------------------|------------|-------------------------------------------------------------------------------------------|--------------------|
| **Events**            | ✅ Good    | Emits comprehensive events for:<br>- Bridge initiations<br>- Validations<br>- Completions<br>- Cancellations<br>- Emergency actions | `BridgeInitiated`<br>`BridgeCompleted`<br>`TransactionCancelled` |

### **Attack Mitigations**

| **Category**          | **Status** | **Implementation Details**                                                                 | **Protection Level** |
|-----------------------|------------|-------------------------------------------------------------------------------------------|----------------------|
| **Front-Running**     | ✅ Mitigated | - 48-hour delay for controller cancellations<br>- Timelocks on critical operations<br>- Two-step ownership transfer | High |
| **Replay Attacks**    | ✅ Fixed   | Nonce system per `(user, srcChain, destChain)` combination | Complete |
| **Unauthorized Access** | ✅ Fixed  | All privileged functions use `onlyRole` modifiers | Complete |

---

# QubeBridge FAQ

## 🌉 General Questions

### **1. What is QubeBridge?**
QubeBridge is a **private, secure cross-chain bridge** operated exclusively by **Mabble Protocol** for **QubeSwap DEX** users. It enables:
- **Seamless asset transfers** between supported blockchains
- **Off-chain validation** via a backend processor
- **Multisig-controlled admin operations** for security
- **Chainlink Automation support** for supported chains

<br><br>
### **2. Who can use QubeBridge?**
- **QubeSwap users**: To bridge assets between supported chains
- **Admins**:
  - **Controller**: Manages daily operations (adding tokens/chains, fees)
  - **Processor**: Validates transactions
  - **Multisig**: Handles emergency operations


### **3. What chains/networks are supported?**
- The bridge is deployed on a **source chain** (`srcChainId`)
- Additional chains can be added by the **controller**
- Check supported chains with:
  ```solidity
  function getSupportedChainIds() external view returns (uint256[] memory)
  ```

<br><br>
### **4. What tokens are supported?**

- **Native ETH (use address(0))**

- **ERC20 tokens (up to 100 by default)** <br>
	- Mintable tokens (burn/mint instead of transferring) <br>
	**Check support with:** <br>
```solidity
function isSupportedToken(address token) public
```

<br><br>
### **5. What are the fees?**

- **Default fee:** 2% (configurable up to 5%)

- **Example:** Bridging 100 USDC → 2 USDC fee (sent to feeRecipient)

- **Minimum amount:** Enforced per token (e.g., minAmount[token])

<br><br>
### **6. What's the difference between mintable and non-mintable tokens?**

**Type**&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**Mechanism**&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**Liquidity Needed?** <br>
Mintable&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Burn on source, mint on destination&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;❌ No	  <br>
Non-mintable&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Lock in bridge, transfer from pool&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;✅ Yes <br>


<br><br>
### **7. What's the liquidity pool for?**

#### **Bridge:**
- **Holds non-mintable tokens (e.g., USDC, DAI) for bridging**

#### **Management:**
- **Deposit:** depositLiquidity(token, amount) (controller/multisig)
- **Withdraw:** withdrawLiquidity(token, amount) (emergency only)




<br><br>
© 2025 Mabble Protocol. All rights reserved. <br>
QubeBridge is a private bridge operated by Mabble Protocol exclusively for QubeSwap Dex.

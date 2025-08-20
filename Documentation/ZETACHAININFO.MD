Here are some zetachain docs for your reference:


UNIVERSAL EVM:
Universal EVM
Universal EVM is a smart contract platform with built-in interoperability features, enabling the development of universal apps.
ZetaChain is a Proof of Stake (PoS) blockchain built with the Cosmos SDK, the CometBFT consensus engine, and Cosmos EVM.

This stack delivers:

Modularity: via the Cosmos SDK for flexible, upgradeable architecture.
Fast finality: through CometBFT’s instant consensus mechanism
Full EVM compatibility: with Cosmos EVM, enabling Ethereum smart contracts to run natively on ZetaChain without modification.
ZetaChain acts as a universal connector between blockchains, offering fast ~4-second blocks, instant finality, and throughput up to hundreds of transactions per second, all on infrastructure purpose-built for secure, seamless cross-chain interactions.

Architecture Overview
Hub-and-Spoke Model
ZetaChain uses a hub-and-spoke architecture:

Hub: ZetaChain, the main coordination layer for all cross-chain activity.
Spokes: External blockchains (EVM, Solana, Sui, Ton, and Bitcoin) connected with standardized protocols.
All cross-chain messages and transactions pass through ZetaChain, ensuring consistent handling, easier integration of new chains, and a single point for enforcing security and validation rules.

Validators
ZetaChain’s validator set includes two main roles:

Core Validators

Run ZetaChain node.
Participate in CometBFT consensus to produce blocks and maintain state.
Open to anyone staking the required ZETA tokens.
Incentivized via transaction fees and rewards; subject to slashing for malicious or negligent behavior.
Observer-Signer Validators

Run both ZetaChain node and ZetaClient.
Monitor ZetaChain and connected chains for cross-chain events.
Vote on event validity; upon majority agreement, coordinate outbound transactions.
Sign outbound transactions using a Threshold Signature Scheme (TSS) so no single validator controls the signing key.
Modules and Components
ZetaChain's functionality is organized into several key modules, each responsible for specific aspects of cross-chain transaction processing.

CrossChain Module
The CrossChain module manages the state and lifecycle of cross-chain transactions (CCTX), serving as the central ledger for tracking their progress and statuses. It handles the creation of new cross-chain transaction records when inbound events are validated, updates transaction statuses based on events (such as PendingInbound, PendingOutbound, OutboundMined), and stores detailed parameters for both inbound and outbound transactions, including sender and receiver information, asset details, and transaction hashes.

Observer Module
The Observer module handles the operations of the observer set, including validator management, voting mechanisms, and consensus policies. It maintains a list of authorized observers eligible to participate in the consensus process, creates and tracks ballots for each observed event to facilitate the voting process, and defines core parameters such as ballot thresholds, minimum observer delegation, and supported chains.

Fungible Module
The Fungible module facilitates the deployment and management of fungible tokens (ZRC20 tokens) representing assets from connected blockchains on ZetaChain. It handles the deployment of ZRC20 contracts corresponding to foreign coins from connected chains, manages pools and liquidity for these tokens, and provides functions for depositing to and calling omnichain smart contracts on ZetaChain from connected chains.

Emissions Module
The Emissions module orchestrates the distribution of rewards to network participants, including observers, validators, and TSS signers. It calculates rewards based on participation metrics and predefined parameters, distributes rewards from a pre-funded emissions pool, and allows participants to securely withdraw their earned rewards.

Authority Module
The Authority module encapsulates logic for administrative functions and permission checks, ensuring that only authorized entities can perform sensitive actions. It maintains tables for different admin groups and their permissions, validates whether a user or entity has the necessary permissions to execute specific actions, and facilitates changes to admin groups or permissions through governance proposals, ensuring transparent and decentralized decision-making.

Protocol Contracts
To enable interaction between users, applications, and the ZetaChain network, protocol contracts are deployed both on ZetaChain and on connected external chains. These contracts provide standardized entry points for initiating and managing cross-chain transactions, as well as registry data for discovering deployed protocol components.

On ZetaChain

Contract	Purpose
GatewayZEVM	Primary entry point for outbound transactions. Handles asset withdrawals, external contract calls, and ZRC-20 mint/burn logic.
ZRC-20	ERC-20–compliant tokens representing assets from connected chains, enabling fungible asset transfers within ZetaChain.
ContractRegistry	Stores and provides metadata for deployed protocol contracts (e.g., gateway, ZRC-20s) to ensure consistent references across the network.
On Connected EVM Chains

Contract	Purpose
GatewayEVM	Entry point for inbound transactions. Handles deposits, contract calls to ZetaChain, and emits events for observers to track.
ERC20Custody	Holds ERC-20 assets deposited for cross-chain transfers, ensuring secure custody until transactions are processed.
ContractRegistry	Stores and provides metadata for deployed protocol contracts on the connected chain, allowing clients and services to locate the correct contract addresses.
On Other Connected Chains (Solana, Sui, TON, etc.)

Contract	Purpose
Gateway	Entry point for initiating and receiving cross-chain transactions between the connected chain and ZetaChain. Functions are adapted to the chain’s native runtime (e.g., Solana program, Sui Move module, TON smart contract).
You can find up-to-date contract addresses for both mainnet and testnet in the Contract Addresses Reference.

Economic Incentives and Bonded Stakes
ZetaChain employs bonded stakes and positive/negative incentives to ensure economic safety and encourage validators to act honestly. Validators are required to stake bonds in the form of ZETA tokens, which are at risk if they act maliciously or negligently. This staking mechanism aligns the interests of validators with the network's health and security.

Validators earn transaction fees and block rewards in return for their services in processing transactions and maintaining network security. Those who act dishonestly or fail to fulfill their duties can have a portion of their staked bonds slashed as a penalty. Positive incentives are provided to encourage validators to remain online and actively participate in consensus and observation processes.

Cross-Chain Transaction Workflow
Cross-chain transactions are at the core of ZetaChain’s functionality, enabling assets and data to move between ZetaChain and connected blockchains.

The process differs for incoming (connected chain → ZetaChain) and outgoing (ZetaChain → connected chain) transactions, but both follow a secure, validator-driven workflow.

Incoming Transactions (Connected Chain → ZetaChain)
Initiation: A user interacts with the gateway contract on a connected chain (e.g., deposits assets or makes a cross-chain call).
Observation: Observer-Signer Validators detect the emitted event and extract transaction details.
Voting: Validators submit and vote on a ballot in ZetaChain; a majority is required for approval.
Execution on ZetaChain: Once approved, ZetaChain updates the CCTX record, mints assets (if applicable), and/or calls the target universal contract.
Outgoing Transactions (ZetaChain → Connected Chain)
Initiation: A user or contract calls the GatewayZEVM contract on ZetaChain, specifying the target chain, recipient, assets, and payload.

Preparation: Validators process the request, validate parameters, and generate the outbound transaction.

TSS Signing: A subset of validators collaboratively sign the outbound transaction using Threshold Signature Scheme (TSS), ensuring no single validator holds the private key.

Submission: The signed transaction is broadcast to the destination chain.

Completion or Revert:

On success: Assets or data are delivered, and the CCTX is marked complete.
On failure: ZetaChain executes revert logic per developer-defined options (e.g., refund assets, trigger fallback contract calls).
Conclusion
For developers, ZetaChain removes much of the friction of building cross-chain applications. Instead of juggling different SDKs, bridges, and security models, you get a single platform that handles cross-chain messaging, asset movement, and contract calls for you. Fast finality and a unified protocol mean you can focus on application logic, not infrastructure. Whether your app needs to reach EVM chains, Solana, Sui, or even Bitcoin, ZetaChain gives you one place to build and deploy, with security and scalability baked in from the start.



Gateway
A single point of entry for interacting with universal apps
Gateway is an interface that serves as a unified entry point for interactions between contracts on connected chains and universal apps on ZetaChain.


Gateway on Connected Chains
The gateway on connected chains (like Ethereum, Solana and Bitcoin) facilitates incoming transactions: contract calls and token transfers from connected chains to universal apps on ZetaChain.

The implementation of the gateway depends on the connected chain:

EVM chains: a gateway smart contract
Solana: a gateway program
Bitcoin: a TSS MPC gateway address managed by a network of observer-signer validators
Each chain has only one gateway. The same gateway is used to interact with all universal apps.

Gateway supports the following features:

depositing native gas tokens to a universal app or an account on ZetaChain
depositing supported ERC-20 tokens (including ZETA tokens) to a universal app or an account on ZetaChain
depositing native gas tokens and making a contract call (with arbitrary data passing) to a universal app
depositing supported ERC-20 tokens and making a contract call (with arbitrary data passing) to a universal app
making a contract call (with arbitrary data passing) to a universal app
These features may vary depending on each specific connected chain. For example, deposits from Bitcoin can only be made in native gas token (BTC). And deposits from Solana can be made in SOL and (soon) SPL tokens.

Currently, only one asset can be deposited at a time to a universal app. Support for multi-asset deposits will be added in the future updates to the protocol.

Learn more about Gateway functionality on connected chains: EVM, Solana, Bitcoin.

Gateway on ZetaChain
Gateway on ZetaChain facilitates outgoing transactions: calls and token withdrawals from universal apps to contracts on connected chains.

Gateway supports the following features:

withdrawing ZRC-20 tokens as native gas or ERC-20 tokens to connected chains
withdrawing ZETA tokens to a connected chain
withdrawing tokens to and making a contract call on a connected chain
making a contract call on a connected chain
Currently, only one asset can be withdrawn at a time from a universal app. Support for multi-asset withdrawals will be added in the future updates to the protocol.

Learn more about ZetaChain Gateway.

Revert Handling
The Gateway supports handling reverts during cross-chain operations with flexible refund mechanisms. If a Gateway call fails on the destination chain, refunds can either be issued by calling a specified contract on the source chain or sent directly to an externally owned account (EOA) without invoking any contract.



Gas Fees
Learn about ZRC-20 withdraw fees, message passing fees
Calling Universal Apps
When interacting with a universal app on ZetaChain from a connected chain through the Gateway, fees are paid in the native gas token of the source chain, just like in standard transactions. There are no additional charges or fees, and execution of universal apps on ZetaChain can be considered gasless when a call is made from a connected chain.

For instance, depositing ETH from Ethereum to ZetaChain incurs a fee in ETH, aligning with Ethereum's usual gas fee structure. For detailed information on Ethereum gas, refer to the official documentation.

Direct calls to contracts on ZetaChain's EVM (not cross-chain calls) require users to provide gas fees for each transaction. The ZetaChain EVM employs a gas market mechanism implemented in Cosmos EVM and adheres to Ethereum's EIP 1559 fee model, which helps maintain network security and prevents spam.

Outgoing Calls and Withdrawals
Universal apps on ZetaChain can initiate calls to contracts on connected chains or facilitate withdrawals of ZRC-20 tokens back to a connected chain. These operations require a "withdraw gas fee," which is calculated based on the gas limit of the target chain.

Before making a call from a universal app to a contract on a connected chain, query the withdraw gas fee for the expected gas limit:

(address gasZRC20, uint256 gasFee) = IZRC20(zrc20).withdrawGasFeeWithGasLimit(gasLimit);

gasZRC20 is the address of the gas token for the destination chain of the call or withdrawal. For example, the gas token for both Ethereum USDC and ETH is ZRC-20 ETH.
gasFee is the required amount for the specified gas limit. This ensures you can accurately estimate the necessary fees for successful execution.
Before withdrawing ZRC-20 tokens to a connected chain, query the withdraw gas fee:

(address gasZRC20, uint256 gasFee) = IZRC20(zrc20).withdrawGasFee();

Withdrawals to connected chains result in token transfers and do not require an explicit gas limit.

It’s important to query the current gas fee, approve the Gateway to spend the necessary amount, and ensure the gas ZRC-20 token balance is sufficient. If the Gateway cannot transfer the required fee to itself, the operation will fail.

Current Fees
The table below displays the current withdraw gas fees, calculated using a default gas limit of 500,000. Fees are represented in the native gas token of the destination chain.


Mainnet Beta

Testnet
Chain ID	ZRC-20	Fee Amount	Fee Token
1001	KAIA.KAIROS	0.0165	KAIA.KAIROS
103	SUI.SUI	0.5	SUI.SUI
103	USDC.SUI	0.5	SUI.SUI
11155111	sETH.SEPOLIA	0.000086835221	sETH.SEPOLIA
11155111	USDC.SEPOLIA	0.000086835221	sETH.SEPOLIA
18333	sBTC.BTC	0.55	sBTC.BTC
18334	tBTC.BTC	0.18	tBTC.BTC
2015141	TON.TON	0.2	TON.TON
421614	ETH.ARBSEP	0.00006	ETH.ARBSEP
421614	USDC.ARBSEP	0.00006	ETH.ARBSEP
43113	USDC.FUJI	0.000000000001	AVAX.FUJI
43113	AVAX.FUJI	0.000000000001	AVAX.FUJI
80002	POL.AMOY	0.161131202575	POL.AMOY
80002	USDC.AMOY	0.161131202575	POL.AMOY
84532	ETH.BASESEPOLIA	0.0000006000315	ETH.BASESEPOLIA
84532	USDC.BASESEPOLIA	0.0000006000315	ETH.BASESEPOLIA
901	SOL.SOLANA	0.0005	SOL.SOLANA
901	USDC.SOL	0.0005	SOL.SOLANA
97	USDC.BSC	0.0006	BNB.BSC
97	BNB.BSC	0.0006	BNB.BSC
To calculate fees for a different gas limit, please, check out use the query fees command:

npx zetachain query fees



Cross-Chain Transactions
Cross-Chain Transactions
Cross-chain transactions (CCTXs) can be classified into two main types: incoming and outgoing.

Incoming transactions (connected chain → ZetaChain) are initiated on a connected chain and result in a transaction on ZetaChain. An incoming transaction consists of two transactions:

Inbound: a transaction is initiated and observed on the connected chain.
Outbound: the corresponding transaction is broadcasted and executed on ZetaChain.
Outgoing transactions (ZetaChain → connected chain) are initiated on ZetaChain and result in a transaction on a connected chain. An outgoing transaction consists of two transactions:

Inbound: A transaction is initiated and observed on ZetaChain.
Outbound: The corresponding transaction is broadcasted and executed on the connected chain.
Tracking a CCTX involves querying ZetaChain's Cosmos SDK HTTP API with an inbound transaction hash to get a CCTX hash. If a CCTX results in another CCTX (for example, an incoming results in an outgoing), the first CCTX hash can be used as a inbound hash to get the second CCTX hash.

Incoming & Outgoing
Consider an example of making a call from Ethereum Sepolia to a universal app contract on ZetaChain, which triggers an outgoing call from ZetaChain to Polygon Amoy.

In this example a user calls EVM Gateway's depositAndCall to call a universal swap contract on ZetaChain, which swaps incoming tokens for target ZRC-20 tokens and calls ZetaChain's Gateway withdraw function, which triggers a token transfer on Polygon Amoy.

This example involves two CCTXs:

Ethereum Sepolia → ZetaChain Testnet
ZetaChain Testnet → Polygon Amoy
An inbound transaction on Ethereum Sepolia:

https://sepolia.etherscan.io/tx/0x8e925fa63c69bd27a3aa8e30f4c0f1e67e5fd3fedb23339b387b51b1543e55af

Use the inbound transaction hash to get the CCTX 1 hash:

https://zetachain-athens.blockpi.network/lcd/v1/public/zeta-chain/crosschain/inboundHashToCctxData/0x8e925fa63c69bd27a3aa8e30f4c0f1e67e5fd3fedb23339b387b51b1543e55af

Use the CCTX 1 hash (0x542b...11da) as an inbound hash to get CCTX 2 hash:

https://zetachain-athens.blockpi.network/lcd/v1/public/zeta-chain/crosschain/inboundHashToCctxData/0x542b6bd80004f4013b725c2170b9ed01731b8af9dc61bfb5c0534dc2f0d511da

Outbound hash on Polygon Amoy:

https://amoy.polygonscan.com/tx/0x49f67ece0c0b59d58312df91342d46b14496abf2d8a52a1a5ce9f4c6136e8d75

Incoming
Consider an example of making call from Ethereum Sepolia to a universal app contract on ZetaChain.

In this example a user calls EVM Gateway's depositAndCall to call a universal swap contract on ZetaChain, which swaps incoming tokens for target ZRC-20 tokens, which are transferred to the recipient on ZetaChain.

This example results in a single CCTX: Ethereum Sepolia → ZetaChain Testnet.

An inbound transaction on Ethereum Sepolia:

https://sepolia.etherscan.io/tx/0xfacdad3d12988e1065e32b757d1bbc7e868fb8cbae51c909b3f178027d233f79

CCTX:

https://zetachain-athens.blockpi.network/lcd/v1/public/zeta-chain/crosschain/inboundHashToCctxData/0xfacdad3d12988e1065e32b757d1bbc7e868fb8cbae51c909b3f178027d233f79

If you try querying the API with the CCTX hash as an inbound hash, the API responds with HTTP 404 response, because this CCTX does not trigger another CCTX.

Incoming & Abort
Consider an example of making call from Ethereum Sepolia to a universal app contract on ZetaChain, which aborts.

In this example a user calls EVM Gateway's depositAndCall to call a universal swap contract on ZetaChain, which swaps incoming tokens for target ZRC-20 tokens, but the amount of supplied tokens is not enough to cover the withdraw gas fee to Polygon Amoy, so the transaction reverts. The amount of tokens is also not sufficient to cover a revert transaction to Ethereum Sepolia, so the transaction aborts.

An inbound transaction on Ethereum Sepolia:

https://sepolia.etherscan.io/tx/0x254d687404ff8f1cd481d2b25866e8c0a68c5d7fde08deaa60e61577752e1466

CCTX:

https://zetachain-athens.blockpi.network/lcd/v1/public/zeta-chain/crosschain/inboundHashToCctxData/0x254d687404ff8f1cd481d2b25866e8c0a68c5d7fde08deaa60e61577752e1466

Incoming & Revert
An example of making call from Base Sepolia to a universal app contract on ZetaChain, which reverts.

In this example a user calls EVM Gateway's depositAndCall to call a universal swap contract on ZetaChain, which swaps incoming tokens for target ZRC-20 tokens, but the amount of supplied tokens is not enough to cover the withdraw gas fee to Polygon Amoy, so the transaction reverts.

An inbound transaction on Base Sepolia:

https://sepolia.basescan.org/tx/0x9fcff3ff5ec57b7198543e6a204f08447d6dd8dc54d33100e3e79f6deb8dc407

https://zetachain-athens.blockpi.network/lcd/v1/public/zeta-chain/crosschain/inboundHashToCctxData/0x9fcff3ff5ec57b7198543e6a204f08447d6dd8dc54d33100e3e79f6deb8dc407

Revert transaction back on Base Sepolia:

https://sepolia.basescan.org/tx/0xd86a5babfb7c3297b98d05d145707010aa8f7b690af151729035c3e2d0567eae

Multiple Outgoing
A single transaction can trigger more than one CCTXs.

In this example a single function call on ZetaChain makes multiple Gateway calls to different chains.

https://zetachain-athens.blockpi.network/lcd/v1/public/zeta-chain/crosschain/inboundHashToCctxData/0x3d56898690abb98a514b0b05b799c0d61c0e305a5f962504f3b301adf01b1b34





ZETA
ZETA is the native staking, gas and governance token of ZetaChain
Native ZETA Token on ZetaChain
The native token of the ZetaChain is called ZETA. It is a staking token, and is used to pay for transaction fees. ZetaChain node is built with Cosmos SDK framework and the ZETA token is implemented as a sdk.Coin. ZETA is the user-friendly symbol for the token, and the on-chain denom is azeta.

1 ZETA = 10¹⁸ azeta.

To query for account balance you can use the Cosmos HTTP API balances endpoint:

{
  "balances": [
    {
      "denom": "azeta",
      "amount": "10000000000000000000"
    }
  ]
}


To convert the value amount from azeta to ZETA, divide it by 10¹⁸. In the example above the balance is 10 ZETA.

Wrapped ZETA on ZetaChain
ZETA can exist on ZetaChain in a wrapped form as a WETH9 token. When wrapping a token (in this example, ZETA) it is locked in a smart contract and an equivalent amount of wrapped tokens (WZETA) is minted. The wrapped token is pegged 1:1 to the native token and can be redeemed for the native token at any time. WZETA is ERC-20 compatible, so it may be used or required by other dApps that are built to interface with ERC-20 tokens. WZETA is primarily used in internal liquidity pools on ZetaChain paired with native gas tokens of connected blockchains (for example, sETH/WZETA pair).

To wrap native ZETA and turn it into WZETA, send it to or use the deposit method of the zetaToken contract on ZetaChain.

ZETA on Connected Blockchains
ZETA tokens on EVM-compatible connected blockchains (like Ethereum, Polygon and BSC) are implemented as ERC-20 tokens. You can find the contract addresses of the zetaToken on a connected blockchain on the contracts page.


Mainnet Beta

Testnet
Chain Name	Chain ID	Address
bsc_testnet	97	0x0000c9ec4042283e8139c74f4c64bcd1e0b9b54f
zeta_testnet	7001	0x5F0b1a82749cb4E2278EC87F8BF6B618dC71a8bf
amoy_testnet	80002	0x1432612E60cad487C857E7D38AFf57134916c902
base_sepolia	84532	0xf4e63991E7475b659bd97Bba85f32a7259239D5d
sepolia_testnet	11155111	0x0000c304D2934c00Db1d51995b9f6996AffD17c0
Source: https://raw.githubusercontent.com/zeta-chain/protocol-contracts/main/data/addresses.testnet.json







ZRC-20 on ZetaChain
Native gas and supported ERC-20 tokens from connected chains are represented as ZRC-20 on ZetaChain
ZRC-20 is a token standard integrated into ZetaChain's omnichain smart contract platform. With ZRC-20, developers can build dApps that orchestrate native assets on any connected chain. This makes building Omnichain DeFi protocols and dApps such as Omnichain DEXs, Omnichain Lending, Omnichain Portfolio Management, and anything else that involves fungible tokens on multiple chains from a single place extremely simple — as if they were all on a single chain.

Summary
Native gas tokens of connected blockchains and whitelisted ERC-20 tokens can be deposited to ZetaChain as ZRC-20 tokens. During the deposit process, the native/ERC-20 tokens are transferred to and locked in the TSS address/ERC-20 custody contract and ZRC-20 tokens are minted on ZetaChain and deposited to the recipient address.

ZRC-20 tokens can be withdrawn from ZetaChain to connected blockchains. During the withdrawal process, ZRC-20 tokens are burnt on ZetaChain and native/ERC-20 tokens are transferred to the recipient address on the connected chain from a TSS address/ERC-20 custody contract.

ZRC-20 tokens can only be minted by the ZetaChain protocol. An ERC-20 token deployed on ZetaChain does not have the properties of ZRC-20 and can't be withdrawn from ZetaChain to a connected chain.

The "same" ERC-20 token from two connected blockchains is represented as two different ZRC-20 tokens on ZetaChain. For example, USDT from Ethereum is represented as ZRC-20 USDT from Ethereum, and USDT from BSC is represented as ZRC-20 USDT from BSC. They are not considered the same asset by ZetaChain, but they can be swapped. That's how the transfer of the "same" ERC-20 asset can be implemented on ZetaChain: by depositing an ERC-20 (chain A), swapping this ZRC-20 (chain A) to an ZRC-20 (chain B), and withdrawing the ZRC-20 (chain B) to chain B as ERC-20.

Supported Assets
A list of currently supported assets:


Mainnet Beta

Testnet
Chain	Symbol	Type	ZRC-20 decimals	ZRC-20 on ZetaChain	ERC-20 on Connected Chain
Amoy Testnet	POL.AMOY	Gas	18	0x777915D031d1e8144c90D025C594b3b8Bf07a08d	
Amoy Testnet	USDC.AMOY	ERC20	6	0xe573a6e11f8506620F123DBF930222163D46BCB6	0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582
Arbitrum Sepolia	ETH.ARBSEP	Gas	18	0x1de70f3e971B62A0707dA18100392af14f7fB677	
Arbitrum Sepolia	USDC.ARBSEP	ERC20	6	0x4bC32034caCcc9B7e02536945eDbC286bACbA073	0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d
Avalanche Testnet	USDC.FUJI	ERC20	6	0x8344d6f84d26f998fa070BbEA6D2E15E359e2641	0x5425890298aed601595a70AB815c96711a31Bc65
Avalanche Testnet	AVAX.FUJI	Gas	18	0xEe9CC614D03e7Dbe994b514079f4914a605B4719	
Base Sepolia	ETH.BASESEPOLIA	Gas	18	0x236b0DE675cC8F46AE186897fCCeFe3370C9eDeD	
Base Sepolia	USDC.BASESEPOLIA	ERC20	6	0xd0eFed75622e7AA4555EE44F296dA3744E3ceE19	0x036CbD53842c5426634e7929541eC2318f3dCF7e
BSC Testnet	USDC.BSC	ERC20	6	0x7c8dDa80bbBE1254a7aACf3219EBe1481c6E01d7	0x64544969ed7EBf5f083679233325356EbE738930
BSC Testnet	BNB.BSC	Gas	18	0xd97B1de3619ed2c6BEb3860147E30cA8A7dC9891	
BTC Signet Testnet	sBTC.BTC	Gas	8	0xdbfF6471a79E5374d771922F2194eccc42210B9F	
BTC Testnet4	tBTC.BTC	Gas	8	0xfC9201f4116aE6b054722E10b98D904829b469c3	
Kaia Testnet	KAIA.KAIROS	Gas	18	0xe1A4f44b12eb72DC6da556Be9Ed1185141d7C23c	
Sepolia Testnet	sETH.SEPOLIA	Gas	18	0x05BA149A7bd6dC1F937fA9046A9e05C05f3b18b0	
Sepolia Testnet	USDC.SEPOLIA	ERC20	6	0xcC683A782f4B30c138787CB5576a86AF66fdc31d	0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
Solana Devnet	SOL.SOLANA	Gas	9	0xADF73ebA3Ebaa7254E859549A44c74eF7cff7501	
Solana Devnet	USDC.SOL	ERC20	6	0xD10932EB3616a937bd4a2652c87E9FeBbAce53e5	Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr
SUI Testnet	SUI.SUI	Gas	9	0x3e128c169564DD527C8e9bd85124BF6A890E5a5f	
SUI Testnet	USDC.SUI	ERC20	6	0xE80e3e8Ac1C19c744d4c2147172489BEAF23E3C5	a1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC
TON Testnet	TON.TON	Gas	9	0x54Bf2B1E91FCb56853097BD2545750d218E245e1	
Source: https://zetachain-athens.blockpi.network/lcd/v1/public/zeta-chain/fungible/foreign_coins

New assets can be added or removed by broadcasting a transaction with a corresponding message of the fungible module on ZetaChain.

At a high-level, ZRC-20 tokens are an extension of the standard ERC-20 tokens found in the Ethereum ecosystem, ZRC-20 tokens have the added ability to manage assets on all ZetaChain-connected chains. Any fungible token, including Bitcoin, ETH, other gas assets and ERC-20-equivalents on other chains, may be represented on ZetaChain as a ZRC-20 and orchestrated as if it were any other fungible token (like an ERC-20).

Block Confirmations
When depositing to or withdrawing from ZetaChain, the protocol requires a certain number of confirmations on the connected chain before the transaction is considered final. The number of confirmations required is different for each chain. You can check the number of confirmations in the connected chains table.

Liquidity Cap
Each ZRC-20 has a total cap on the number of deposited tokens that the protocol can accept. Any assets beyond this deposited to ZetaChain from connected chains will be returned to the sender. You can view the caps on the explorer here.





ERC-20 on ZetaChain
ZetaChain's universal EVM supports standard ERC-20 tokens
ZetaChain is fully compatible with the Ethereum Virtual Machine (EVM) and ERC-20 token contracts can be deployed to ZetaChain permissionlessly.



Account Addresses
Learn about types of account address, how to use and convert between them
Overview
ZetaChain is built with Cosmos SDK and uses the Cosmos EVM module to provide EVM compatibility. Being both a Cosmos and an EVM chain means that ZetaChain supports two types of addresses: bech32 Cosmos addresses and hex EVM addresses.

Bech32 addresses are known for their human-readable format, which typically starts with a prefix related to the specific blockchain. These addresses are designed to reduce the risk of errors in transcription and input, thanks to their built-in error detection capabilities. ZetaChain uses the zeta prefix for its bech32 addresses.

EVM addresses, on the other hand, are represented as 20-byte hexadecimal strings and are used to identify accounts on the Ethereum Virtual Machine.

A single account can be represented by both a bech32 address and an EVM address if they are derived from the same public key.

For example, let's consider the following bech32 address:

zeta19nfaqu9wr0fktyyampva98ec025kjy0phww5um

You can query the balance of the account associated with this address using the HTTP API:

https://zetachain-athens.blockpi.network/lcd/v1/public/cosmos/bank/v1beta1/balances/zeta19nfaqu9wr0fktyyampva98ec025kjy0phww5um

The equivalent EVM address for the same account is:

0x2cD3D070aE1BD365909dD859d29F387AA96911e1

You can also query the balance of the account associated with this address using the Foundry cast:

cast balance 0x2cD3D070aE1BD365909dD859d29F387AA96911e1 --rpc-url https://zetachain-athens-evm.blockpi.network/v1/rpc/public

As you can see, both queries return the same balance.

This means, for example, that you can import the same mnemonic into a Cosmos wallet and an EVM wallet and access the same account. Some wallets, like Keplr display both bech32 and hex addresses.

You don't need to transfer your tokens between a bech32 address and an hex address that represent the same account.

Account Type
If you're having issues interacting from the same account from Cosmos and EVM wallets, check out the account type using the chain's API:

https://zetachain-athens.blockpi.network/lcd/v1/public/cosmos/auth/v1beta1/accounts/zeta19nfaqu9wr0fktyyampva98ec025kjy0phww5um

For Cosmos and EVM compatiblity the account @type should be /ethermint.crypto.v1.ethsecp256k1.PubKey.

Account Address Converter
To convert between bech32 and EVM addresses, you can use the address converter.


UNIVERSAL ASSEST:

Overview
A set of standards that enable cross-chain interoperability for NFTs and fungible tokens
The Universal NFT and Token standards enable non-fungible tokens (ERC-721 NFTs) and fungible tokens (ERC-20) to be minted on any chain and seamlessly transferred between connected chains.

For simplicity, we'll refer to both Universal NFTs and Universal Tokens as "assets" throughout this document.

When transferring assets between chains, an asset is burned on the source chain. The asset's metadata and information are sent in a message to the asset contract on the destination chain, where a corresponding asset is minted.

Both Universal NFT and Universal Token projects consist of two contracts: Universal and Connected.

The Universal contract is deployed on ZetaChain. It is used to:

Mint assets on ZetaChain
Transfer assets from ZetaChain to a connected chain
Handle incoming asset transfers from a connected chain to ZetaChain
Handle asset transfers between connected chains
The Connected contract is deployed on one or more connected EVM chains. It is used to:

Mint assets on a connected chain
Transfer assets to another connected chain or ZetaChain
Handle incoming asset transfers from ZetaChain or another connected chain
A Universal contract deployment on ZetaChain is required, while Connected contracts can be deployed as needed to enable asset transfers for specific chains.

A universal asset can be minted on any chain — ZetaChain or any connected EVM chain.

For Universal NFTs, when an asset is minted, it receives a persistent ID that is unique across all chains. This ID remains unchanged when the asset is transferred between chains.

Assets can be transferred from ZetaChain to a connected chain, from a connected chain to ZetaChain, and between connected chains. ZetaChain acts as a hub for cross-chain transactions, so all transfers are routed through it. For example, when transferring an asset from Ethereum to BNB, two cross-chain transactions are initiated: Ethereum → ZetaChain → BNB. This does not affect transfer time or cost, but it allows the system to scale linearly as more chains are added.

Cross-chain asset transfers support reverts. If the transfer fails on the destination chain, the asset is returned to the original sender on the source chain.

Asset contracts only accept cross-chain calls from trusted contracts. Each contract on a connected chain stores the address of the Universal contract on ZetaChain. The Universal contract, in turn, stores the addresses of the connected contracts on other chains. This ensures that only contracts from the same asset collection can participate in cross-chain transfers.

Here’s the flow using a Universal NFT as an example:

https://excalidraw.com/#json=dQJisu_uJ0N8T6IPi2m0E,PJU63ktFfbi1WsfAXsompA

Deployment
Deploy the Universal contract on ZetaChain. This is a required step, as ZetaChain acts as the hub for all cross-chain transfers, even between connected EVM chains.
Deploy a Connected contract on a supported EVM chain (e.g., Ethereum, Base, Polygon, BNB).
On a universal contract on ZetaChain, run setConnected(zrc20, connectedAddress), where:
zrc20 is the ZRC-20 contract of the gas token for the target EVM chain. This acts as a chain identifier.
connectedAddress is the address of the Connected contract on the EVM chain (from step 2).
On the connected EVM chain, run ConnectedAsset.setUniversal(universalAddress), where universalAddress is the address of the Universal contract on ZetaChain (from step 1).
You now have trusted asset contracts deployed and linked on ZetaChain and a connected EVM chain.

To enable transfers to additional EVM chains, repeat steps 2 and 3 for each new chain.

setConnected and setUniversal are required to establish a secure trust relationship between the asset contracts. Each contract verifies that cross-chain calls originate from a trusted counterpart.

Gas Fees
EVM → ZetaChain: No cross-chain fee is charged.
ZetaChain → EVM: A cross-chain fee is paid in ZETA, based on the ZRC-20 withdraw fee for the destination chain. ZETA is automatically swapped to the destination chain's gas token ZRC-20 to cover execution.
EVM → EVM: A cross-chain fee is paid in the gas token of the source chain. For example, if transferring an asset from Ethereum to BNB, the fee is paid in ETH. ZetaChain uses ZRC-20 ETH to cover the execution and swaps it for ZRC-20 BNB to call the destination chain.
Revert Handling
If a cross-chain transfer fails on the destination chain (e.g., due to out-of-gas, contract rejection, or network error), the asset is reverted to the original sender.

When a transfer between two connected EVM chains fails, the asset is reverted to the original sender on ZetaChain, rather than the original source chain. This avoids costly return operations to the EVM chain where the transfer started. The sender can then initiate a new transfer to the same or another chain.



Universal NFT
The Universal NFT standard enables non-fungible tokens (ERC-721 NFT) to be minted on any chain and seamlessly transferred between connected chains.
Universal NFTs are fully interoperable ERC-721 tokens that can be minted and transferred across any connected chain without wrapping or bridging. Each NFT has a persistent token ID that remains the same on every chain, and metadata is preserved during cross-chain transfers. This enables true chain-agnostic ownership and interaction for use cases like cross-chain games, marketplaces, and identity.

Universal NFTs on ZetaChain are built on the standard OpenZeppelin ERC-721 implementation and use UUPS upgradeable proxy patterns, allowing developers to extend and upgrade NFT logic safely over time.

Create a New Universal NFT
Create a new Universal NFT project:

npx zetachain@next new --project nft

Install dependencies:

cd nft
yarn


Compile Contracts:

npx hardhat compile --force

Upgrade an Existing ERC-721 Project
You can upgrade your existing ERC-721 project to become a Universal NFT by installing the official standard contracts package:

yarn add @zetachain/standard-contracts

Then, update your contract using the example implementation as a reference, see the commented lines that include Universal NFT-specific logic for ZetaChain integration.

This allows your NFT to support cross-chain minting, transfers, and persistent token IDs across ZetaChain and connected EVM chains.

Deploy on Testnet
Deploy contracts on ZetaChain, Base and Ethereum.

ZETACHAIN_NFT=$(npx hardhat nft:deploy \
  --network zeta_testnet \
  --uniswap-router 0x2ca7d64A7EFE2D62A725E2B35Cf7230D6677FfEe \
  --name ZetaChainUniversalNFT \
  --json | jq -r .contractAddress) && echo $ZETACHAIN_NFT


BASE_NFT=$(npx hardhat nft:deploy \
  --network base_sepolia \
  --gateway 0x0c487a766110c85d301d96e33579c5b317fa4995 \
  --name EVMUniversalNFT \
  --json | jq -r .contractAddress) && echo $BASE_NFT


ETHEREUM_NFT=$(npx hardhat nft:deploy \
  --network sepolia_testnet \
  --gateway 0x0c487a766110c85d301d96e33579c5b317fa4995 \
  --name EVMUniversalNFT \
  --json | jq -r .contractAddress) && echo $ETHEREUM_NFT


Connect Contracts
After deployment, link the contracts so they can trust each other for cross-chain communication. Use setConnected on ZetaChain to register Connected contracts by their ZRC-20 gas token (used to identify the chain):

npx hardhat nft:set-connected \
  --contract $ZETACHAIN_NFT \
  --connected $BASE_NFT \
  --zrc20 $BASE_ZRC20 \
  --network zeta_testnet \
  --json


npx hardhat nft:set-connected \
  --contract $ZETACHAIN_NFT \
  --connected $ETHEREUM_NFT \
  --zrc20 $ETHEREUM_ZRC20 \
  --network zeta_testnet


Then, on each connected chain, use setUniversal to point back to the Universal contract on ZetaChain:

npx hardhat nft:set-universal \
  --contract $BASE_NFT \
  --universal $ZETACHAIN_NFT \
  --network base_sepolia


npx hardhat nft:set-universal \
  --contract $ETHEREUM_NFT \
  --universal $ZETACHAIN_NFT \
  --network sepolia_testnet


This ensures only authorized contracts can send and receive NFT transfers across chains.

Mint on ZetaChain
NFT1=$(npx hardhat nft:mint \
  --contract $ZETACHAIN_NFT \
  --token-uri https://example.org \
  --network zeta_testnet \
  --json | jq -r .tokenId) && echo $NFT1


https://zetachain-testnet.blockscout.com/tx/0xc9f8e3a8b3e1f1e2511fae649d510f0ce483dd1b3c481c8b01f066a0ca342458

Transfer from ZetaChain to Base
Transfer the token from ZetaChain to Base. Gas amount (specified in ZETA) is an estimate. Unused tokens are refunded to the user.

Use ZRC-20 Base ETH as the destination address to specify the chain to which the NFT will be transferred.

npx hardhat nft:transfer \
  --contract $ZETACHAIN_NFT \
  --destination $BASE_ZRC20 \
  --token-id $NFT1 \
  --network zeta_testnet \
  --gas-amount 5


🚀 Successfully transferred NFT to the contract.
📜 Contract address: 0xb2c095a2e05B5C886041a53b6f3d62736fC2C1Bc
🖼 NFT Contract address: 0xb2c095a2e05B5C886041a53b6f3d62736fC2C1Bc
🆔 Token ID: 269200511667900488584833727349313006688770271102
🔗 Transaction hash: 0x219370f4200c934dd647a1ea27099c25061de2fb25bb13194ec7bd328cdb624e
⛽ Gas used: 500000


Outgoing cross-chain transaction from ZetaChain to Base:

https://zetachain-athens.blockpi.network/lcd/v1/public/zeta-chain/crosschain/inboundHashToCctxData/0x219370f4200c934dd647a1ea27099c25061de2fb25bb13194ec7bd328cdb624e

https://sepolia.basescan.org/tx/0xb56e0fccb95d40e79d6078dbdf2b4e47454e4c6da1dd7a9afb6082e1bd9f1a78

Transfer from Base to Ethereum
Let’s move the NFT again — this time from Base to Ethereum. You’ll reference the same token ID, which remains unchanged.

npx hardhat nft:transfer \
  --contract $BASE_NFT \
  --network base_sepolia \
  --destination $ETHEREUM_ZRC20 \
  --token-id $NFT1 \
  --gas-amount 0.005


🚀 Successfully transferred NFT to the contract.
📜 Contract address: 0x7a72AE51CCfAda57B20f8C7d8b138d35E46a2D60
🖼 NFT Contract address: 0x7a72AE51CCfAda57B20f8C7d8b138d35E46a2D60
🆔 Token ID: 269200511667900488584833727349313006688770271102
🔗 Transaction hash: 0x27c3ca27da7576e8b00ceb588c9aa5e5622dcf03273d22c58660268149c445a4
⛽ Gas used: 118428


Incoming cross-chain transaction from Base to ZetaChain:

https://zetachain-athens.blockpi.network/lcd/v1/public/zeta-chain/crosschain/inboundHashToCctxData/0x27c3ca27da7576e8b00ceb588c9aa5e5622dcf03273d22c58660268149c445a4

Outgoing cross-chain transaction from ZetaChain to Ethereum:

https://zetachain-athens.blockpi.network/lcd/v1/public/zeta-chain/crosschain/inboundHashToCctxData/0x5cfb1c21201025482909f2bc390e0ada032e2c37d0f8e1861a7e248083c8d015

https://sepolia.etherscan.io/tx/0x171034238d6cfb51c2a8a8e1a023034523d579643d23d9bcbd98c70ad76b1eb9

Source Code
https://github.com/zeta-chain/standard-contracts/tree/main/contracts/nft




Universal Token
The Universal Token standard enables ERC-20 fungible tokens to be minted on any chain and seamlessly transferred between connected chains.
Universal Tokens are fully interoperable ERC-20 tokens that can be minted and transferred across any connected chain without wrapping or bridging. Each token retains its supply and metadata across chains, enabling true chain-agnostic fungibility and seamless use in multichain DeFi, payments, and governance systems.

Universal Tokens on ZetaChain are built on the standard OpenZeppelin ERC-20 implementation and use UUPS upgradeable proxy patterns, allowing developers to extend and upgrade token logic safely over time.

Create a New Universal Token
Create a new Universal Token project:

npx zetachain@next new --project token

Install dependencies:

cd token
yarn


Compile Contracts:

npx hardhat compile --force

Upgrade an Existing ERC-20 Project
You can upgrade your existing ERC-20 project to become a Universal Token by installing the official standard contracts package:

yarn add @zetachain/standard-contracts

Then, update your contract using the example implementation as a reference—see the commented lines that include Universal Token-specific logic for ZetaChain integration.

This allows your token to support cross-chain minting, transfers, and persistent supply tracking across ZetaChain and connected EVM chains.

Deploy on Testnet
Deploy contracts on ZetaChain, Base and Ethereum.

ZETACHAIN_TOKEN=$(npx hardhat token:deploy \
  --network zeta_testnet \
  --uniswap-router 0x2ca7d64A7EFE2D62A725E2B35Cf7230D6677FfEe \
  --name ZetaChainUniversalToken \
  --json | jq -r .contractAddress) && echo $ZETACHAIN_TOKEN


BASE_TOKEN=$(npx hardhat token:deploy \
  --network base_sepolia \
  --gateway 0x0c487a766110c85d301d96e33579c5b317fa4995 \
  --name EVMUniversalToken \
  --json | jq -r .contractAddress) && echo $BASE_TOKEN


ETHEREUM_TOKEN=$(npx hardhat token:deploy \
  --network sepolia_testnet \
  --gateway 0x0c487a766110c85d301d96e33579c5b317fa4995 \
  --name EVMUniversalToken \
  --json | jq -r .contractAddress) && echo $ETHEREUM_TOKEN


Connect Contracts
After deployment, link the contracts so they can trust each other for cross-chain communication. Use setConnected on ZetaChain to register Connected contracts by their ZRC-20 gas token (used to identify the chain):

npx hardhat token:set-connected \
  --contract $ZETACHAIN_TOKEN \
  --connected $BASE_TOKEN \
  --zrc20 $BASE_ZRC20 \
  --network zeta_testnet \
  --json


npx hardhat token:set-connected \
  --contract $ZETACHAIN_TOKEN \
  --connected $ETHEREUM_TOKEN \
  --zrc20 $ETHEREUM_ZRC20 \
  --network zeta_testnet


Then, on each connected chain, use setUniversal to point back to the Universal contract on ZetaChain:

npx hardhat token:set-universal \
  --contract $BASE_TOKEN \
  --universal $ZETACHAIN_TOKEN \
  --network base_sepolia


npx hardhat token:set-universal \
  --contract $ETHEREUM_TOKEN \
  --universal $ZETACHAIN_TOKEN \
  --network sepolia_testnet


This ensures only authorized contracts can send and receive token transfers across chains.

Mint on ZetaChain
npx hardhat token:mint \
  --contract $ZETACHAIN_TOKEN \
  --amount 10
  --network zeta_testnet


https://zetachain-testnet.blockscout.com/tx/0xc9f8e3a8b3e1f1e2511fae649d510f0ce483dd1b3c481c8b01f066a0ca342458

Transfer from ZetaChain to Base
Transfer the token from ZetaChain to Base. Gas amount (specified in ZETA) is an estimate. Unused tokens are refunded to the user.

Use ZRC-20 Base ETH as the destination address to specify the chain to which the tokens will be transferred.

npx hardhat token:transfer \
  --from $ZETACHAIN_TOKEN \
  --to $BASE_ZRC20 \
  --amount 10 \
  --network zeta_testnet \
  --gas-amount 5


🚀 Successfully transferred token.
📜 Contract address: 0x22a4E73909bAB067B05185879Cd7FAF335f41920
👤 Amount: 10
🔗 Transaction hash: 0xe8b682b0501532154b49a852853bcdc22f843e23068c88c319699975ecef6cc2
⛽ Gas used: 500000


Outgoing cross-chain transaction from ZetaChain to Base:

https://zetachain-athens.blockpi.network/lcd/v1/public/zeta-chain/crosschain/inboundHashToCctxData/0xe8b682b0501532154b49a852853bcdc22f843e23068c88c319699975ecef6cc2

https://sepolia.basescan.org/tx/0xd48bb35c371570e7c3769d4ebd75f157ac4ddd4f081aedac1e9d4b6a452460db

Transfer from Base to Ethereum
Let’s move the token again — this time from Base to Ethereum.

npx hardhat token:transfer \
  --from $BASE_TOKEN \
  --network base_sepolia \
  --to $ETHEREUM_ZRC20 \
  --amount 10 \
  --gas-amount 0.005


🚀 Successfully transferred token to the contract.
📜 Contract address: 0x7a72AE51CCfAda57B20f8C7d8b138d35E46a2D60
🖼 Token Contract address: 0x7a72AE51CCfAda57B20f8C7d8b138d35E46a2D60
🆔 Token ID: 269200511667900488584833727349313006688770271102
🔗 Transaction hash: 0x27c3ca27da7576e8b00ceb588c9aa5e5622dcf03273d22c58660268149c445a4
⛽ Gas used: 118428


Incoming cross-chain transaction from Base to ZetaChain:

https://zetachain-athens.blockpi.network/lcd/v1/public/zeta-chain/crosschain/inboundHashToCctxData/0xdb7b9a8ab3b7c59e0877f403a8ece258ffff2539ebbe4c19d2089f6657855374

Outgoing cross-chain transaction from ZetaChain to Ethereum:

https://zetachain-athens.blockpi.network/lcd/v1/public/zeta-chain/crosschain/inboundHashToCctxData/0x686f3b46bde24ca54394a9f782a4517b42e4032a5be3ec7b715d13b6be1481f4

https://sepolia.etherscan.io/tx/0x14348a0acce19ae3e2bc52d1b7be71d6612a5454a0bfcda48323ace5a84781c8

Source Code
https://github.com/zeta-chain/standard-contracts/tree/main/contracts/token









Solana Protocol Contracts
Note: Mainnet-beta, testnet, devnet gateway program address:

ZETAjseVjuFsxdRxo6MmTCvqFwb3ZHUx56Co3vCmGis
The PDA account address (derived from seeds b"meta" and canonical bump) is

2f9SLuUNb7TNeM6gzBwT4ZjbL5ZyKzzHg1Ce9yiquEjj
The PDA account address (derived from seeds `b"rent-payer")

Am1aA3XQciu3vMG6E9yLa2Y9TcTf2XB3D3akLtjVzu3L
Important Note: The keypair in this repository is public and is used only for development purposes. It should not be used on testnet or mainnet environments.

Introduction
This repository hosts the smart contract (program) deployed on the Solana network to enable ZetaChain's cross-chain functionality. It consists of a single program that supports the following actions:

Users on the Solana network can send SOL to the program to deposit into ZetaChain, with the option to invoke a ZetaChain EVM contract.
Contracts on the ZetaChain EVM can withdraw SOL to users on the Solana network.
Build and Test Instructions
Prerequisites: a recent version of rust compiler and cargo package manger must be installed. The program is built with the anchor framework so it needs to be installed as well; see installation

Please install compatible Solana tools and anchor-cli before build, otherwise the program will not be built successfully

$ cargo install --git https://github.com/coral-xyz/anchor avm --force

$ avm install 0.31.0

$ sh -c "$(curl -sSfL https://release.anza.xyz/v2.1.0/install)"
To show the installed versions of the tools

$ solana --version
solana-cli 2.1.0

$ rustc --version
rustc 1.81.0

$ anchor --version
anchor-cli 0.31.1
To build (this will require at least 2GB disk space)

$ anchor build
To run the tests

$ anchor test
To generate Go bindings for program's IDL Development environments : Localnet

$ make generate-dev
Production environments : Mainnet,Testnet

$ make generate-prod
Authentication and Authorization
Anyone can deposit and remote invoke ZetaChain contracts.

Only ZetaChain TSS account can call withdraw on the program. The ZetaChain TSS account is a collection of Observer/Signers which uses ECDSA TSS (Threshold Signature Scheme) to sign outbound transactions. The TSS address will appear in this program a single ECDSA secp256k1 address; but it does not have a single private key, rather its private key consists of multiple key shares and they collectively sign a message in a KeySign MPC ceremony. The program authenticates via verifying the TSS signature and is authorized by ZetaChain to perform outbound transactions as part of ZetaChain cross-chain machinery.

The ZetaChain TSS is on ECDSA secp256k1 curve; But Solana native digital signature scheme is EdDSA Ed25519 curve. Therefore the program uses custom logic to verify the TSS ECDSA signature (like alternative authentication in smart contract wallet); the native transaction signer (fee payer on Solana) does not carry authorization and it's only used to build the transaction and pay tx fees. There are no restrictions on who the native transaction signer/fee payer is. The following code excerpt is for authenticating TSS signature in the contract itself, using the Rust secp256k1 library bundled with solana:

protocol-contracts-solana/programs/protocol-contracts-solana/src/lib.rs

Lines 116 to 121 in 01eeb97

 let address = recover_eth_address(&message_hash, recovery_id, &signature)?; // ethereum address is the last 20 Bytes of the hashed pubkey 
 msg!("recovered address {:?}", address); 
 if address != pda.tss_address { 
     msg!("ECDSA signature error"); 
     return err!(Errors::TSSAuthenticationFailed); 
 } 
The function recover_eth_address is implemented in the gateway program:

protocol-contracts-solana/programs/protocol-contracts-solana/src/lib.rs

Lines 180 to 196 in 01eeb97

 fn recover_eth_address( 
     message_hash: &[u8; 32], 
     recovery_id: u8, 
     signature: &[u8; 64], 
 ) -> Result<[u8; 20]> { 
     let pubkey = secp256k1_recover(message_hash, recovery_id, signature) 
         .map_err(|_| ProgramError::InvalidArgument)?; 
  
     // pubkey is 64 Bytes, uncompressed public secp256k1 public key 
     let h = hash(pubkey.to_bytes().as_slice()).to_bytes(); 
     let address = &h.as_slice()[12..32]; // ethereum address is the last 20 Bytes of the hashed pubkey 
     msg!("recovered address {:?}", address); 
  
     let mut eth_address = [0u8; 20]; 
     eth_address.copy_from_slice(address); 
     Ok(eth_address) 
 } 
The TSS signature is a ECDSA secp256k1 signature; its public key therefore address (Ethereum compatible hashing from pubkey) is therefore verifiable using the secp256k1_recover function. Alternatively, Solana runtime also provides a program to provide this verification service via CPI; see proposal 48 which might be more cost efficient.

In the instruction, the ECDSA signed messagehash must commit to the nonce, amount, and to address. See the check in these instructions like:

protocol-contracts-solana/programs/protocol-contracts-solana/src/lib.rs

Lines 110 to 114 in 01eeb97

 let mut concatenated_buffer = Vec::new(); 
 concatenated_buffer.extend_from_slice(&nonce.to_be_bytes()); 
 concatenated_buffer.extend_from_slice(&amount.to_be_bytes()); 
 concatenated_buffer.extend_from_slice(&ctx.accounts.to.key().to_bytes()); 
 require!(message_hash == hash(&concatenated_buffer[..]).to_bytes(), Errors::MessageHashMismatch); 
The commitment of nonce in the signature prevents replay of the TSS ECDSA signed message. Also (to be added in #6) a chain id of Solana should be added to the commitment of the message hash, so that the signature cannot be replayed on _other blockchains that potentially uses similar authentication (say in TON).
Relevant Account and Addresses
The Gateway program derives a PDA (Program Derived Address) with seeds b"meta" and canonical bump. This PDA account/address actually holds the SOL balance of the Gateway program. For SPL tokens, the program stores the SPL token in PDA derived ATAs. For each SPL token (different mint account), the program creates an ATA from the PDA and the Mint (standard way of deriving ATA in Solana SPL program).

The PDA account itself is a data account that holds Gateway program state, namely the following data types

protocol-contracts-solana/programs/protocol-contracts-solana/src/lib.rs

Lines 271 to 275 in 01eeb97

 pub struct Pda { 
     nonce: u64,            // ensure that each signature can only be used once 
     tss_address: [u8; 20], // 20 bytes address format of ethereum 
     authority: Pubkey, 
 } 
The nonce is incremented on each successful withdraw transaction, and it's used to prevent replay of signed ECDSA messages. The tss_address is the TSS address of ZetaChain (20Bytes, Ethereum style). authority is the one who can update the TSS address stored in PDA account. The initialize instruction sets nonce to 0.

Troubleshooting
MacOS error when running anchor test or solana-test-validator
If you see errors like

Unable to get latest blockhash. Test validator does not look started. Check ".anchor/test-ledger/test-ledger-log.txt" for errors. Consider increasing [test.startup_wait] in Anchor.toml.
or

% solana-test-validator --reset
Ledger location: test-ledger
Log: test-ledger/validator.log
Error: failed to start validator: Failed to create ledger at test-ledger: io error: Error checking to unpack genesis archive: Archive error: extra entry found: "._genesis.bin" Regular
This is because the BSD tar program is not compatible with the GNU tar program.

To fix the issue: install GNU tar program using homebrew and export it's executable path in your .zshrc file:

Mac with Apple Silicon

brew install gnu-tar
# Put this in ~/.zshrc
export PATH="/opt/homebrew/opt/gnu-tar/libexec/gnubin:$PATH"
Intel-based Mac

brew install gnu-tar
# Put this in ~/.zshrc
export PATH="/usr/local/opt/gnu-tar/libexec/gnubin:$PATH"
see https://solana.stackexchange.com/questions/4499/blockstore-error-when-starting-solana-test-validator-on-macos-13-0-1/16319#16319




List of Chains

Mainnet Beta

Testnet
ID	Name	Label	Supported Tokens	VM	Consensus	CCTX Gateway	Required Confirmations	Gateway Docs
80002	Amoy Testnet	amoy_testnet	POL.AMOY, USDC.AMOY	EVM	Ethereum	observers	32	EVM Gateway
84532	Base Sepolia	base_sepolia	ETH.BASESEPOLIA, USDC.BASESEPOLIA	EVM	Ethereum	observers	32	EVM Gateway
97	BNB Testnet	bsc_testnet	USDC.BSC, BNB.BSC	EVM	Ethereum	observers	20	EVM Gateway
18333	Bitcoin Signet Testnet	btc_signet_testnet	sBTC.BTC	NO VM	Bitcoin	observers	2	Bitcoin Gateway
18334	Bitcoin Testnet4	btc_testnet4	tBTC.BTC	NO VM	Bitcoin	observers	10	Bitcoin Gateway
421614	Arbitrum Sepolia	arbitrum_sepolia	ETH.ARBSEP, USDC.ARBSEP	EVM	Ethereum	observers	5	EVM Gateway
43113	Avalanche Testnet	avalanche_testnet	USDC.FUJI, AVAX.FUJI	EVM	Ethereum	observers	20	EVM Gateway
2015141	Ton Testnet	ton_testnet	TON.TON	TVM	Catchain Consensus	observers	1	TON Gateway
103	Sui Testnet	sui_testnet	SUI.SUI, USDC.SUI	MVM SUI	SUI Consensus	observers	1	Sui Gateway
1001	Kaia Testnet	kaia_testnet	KAIA.KAIROS	EVM	Ethereum	observers	1	EVM Gateway
11155111	Sepolia Testnet	sepolia_testnet	sETH.SEPOLIA, USDC.SEPOLIA	EVM	Ethereum	observers	14	EVM Gateway
901	Solana Devnet	solana_devnet	SOL.SOLANA, USDC.SOL	SVM	Solana Consensus	observers	32	Solana Gateway
7001	ZetaChain Testnet	zeta_testnet		EVM







Functionality
State of ZetaChain Functionality
EVM
Feature	Mainnet	Testnet	E2E	Localnet
Deposit/withdraw native coin	✅	✅	✅	✅
Deposit/withdraw fungible token	✅	✅	✅	✅
Deposit and call (native coin)	✅	✅	✅	✅
Deposit and call (fungible token)	✅	✅	✅	✅
Withdraw and call (native coin)	✅	✅	✅	✅
Withdraw and call (fungible token)	✅	✅	✅	✅
Deposit ZETA	✅	✅	✅	❌
TSS Direct Deposits	⚠️	⚠️	⚠️	❌
Withdraw ZETA	✅	✅	✅	❌
Deposit and call (ZETA)	❌	❌	❌	❌
Withdraw and call (ZETA)	❌	❌	❌	❌
No asset call to ZetaChain	✅	✅	✅	✅
No asset call to connected chain	✅	✅	✅	✅
onRevert	✅	✅	✅	✅
Bitcoin
Feature	Mainnet	Testnet	E2E	Localnet
Deposit/withdraw native coin	✅	✅	✅	❌
Deposit and call (native coin)	✅	✅	✅	❌
Solana
Feature	Mainnet	Testnet	E2E	Localnet
Deposit/withdraw native coin	✅	✅	✅	✅
Deposit/withdraw fungible token	✅	✅	✅	✅
Deposit and call (native coin)	✅	✅	✅	✅
Deposit and call (fungible token)	✅	✅	✅	✅
Withdraw and call (fungible token)	❌	✅	✅	✅
Withdraw and call (native coin)	❌	✅	✅	✅
Deposit ZETA	❌	❌	❌	❌
Withdraw ZETA	❌	❌	❌	❌
Deposit and call (ZETA)	❌	❌	❌	❌
Withdraw and call (ZETA)	❌	❌	❌	❌
No asset call to ZetaChain	❌	❌	❌	❌
No asset call to connected chain	❌	❌	❌	❌
onRevert	❌	❌	❌	❌
Sui
Feature	Mainnet	Testnet	E2E	Localnet
Deposit/withdraw native coin	❌	✅	✅	✅
Deposit/withdraw fungible token	❌	✅	✅	✅
Deposit and call (native coin)	❌	✅	✅	✅
Deposit and call (fungible token)	❌	✅	✅	✅
Withdraw and call (native coin)	❌	❌	❌	✅
Withdraw and call (fungible token)	❌	❌	❌	❌
Deposit ZETA	❌	❌	❌	❌
Withdraw ZETA	❌	❌	❌	❌
Deposit and call (ZETA)	❌	❌	❌	❌
No asset call to ZetaChain	❌	❌	❌	❌
No asset call to connected chain	❌	❌	❌	❌
onRevert	❌	❌	❌	❌
TON
Feature	Mainnet	Testnet	E2E	Localnet
Deposit/withdraw native coin	❌	✅	✅	✅
Deposit/withdraw fungible token	❌	❌	❌	❌
Deposit and call (native coin)	❌	✅	✅	✅
Deposit and call (fungible token)	❌	❌	❌	❌
Withdraw and call (native coin)	❌	❌	❌	❌
Withdraw and call (fungible token)	❌	❌	❌	❌
Deposit ZETA	❌	❌	❌	❌
Withdraw ZETA	❌	❌	❌	❌
Deposit and call (ZETA)	❌	❌	❌	❌
No asset call to ZetaChain	❌	❌	❌	❌
No asset call to connected chain	❌	❌	❌	❌
onRevert	❌	❌	❌	❌
Terminology
Deposit/Withdraw Native Coin
Transfer of the native asset (e.g., ETH, SOL) between ZetaChain and a Connected Chain without smart contract calls.

Deposit/Withdraw Fungible Token
Transfer of fungible tokens (e.g., ERC20 for Ethereum, SPL for Solana) between ZetaChain and a Connected Chain without smart contract calls.

Deposit and Call (Native Coin)
Transfer of a native coin from a Connected Chain to ZetaChain, followed by a smart contract call on ZetaChain.

Deposit and Call (Fungible Token)
Transfer of a fungible token from a Connected Chain to ZetaChain, followed by a smart contract call on ZetaChain.

Withdraw and Call (Native Coin)
Transfer of a native coin from ZetaChain to a Connected Chain, followed by a smart contract call on the Connected Chain.

Withdraw and Call (Fungible Token)
Transfer of a fungible token from ZetaChain to a Connected Chain, followed by a smart contract call on the Connected Chain.

TSS Direct Deposits
Transfers directly to the TSS address on EVM Connected Chains. This feature is only supported on Ethereum and is being disabled on all other EVM chains.

Call
A smart contract call between ZetaChain and a Connected Chain without transferring assets.

onRevert
Execution of the onRevert function of a contract on a connected chain as a result of a reverted call from a connected chain to a universal contract on ZetaChain.

E2E
The protocol level development environment (link).





ZetaChain
Make calls from universal apps and withdraw tokens to connected chains
To make a call from a universal app to a contract on a connected chain or withdraw tokens, use the ZetaChain gateway.

The ZetaChain gateway supports:

Withdrawing ZRC-20 tokens as native gas or ERC-20 tokens to connected chains.
Withdrawing tokens and making a contract call on connected chains.
Calling contracts on connected chains.
Note: Withdrawing ZETA tokens is currently not supported and will revert with ZETANotSupported().

Withdraw ZRC-20 Tokens
To withdraw ZRC-20 tokens to an EOA or a contract on a connected chain, use the withdraw function of the gateway contract:

function withdraw(bytes memory receiver, uint256 amount, address zrc20, RevertOptions calldata revertOptions) external;

The receiver can be either an externally-owned account (EOA) or a contract on a connected chain. Even if the receiver is a smart contract with a standard receive function, the withdraw function will not trigger a contract call. If you need to withdraw and call a contract on a connected chain, use the withdrawAndCall function instead.

The receiver is of type bytes to accommodate different address formats used by various chains (e.g., Bech32 for Bitcoin). This type ensures the receiver address is chain-agnostic. When withdrawing to an EVM chain, ensure you convert address to bytes.

When withdrawing to non-EVM chains make sure to encode the receiver address to bytes as string, meaning you take an address as a string of characters and convert it into bytes.

For example, if the receiver address on Solana is:

GBwCxLUt5qn12aCD4uVKMWnoXPn2DoH126p8FrFmGNUy

The receiver bytes should be:

0x47427743784c557435716e31326143443475564b4d576e6f58506e32446f4831323670384672466d474e5579

The amount specifies the quantity to withdraw, and zrc20 is the ZRC-20 address of the token being withdrawn.

The revertOptions.revertMessage must not exceed 1024 bytes in length.

You don't need to specify the destination chain since each ZRC-20 token is tied to the chain from which it was deposited. A ZRC-20 token can only be withdrawn to its originating chain. For example, to withdraw ZRC-20 USDC.ETH to the BNB chain, you must first swap it to ZRC-20 USDC.BNB.

Withdraw ZRC-20 Tokens and Call a Contract on a Connected Chain
To withdraw ZRC-20 tokens and call a contract on a connected chain, use the withdrawAndCall function:

function withdrawAndCall(bytes memory receiver, uint256 amount, address zrc20, bytes calldata message, CallOptions calldata callOptions, RevertOptions calldata revertOptions) external;

This function withdraws tokens and makes a call to a contract on the connected chain identified by the zrc20 address. For instance, if ZRC-20 ETH is withdrawn, the call is made to a contract on Ethereum.

The combined length of message and revertOptions.revertMessage must not exceed 1024 bytes.

Call a Contract on a Connected Chain
To call a contract on a connected chain without withdrawing tokens, use the call function:

function call(bytes memory receiver, address zrc20, bytes calldata message, CallOptions calldata callOptions, RevertOptions calldata revertOptions) external;

Here, zrc20 represents the ZRC-20 token address of the gas token for the destination chain. This address acts as an identifier for the target chain. For example, to call a contract on Ethereum, use the ZRC-20 ETH token address.

The combined length of message and revertOptions.revertMessage must not exceed 1024 bytes.

Call Options
The CallOptions parameter specifies details for making calls to contracts on connected chains. It is used in both the call and withdrawAndCall functions:

struct CallOptions {
    uint256 gasLimit;
    bool isArbitraryCall;
}


gasLimit: The maximum gas the cross-chain contract call can consume. If the gas usage exceeds this limit, the transaction reverts.
isArbitraryCall: Determines whether the call is "arbitrary" (true) or "authenticated" (false).
An arbitrary call invokes any function on a connected chain but does not retain the original caller's identity—within the target contract, msg.sender is the Gateway address, not the originating universal contract. This is suitable for scenarios like token swaps, where the caller's identity is unnecessary.

An authenticated call specifically targets the onCall function of a contract on the connected chain. Authentication is achieved because the onCall function receives the context.sender parameter, referencing the originating universal contract. This allows the target contract to verify and trust the initiating universal app, rejecting unauthorized calls.

Format of the message Parameter
For arbitrary calls (when isArbitraryCall is true) the message parameter in the withdrawAndCall and call functions contains the encoded function selector and arguments for the target contract:

Function Selector: The first 4 bytes of the Keccak-256 hash of the function signature.
Arguments: The remaining bytes, ABI-encoded according to Ethereum's rules.
For example:

0xa777d0dc00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000005616c696365000000000000000000000000000000000000000000000000000000

Function Selector: 0xa777d0dc corresponds to hello(string).
Arguments: The remaining data represents the argument alice, encoded in hexadecimal (616c696365).
For authenticated calls the message is just ABI-encoded arguments (no function selector in the beginning, because authenticated calls are routed to a specific onCall function).

Revert Transactions
When a cross-chain transaction (CCTX) fails, ZetaChain uses the RevertOptions struct to determine how to handle the failure. The behavior depends on the direction of the transaction — whether it's from a connected chain to ZetaChain or from ZetaChain to a connected chain.

Connected Chain → ZetaChain (Incoming)
This scenario happens when a contract on a connected chain sends tokens or a message to ZetaChain using the depositAndCall or call function on the Gateway.


A contract on a connected chain calls depositAndCall or call on the Gateway.
The Gateway forwards the call to a universal contract on ZetaChain.
If the onCall function reverts, the protocol initiates the revert process.
Revert Behavior:

If the amount sent with the original call is enough to cover revert gas fees:

ZetaChain swaps part of the amount into gas tokens (ZRC-20) for the connected chain.
The protocol sends the remaining tokens and revert message to the revertAddress on the connected chain.
If callOnRevert is true, the Gateway invokes the onRevert function.
If the amount is insufficient or zero (for example, when it's a no-asset call) the Gateway calls onAbort on the abortAddress on ZetaChain.

ZetaChain → Connected Chain (Outgoing)

This scenario occurs when a universal contract on ZetaChain calls withdrawAndCall or call on the Gateway to interact with a contract on a connected chain.

Flow:

A universal contract on ZetaChain initiates a call to a connected chain via withdrawAndCall or call.
The Gateway forwards the message and/or tokens to the target contract on the connected chain.
If the target contract reverts, ZetaChain initiates the revert process.
Revert Behavior:

If callOnRevert is true:

The Gateway invokes the onRevert function on the revertAddress on ZetaChain.
The remaining ZRC-20 tokens are passed along with the revert context.
If the onRevert call itself reverts, the Gateway transfers ZRC-20 tokens to and calls onAbort on the abortAddress on ZetaChain.
If callOnRevert is false:

The Gateway transfers tokens to the revertAddress without invoking any function.
The RevertOptions struct specifies how assets are handled in case of a cross-chain transaction (CCTX) revert.

RevertOptions Struct
struct RevertOptions {
    address revertAddress;
    bool callOnRevert;
    address abortAddress;
    bytes revertMessage;
    uint256 onRevertGasLimit;
}


revertAddress: The address that receives tokens or revert logic. If revert address is zero, reverted tokens are transferred to the original sender of the call.
callOnRevert: Whether the Gateway should call onRevert.
abortAddress: Address to call if onCall reverts (for a no-asset call) or reverting fails (for an asset call)
revertMessage: Message passed to onRevert and onAbort.
onRevertGasLimit: Max gas allowed for onRevert. Determines the amount of tokens that will be used
onRevert
struct RevertContext {
    address asset;
    uint64 amount;
    bytes revertMessage;
}
 
interface Revertable {
    function onRevert(RevertContext calldata revertContext) external;
}


On a connected chain, asset is the ERC-20 originally deposited (or zero address for gas assets).
On ZetaChain, asset is the ZRC-20 withdrawn during the original call.
onAbort
struct AbortContext {
    bytes sender;
    address asset;
    uint256 amount;
    bool outgoing;
    uint256 chainID;
    bytes revertMessage;
}
 
interface Abortable {
    function onAbort(AbortContext calldata abortContext) external;
}


Called on ZetaChain as a fallback when revert execution fails.
Used in both incoming and outgoing transactions.
Summary
Direction	Trigger	Revert Path	Fallback if Revert Fails
Connected → ZetaChain	onCall() in universal contract fails	onRevert() on connected chain (if funded)	onAbort() on ZetaChain
ZetaChain → Connected	Target contract on connected chain fails	onRevert() on ZetaChain (if callOnRevert)	onAbort() on ZetaChain






EVM Blockchains
Make calls to universal apps and deposit tokens from Ethereum, BNB, Polygon, Base and more
To interact with universal applications from EVM-compatible chains like Ethereum, BNB, Polygon, and others, use the EVM gateway.

EVM gateway supports:

Depositing gas tokens to a universal app or an account on ZetaChain.
Depositing supported ERC-20 tokens (including ZETA tokens).
Depositing gas tokens and calling a universal app.
Depositing supported ERC-20 tokens and calling a universal app.
Calling a universal app.
Deposit Gas Tokens
To deposit tokens to an EOA or a universal contract, call the deposit function of the Gateway contract:

deposit(address receiver, RevertOptions calldata revertOptions) external payable;

The deposit function is payable, meaning it accepts native gas tokens (e.g., ETH on Ethereum), which will then be sent to a receiver on ZetaChain.

The receiver can be either an externally-owned account (EOA) or a universal app address on ZetaChain. Even if the receiver is a universal app contract with the standard receive function, the deposit function will not trigger a contract call. If you want to deposit and call a universal app, use the depositAndCall function instead.

After the deposit is processed, the receiver receives the ZRC-20 version of the deposited token—for example, ZRC-20 ETH.

Deposit ERC-20 Tokens
The deposit function can also be used to send supported ERC-20 tokens to EOAs and universal apps on ZetaChain:

deposit(address receiver, uint256 amount, address asset, RevertOptions calldata revertOptions) external;

Only supported ERC-20 assets can be deposited. The receiver gets the ZRC-20 version of the deposited token (e.g., ZRC-20 USDC.ETH).

The amount specifies the quantity, and asset is the token address of the ERC-20 being deposited.

Deposit Gas Tokens and Call a Universal App
To deposit tokens and call a universal app contract, use the depositAndCall function:

depositAndCall(address receiver, bytes calldata payload, RevertOptions calldata revertOptions) external payable;

After the cross-chain transaction is processed, the onCall function of the universal app contract is executed.

The receiver must be the address of a universal app contract.

pragma solidity 0.8.26;
 
import "@zetachain/protocol-contracts/contracts/zevm/interfaces/UniversalContract.sol";
 
contract UniversalApp is UniversalContract {
    function onCall(
        MessageContext calldata context,
        address zrc20,
        uint256 amount,
        bytes calldata message
    ) external virtual override {
        // ...
    }
}


In the onCall function, the parameters are as follows:

message: the value of the payload.
amount: the amount of deposited tokens.
zrc20: the ZRC-20 address of the deposited tokens (e.g., the contract address of ZRC-20 ETH).
context:
context.sender: the sender address on the connected chain (the EOA or contract that called the Gateway).
context.chainID: the chain ID of the connected chain from which the call was made.
When calling a universal app, the payload is passed to onCall as message. You do not need to include a function selector in the payload, since onCall is the only function that can be called from a connected chain.

Deposit ERC-20 Tokens and Call a Universal App
The depositAndCall function can also be used to call a universal app contract and send ERC-20 tokens:

depositAndCall(address receiver, uint256 amount, address asset, bytes calldata payload, RevertOptions calldata revertOptions) external;

Here, amount specifies the quantity, and asset is the token address of the ERC-20 being deposited.

In the current version of the protocol, only one ERC-20 asset can be deposited at a time.

Call a Universal App
To call a universal app without depositing tokens, use the call function:

call(address receiver, bytes calldata payload, RevertOptions calldata revertOptions) external;

The call function invokes the onCall function of the specified receiver universal contract and passes the payload as the message parameter.

The call function doesn't support revert handling. If revertOptions.callOnRevert is set to true, the transaction will fail. This is because executing a contract call on revert requires tokens to cover gas fees on ZetaChain, and the call function doesn't transfer any assets. If you need to handle reverts, use depositAndCall instead and ensure sufficient tokens are deposited to cover potential gas fees.

Revert Transactions
For information on RevertOptions, refer to the ZetaChain "Revert Transactions" documentation.





Solana
Make calls to universal apps and deposit from Solana
To interact with universal applications from Solana, use the Solana Gateway. The Solana Gateway supports:

Depositing SOL to a universal app or an account on ZetaChain
Depositing supported SPL tokens
Depositing SOL and calling a universal app
Depositing supported SPL tokens and calling a universal app
Deposit SOL
To deposit SOL to an EOA or a universal contract, call the deposit instruction of the Solana Gateway program:

pub fn deposit(ctx: Context<Deposit>, amount: u64, receiver: [u8; 20], revert_options: Option<RevertOptions>) -> Result<()>

The deposit instruction accepts SOL (in lamports) which will then be sent to a receiver on ZetaChain. Note that 1 SOL equals 1,000,000,000 lamports, so ensure you convert SOL amounts to lamports when specifying the amount parameter.

The receiver can be either an externally-owned account (EOA) or a universal app address on ZetaChain. Even if the receiver is a universal app contract with the standard receive function, the deposit instruction will not trigger a contract call. If you want to deposit and call a universal app, use the deposit_and_call instruction instead.

After the deposit is processed, the receiver receives the ZRC-20 version of the deposited token—for example, ZRC-20 SOL.

Deposit SPL Tokens
To deposit SPL tokens to an EOA or a universal contract, call the deposit_spl_token instruction:

pub fn deposit_spl_token(ctx: Context<DepositSplToken>, amount: u64, receiver: [u8; 20], revert_options: Option<RevertOptions>) -> Result<()>

Only supported SPL tokens can be deposited. The receiver gets the ZRC-20 version of the deposited token (e.g., ZRC-20 USDC.SOL). SPL tokens must be whitelisted before they can be deposited through the gateway.

The amount specifies the quantity of SPL tokens to deposit.

Deposit SOL and Call a Universal App
To deposit SOL and call a universal app contract, use the deposit_and_call instruction:

pub fn deposit_and_call(ctx: Context<Deposit>, amount: u64, receiver: [u8; 20], message: Vec<u8>, revert_options: Option<RevertOptions>) -> Result<()>

After the cross-chain transaction is processed, the onCall function of the universal app contract is executed.

The receiver must be the address of a universal app contract.

When calling a universal app, the message is passed to onCall.

Deposit SPL Tokens and Call a Universal App
The deposit_spl_token_and_call instruction can be used to call a universal app contract and send SPL tokens:

pub fn deposit_spl_token_and_call(ctx: Context<DepositSplToken>, amount: u64, receiver: [u8; 20], message: Vec<u8>, revert_options: Option<RevertOptions>) -> Result<()>

Here, amount specifies the quantity of SPL tokens to deposit.

In the current version of the protocol, only one SPL token can be deposited at a time.

Call a Universal App
pub fn call(ctx: Context<Call>, receiver: [u8; 20], message: Vec<u8>, revert_options: Option<RevertOptions>) -> Result<()>

Use when you simply need to invoke logic on ZetaChain and no asset movement is required.

Revert Options
The Solana Gateway supports transaction revert options to handle failure scenarios during cross-chain execution. You can pass an optional revert_options argument to all Gateway instructions (deposit, deposit_spl_token, deposit_and_call, etc.). This enables more granular control over what happens when a cross-chain call fails on ZetaChain.

The RevertOptions struct is defined as:

pub struct RevertOptions {
    pub revert_address: Pubkey,
    pub abort_address: [u8; 20],
    pub call_on_revert: bool,
    pub revert_message: Vec<u8>,
    pub on_revert_gas_limit: u64,
}


Fields
revert_address: Solana Pubkey that receives the tokens back if the transaction fails on ZetaChain after being processed. This must be a valid SPL token or SOL account depending on the asset deposited.
abort_address: 20-byte Ethereum-style address on ZetaChain that receives the tokens if the call to the universal contract’s onCall function fails and the protocol is unable to execute a revert back to Solana (e.g., due to insufficient gas, invalid revert path, or internal errors). This address acts as a final fallback to prevent asset loss. If call_on_revert is true, this address may also receive the revert message via the app’s onRevert function.
call_on_revert boolean flag that determines whether the on_revert on Solana or onAbort on ZetaChain hook on the universal app should be called if the transaction fails.
revert_message: arbitrary bytes to be passed to the on_revert on Solana and onAbort on ZetaChain functions. This can contain metadata about the original intent, failure reason, or any custom app-specific data.
on_revert_gas_limit: the gas limit to allocate for the revert transaction on ZetaChain. Ensure this is sufficient for the onRevert hook to execute.
Notes
If revert_options is omitted, the default behavior in case of revert is to transfer the tokens back to the sender.
To fully protect assets against loss of funds, we recommend always specifying abort_address.
Implementing on_revert
If a call to a universal contract on ZetaChain reverts, and the protocol is able to execute a revert transaction back to Solana, the Gateway invokes the on_revert function in your Solana program. This lets your app unwind state, emit telemetry, or reimburse the user after a failed cross-chain call.

pub fn on_revert(
    ctx: Context<OnRevert>,
    amount: u64,      // Asset quantity originally deposited (lamports or SPL)
    sender: Pubkey,   // The account that triggered the deposit/call from Solana
    data: Vec<u8>,    // Arbitrary bytes supplied via `revert_message`
) -> Result<()>


Implement this function to make your universal app resilient and transparent in the face of cross-chain failures.

Withdraw and Call a Solana Program
To withdraw ZRC-20 tokens and call a Solana program from a universal app on ZetaChain, use the withdrawAndCall function of the ZetaChain Gateway. The program being called on Solana must implement an on_call function.

The on_call function must have the following signature:

pub fn on_call(
    ctx: Context<OnCall>,
    amount: u64,
    sender: [u8; 20],
    data: Vec<u8>,
) -> Result<()>


The function receives:

amount: The amount of tokens being withdrawn
sender: The address of the universal app on ZetaChain that initiated the call
data: Additional data passed from the universal app
The program can handle both SOL and SPL token withdrawals. For SPL tokens, the program must include the necessary token accounts and mint account in its context.

When calling a Solana program from ZetaChain, the message payload must include both the program accounts and the data to be passed to the program. The payload is ABI-encoded as a tuple containing:

An array of account metadata, where each account is specified as:

publicKey: The Solana public key of the account
isWritable: Whether the account can be modified by the program
The data to be passed to the program's on_call function

The accounts array must include all required accounts for the program's on_call function.

For SOL token withdrawals, the accounts array must include:

Program PDA (writable)
Gateway PDA (read-only)
System program (read-only)
For SPL token withdrawals, the accounts array must include:

Program PDA (writable)
Program's associated token account (writable)
Mint account (read-only)
Gateway PDA (read-only)
Token program (read-only)
System program (read-only)
The data field can be any bytes that your program's on_call function expects to receive.

For a complete example of how to call a Solana program from a universal app, including message encoding and program implementation, check out the Solana example in the ZetaChain examples repository.

Fees
A deposit fee of 2,000,000 lamports (0.002 SOL) is charged for all deposits.

Error Handling
The Solana Gateway program includes several error codes to handle different failure scenarios:

SignerIsNotAuthority: The signer is not authorized to perform the action.
DepositPaused: Deposits are currently paused.
NonceMismatch: The provided nonce does not match the expected nonce.
TSSAuthenticationFailed: The TSS signature verification failed.
DepositToAddressMismatch: The deposit destination address does not match.
MessageHashMismatch: The message hash verification failed.
MemoLengthExceeded: The memo length exceeds the maximum allowed size.
SPLAtaAndMintAddressMismatch: The SPL token account address does not match the expected address.
EmptyReceiver: The receiver address is empty.
InvalidInstructionData: The instruction data is invalid.






First Universal App
Build your first universal app
10 min

In this tutorial, you will create a simple Universal App on ZetaChain. This app will emit an event when it receives a cross-chain call from a connected chain.

By the end of this tutorial, you will understand how to:

Build a basic Universal App
Deploy it on ZetaChain Localnet
Use a Gateway on a connected chain to call your Universal App

Prerequisites
Before embarking on your ZetaChain development journey, ensure your system is equipped with the following essential tools:

Node.js (v18 or later recommended): A JavaScript runtime environment crucial for managing project dependencies and executing commands.
Yarn (or npm): A package manager used to install, update, and manage project libraries and dependencies. You can choose either Yarn or npm based on your preference.
Git: A distributed version control system for tracking changes in source code during software development. It's essential for managing your project and collaborating with others.
jq (for shell scripts): A lightweight and flexible command-line JSON processor. It's particularly useful for parsing and manipulating JSON data within shell scripts, which will be helpful for extracting specific information from localnet output.
Foundry: A fast, portable, and modular toolkit for Ethereum application development. You'll use Forge (Foundry's CLI) and Soldeer to compile contracts and manage dependencies throughout this tutorial.
Set Up Your Environment
To kickstart your ZetaChain project, begin by initializing a new project using the ZetaChain CLI (command-line interface). This will set up the foundational project structure.

npx zetachain@latest new --project hello
cd hello
yarn
forge soldeer update


First, npx zetachain@latest new --project hello uses npx to execute the latest version of the zetachain package, creating a new project directory named hello.

Then, cd hello navigates you into the newly created project directory.

Next, yarn (or npm install if you prefer npm) installs all the necessary project dependencies as defined in the package.json file. This ensures that all required libraries and tools are available for your development environment.

Finally, foundry soldeer update synchronizes and updates your Solidity dependencies managed by Foundry’s Soldeer, ensuring that your contracts are built against the latest compatible versions of external libraries.

Universal Contract
A Universal App is a contract that implements the UniversalContract interface.

contracts/Universal.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
 
import "@zetachain/protocol-contracts/contracts/zevm/GatewayZEVM.sol";
 
contract Universal is UniversalContract {
    GatewayZEVM public immutable gateway;
 
    event HelloEvent(string, string);
    error Unauthorized();
 
    modifier onlyGateway() {
        if (msg.sender != address(gateway)) revert Unauthorized();
        _;
    }
 
    constructor(address payable gatewayAddress) {
        gateway = GatewayZEVM(gatewayAddress);
    }
 
    function onCall(
        MessageContext calldata context,
        address zrc20,
        uint256 amount,
        bytes calldata message
    ) external override onlyGateway {
        string memory name = abi.decode(message, (string));
        emit HelloEvent("Hello: ", name);
    }
}


The constructor takes ZetaChain’s Gateway address and stores it in a state variable. The Gateway is used for making outbound contract calls and token withdrawals.

A universal contract must implement the onCall function. This function is triggered when the contract receives a call from a connected chain via the Gateway. The function processes incoming data, which includes:

context: A MessageContext struct containing:
chainID: The chain ID of the connected chain that initiated the cross-chain call.
sender: The address (EOA or contract) that called the Gateway on the connected chain.
origin: Deprecated.
zrc20: The address of the ZRC-20 token representing assets from the source chain.
amount: The amount of tokens transferred.
message: The encoded payload data.
In this example, onCall decodes the message into a string and emits an event.

onCall should only be called by the Gateway to ensure that it is only called as a response to a call on a connected chain and that you can trust the values of the function parameters.

Option 1: Deploy on Localnet
This section guides you through the process of deploying and interacting with a Universal Contract on ZetaChain Localnet. Working with a Localnet provides a safe and isolated environment for testing and development without incurring real network fees or affecting live deployments.

For optimal workflow, it is highly recommended to use a split terminal or two separate terminal windows. This allows you to keep the localnet running continuously in one terminal while executing commands and interacting with your project in the other, streamlining your development process.

The first step is to launch your local ZetaChain network. This will simulate a complete ZetaChain environment on your machine.

Open a new terminal window dedicated to running the Localnet.
In this terminal, execute the following command:
npx zetachain localnet start

This command will initiate the local ZetaChain network. It may take a moment for all components to spin up. You'll know the localnet is ready when you see a formatted table printed in the terminal. This table will display crucial contract addresses for different chains, including ZETACHAIN, ETHEREUM, and BNB. These addresses are essential for interacting with your local network.

Do not close this terminal! It is imperative that the localnet remains running throughout the subsequent steps. Closing this terminal will shut down your local network, and you'll need to restart it to continue.

Once Localnet is active, the next step is to compile your smart contracts. This process translates your human-readable Solidity code into bytecode that the Ethereum Virtual Machine (EVM) can understand and execute.

Open a second terminal window (or split your existing terminal) dedicated to your project commands.
Navigate to your project directory (if you're not already there).
Run the following command:
forge build

The forge build command tells Foundry to compile all Solidity smart contracts within your project, ensuring you're working with the latest compiled versions. Successful compilation will generate bytecode for your contracts.

To deploy and interact with contracts on the ZetaChain localnet, you'll need the address of the ZetaChain Gateway contract. This contract acts as the entry point for cross-chain interactions on ZetaChain.

While your localnet is still running in its dedicated terminal, carefully examine its output.
Copy the Gateway contract address from the localnet terminal output. Look for the row labeled gateway under the ZETACHAIN section. It will typically appear in a format similar to this:
| gateway │ '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6' |

Copy only the hexadecimal address (e.g., 0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6). Do not include the single quotes or any other surrounding text.

Alternatively, run the following command to get the Gateway address programmatically:

GATEWAY_ZETACHAIN=$(jq -r '.["31337"].contracts[] | select(.contractType == "gateway") | .address' ~/.zetachain/localnet/registry.json) && echo $GATEWAY_ZETACHAIN

Fetch a private key with pre-funded tokens on the connected chain:

PRIVATE_KEY=$(jq -r '.private_keys[0]' ~/.zetachain/localnet/anvil.json) && echo $PRIVATE_KEY

Deploy the universal contract and provide the Gateway address in the constructor:

UNIVERSAL=$(forge create Universal \
  --rpc-url http://localhost:8545 \
  --private-key $PRIVATE_KEY \
  --evm-version paris \
  --broadcast \
  --json \
  --constructor-args $GATEWAY_ZETACHAIN | jq -r .deployedTo) && echo $UNIVERSAL


Make a Call to the Universal App
To call the universal app deployed on ZetaChain from a connected chain, send a transaction to the Gateway contract on the connected EVM chain.

Fetch the Gateway address for the connected chain:

GATEWAY_EVM=$(jq -r '.["11155112"].contracts[] | select(.contractType == "gateway") | .address' ~/.zetachain/localnet/registry.json) && echo $GATEWAY_EVM

Alternatively, you can copy the Gateway address directly from the table printed in the Localnet terminal output when Localnet starts.

Execute the call method on the connected chain’s Gateway to send a message to the universal contract deployed on ZetaChain.

npx zetachain evm call \
  --rpc http://localhost:8545 \
  --gateway $GATEWAY_EVM \
  --receiver $UNIVERSAL \
  --private-key $PRIVATE_KEY \
  --types string \
  --values hello


Once the transaction is processed, you’ll see an [ZetaChain]: Event from onCall log in the Localnet terminal.

Option 2: Deploy on Testnet
Wallet & Environment Setup
To interact with and deploy smart contracts on ZetaChain, you'll need an EVM-compatible private key and a secure way to manage it within your project environment.

An EVM-compatible private key is fundamental for signing transactions, which are necessary for deploying and interacting with smart contracts on the ZetaChain EVM. You have a couple of reliable options for generating this key:

Using MetaMask: MetaMask is a popular browser extension that serves as a cryptocurrency wallet and a gateway to decentralized applications. You can create a new wallet in MetaMask, and it will generate a private key for you. Be sure to back up your seed phrase securely.
Using cast CLI: For a quick and direct generation via the command line, you can use the following command:
PRIVATE_KEY=$(cast wallet new --json | jq -r '.[0].private_key') && echo $PRIVATE_KEY

This command leverages Foundry’s cast utility to generate a new EVM wallet. The --json flag outputs the wallet details in JSON format, and the jq query extracts the private_key field, printing it as a 64-character hexadecimal string.

Deploy the Contract on ZetaChain
Deploy the contract to ZetaChain’s testnet using the Gateway address from the Contract Addresses page:

UNIVERSAL=$(forge create Universal \
  --rpc-url https://zetachain-athens-evm.blockpi.network/v1/rpc/public \
  --private-key $PRIVATE_KEY \
  --evm-version paris \
  --broadcast \
  --json \
  --constructor-args 0x6c533f7fe93fae114d0954697069df33c9b74fd7 | jq -r .deployedTo)


Call a Universal Contract from Base
This section details the process of initiating a cross-chain transaction from a connected testnet, specifically Base Sepolia, to interact with a universal application deployed on ZetaChain. The process involves two primary steps: making the initial transaction and then tracking its cross-chain status.

To call the universal app on ZetaChain, a transaction must be sent to the Gateway on Base Sepolia. This is achieved using the npx zetachain evm call command, which facilitates the execution of an EVM (Ethereum Virtual Machine) transaction.

The command structure is as follows:

npx zetachain evm call \
  --chain-id 84532 \
  --receiver $UNIVERSAL \
  --private-key $PRIVATE_KEY \
  --types string \
  --values hello


Explanation of Parameters:

--chain-id 84532: This specifies the chain ID of Base Sepolia, the source network for the transaction.
--receiver $UNIVERSAL: This parameter designates the address of the universal contract on ZetaChain that the transaction intends to interact with. The $UNIVERSAL variable should be replaced with the actual contract address.
--private-key $PRIVATE_KEY: This is the private key associated with the sending wallet on Base Sepolia. It is crucial for signing the transaction. The $PRIVATE_KEY variable must be replaced with the actual private key.
--types string: This indicates the data type of the value being sent. In this case, it's a string.
--values hello: This is the actual value being passed to the universal application. Here, the string "hello" is sent as a message to the universal contract on ZetaChain.
Upon successful execution of this command, a transaction hash is generated, confirming the initiation of the transaction on Base Sepolia.

Transaction hash: 0x89308870b0863c5ae48dc783059277cbcf4296b1b343413ac543418262a4ccbc

You can verify the transaction on the Base Sepolia block explorer:

https://sepolia.basescan.org/tx/0x89308870b0863c5ae48dc783059277cbcf4296b1b343413ac543418262a4ccbc

Tracking the Cross-Chain Transaction Status
After the transaction is initiated on Base Sepolia, ZetaChain's protocol facilitates its cross-chain transfer and execution on the destination chain (ZetaChain). To monitor the status of this cross-chain transaction, the npx zetachain query cctx command is used, providing real-time updates on the transaction's journey.

The command for tracking is:

npx zetachain query cctx --hash 0x89308870b0863c5ae48dc783059277cbcf4296b1b343413ac543418262a4ccbc

--hash 0x89308870b0863c5ae48dc783059277cbcf4296b1b343413ac543418262a4ccbc: This refers to the transaction hash obtained from the initial transaction on Base Sepolia.
Example Output and Interpretation:

84532 → 7001 ✅ OutboundMined
CCTX:     0x56f9bc09dc646b13aa713b56348e8a53ea39759146afad61e66973791b752e3bTx
Tx Hash:  0x89308870b0863c5ae48dc783059277cbcf4296b1b343413ac543418262a4ccbc (on chain 84532)
Tx Hash:  0x34edd96c8a7b2bd9d530de0e49bb5e8625204a77b77cc79133814e1814f79ebc (on chain 7001)
Sender:   0x4955a3F38ff86ae92A914445099caa8eA2B9bA32
Receiver: 0xFeb4F33d424D6685104624d985095dacab567151
Message:  0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000568656c6c6f000000000000000000000000000000000000000000000000000000


Key Information from the Output:

84532 → 7001: This clearly indicates the cross-chain flow, from Base Sepolia (chain ID 84532) to ZetaChain (chain ID 7001). The ✅ symbol signifies a successful outbound mining of the cross-chain transaction.
OutboundMinedCCTX: 0x56f9bc09dc646b13aa713b56348e8a53ea39759146afad61e66973791b752e3b: This is the hash of the Cross-Chain Transaction (CCTX) on ZetaChain, representing the internal identifier for this specific cross-chain operation.
Tx Hash: 0x89308870b0863c5ae48dc783059277cbcf4296b1b343413ac543418262a4ccbc (on chain 84532): This confirms the original transaction hash on the source chain (Base Sepolia).
Tx Hash: 0x34edd96c8a7b2bd9d530de0e49bb5e8625204a77b77cc79133814e1814f79ebc (on chain 7001): This is the transaction hash of the execution on ZetaChain, indicating that the universal application has been successfully called on the destination chain.
Sender: 0x4955a3F38ff86ae92A914445099caa8eA2B9bA32: The address of the sender on the originating chain.
Receiver: 0xFeb4F33d424D6685104624d985095dacab567151: The address of the receiver contract on ZetaChain, which is the universal application in this context.
Message: 0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000568656c6c6f000000000000000000000000000000000000000000000000000000


Call & Deposit
Learn the fundamentals of message passing and cross-chain contract calls
30 min

In this tutorial, you’ll learn how to build a Universal App on ZetaChain that can:

Handle incoming calls from connected EVM chains
Make outgoing calls to a contract on a connected EVM chain
Gracefully handle failures using revert handling
You’ll deploy two contracts:

A Universal App on ZetaChain that processes cross-chain calls and can send calls back to a connected chain, optionally including token transfers.
A Connected Contract on a connected EVM chain that can call into your Universal App and receive calls back from it.
This pattern demonstrates the core flows for two-way communication between ZetaChain and a connected chain:

Incoming calls: connected chain → ZetaChain
Outgoing calls: ZetaChain → connected chain
Optional token transfers alongside calls in either direction
Revert handling to recover gracefully from failed calls
By the end, you’ll have a minimal, working example of bi-directional contract calls with optional token movement and robust error handling.

Prerequisites
Before you begin, make sure you've completed the following tutorials:

Introduction to Universal Apps
Getting Started with ZetaChain
First Universal App
Set Up Your Environment
Start by creating a new project from the call template:

zetachain new --project call
cd call


Install dependencies:

yarn

Pull Solidity dependencies and compile the contracts:

forge soldeer update
forge build


Your workspace is now ready for adding the Universal App and Connected Contract logic. Next, we’ll walk through the key parts of the Universal App that handles incoming calls and makes outgoing calls to a connected chain.

Universal App
The Universal App runs on ZetaChain and implements the UniversalContract interface. It receives calls from connected chains via the Gateway and can send calls (with or without tokens) back to them.

Handling incoming calls
When a connected chain calls your Universal App, the Gateway invokes onCall. Here you decode the message and run your app’s logic:

function onCall(
    MessageContext calldata context,
    address zrc20,
    uint256 amount,
    bytes calldata message
) external override onlyGateway {
    string memory name = abi.decode(message, (string));
    emit HelloEvent("Hello on ZetaChain", name);
}


context identifies the source chain and sender
zrc20 is the token address representing the source chain’s gas asset (or token sent)
amount is the token amount delivered
message is arbitrary calldata encoded on the source chain
Making outgoing calls
To call a contract on a connected chain from your Universal App, you must first approve the Gateway to spend the gas token:

IZRC20(zrc20).approve(address(gateway), gasFee);

Then use gateway.call to send the cross-chain request:

gateway.call(
    receiver,      // bytes: address of the contract on the connected chain
    zrc20,         // ZRC-20 for the destination chain’s gas token
    message,       // calldata for the destination contract
    callOptions,   // gas limit, call type
    revertOptions  // revert handling
);


Withdrawing tokens and calling in one step
To send tokens and call a function on the connected chain in the same transaction, use:

gateway.withdrawAndCall(
    receiver,
    amount,
    zrc20,
    message,
    callOptions,
    revertOptions
);


This burns the ZRC-20 representation of the token on ZetaChain and releases the corresponding native asset or ERC-20 on the destination chain, while also executing the call.

Connected Contract
The Connected contract lives on a connected EVM chain and uses EVM Gateway to interact with your Universal App on ZetaChain.

A Connected contract is not required to make calls to a Universal App, you can call the Gateway directly from an EOA to trigger a cross-chain call.

In this tutorial, the Connected contract is simply an example showing how a contract on a connected chain can programmatically interact with a Universal App, making it easier to embed cross-chain calls into on-chain workflows.

Calling a Universal App (EVM → ZetaChain)
Send arbitrary calldata to a Universal App on ZetaChain:

gateway.call(
  receiver,     // address: Universal App on ZetaChain (EVM address)
  message,      // bytes: ABI-encoded payload for Universal onCall
  revertOptions // revert behavior if delivery/execution fails
);


Once the cross-chain transaction is processed, the onCall function of the target Universal App on ZetaChain is executed with the provided calldata.

Deposit tokens
Deposit native gas (e.g., ETH) to an address/contract on ZetaChain:

gateway.deposit{value: msg.value}(receiver, revertOptions);

Deposit a supported ERC-20:

IERC20(asset).transferFrom(msg.sender, address(this), amount);
IERC20(asset).approve(address(gateway), amount);
gateway.deposit(receiver, amount, asset, revertOptions);


deposit only transfers tokens to the receiver on ZetaChain (EOA or contract) and does not execute any code. The tokens arrive as ZRC-20.

Deposit and call
Send value and execute logic on ZetaChain in the same transaction.

Native gas:

gateway.depositAndCall{value: msg.value}(
  receiver,
  message,
  revertOptions
);


ERC-20:

IERC20(asset).transferFrom(msg.sender, address(this), amount);
IERC20(asset).approve(address(gateway), amount);
gateway.depositAndCall(
  receiver,
  amount,
  asset,
  message,
  revertOptions
);


After the cross-chain transaction is processed, the onCall function of the target Universal App on ZetaChain runs, receiving both the transferred tokens and the provided calldata in the same execution.

Revert Handling
Cross-chain calls can fail for many reasons: insufficient gas on the destination chain, a missing function in the target contract, or logic reverts in the called function. To handle these cases gracefully, you can pass a RevertOptions struct when making the call.

If the call fails, the Gateway invokes the onRevert function of the originating contract with a RevertContext containing details about the failure.

Example: Universal App onRevert
function onRevert(RevertContext calldata revertContext)
    external
    onlyGateway
{
    emit RevertEvent("Revert on ZetaChain", revertContext);
}


You can use this hook to:

Emit events for off-chain monitoring
Refund tokens to the original sender
Retry or take compensating actions
Passing RevertOptions
When calling or withdrawing with a call, provide RevertOptions to define:

The revert address (where to send refunds)
Whether to call onRevert
A custom revert message
Gas limits for the revert call
Example when making an outgoing call:

gateway.call(
    receiver,
    zrc20,
    message,
    callOptions,
    RevertOptions({
        revertAddress: msg.sender,
        callOnRevert: true,
        abortAddress: address(0),
        revertMessage: abi.encode("refund"),
        onRevertGasLimit: 500_000
    })
);


Option 1: Deploy on Testnet
Before deploying, you need a private key funded on both ZetaChain testnet and your connected EVM testnet (for example, Base Sepolia) and the Gateway addresses for each chain.

GATEWAY_ZETACHAIN=0x6c533f7fe93fae114d0954697069df33c9b74fd7
GATEWAY_BASE=0x0c487a766110c85d301d96e33579c5b317fa4995
 
RPC_ZETACHAIN=https://zetachain-athens-evm.blockpi.network/v1/rpc/public
RPC_BASE=https://sepolia.base.org


Deploy Universal to ZetaChain testnet
UNIVERSAL=$(forge create Universal \
  --rpc-url $RPC_ZETACHAIN \
  --private-key $PRIVATE_KEY \
  --evm-version paris \
  --broadcast \
  --json \
  --constructor-args $GATEWAY_ZETACHAIN | jq -r .deployedTo) && echo $UNIVERSAL


Deploy Connected to Base Sepolia
CONNECTED=$(forge create Connected \
  --rpc-url $RPC_BASE \
  --private-key $PRIVATE_KEY \
  --evm-version paris \
  --broadcast \
  --json \
  --constructor-args $GATEWAY_BASE | jq -r .deployedTo) && echo $CONNECTED


Make a call to the Universal App
Call the Connected contract on Base Sepolia. It forwards through the Gateway to your Universal App on ZetaChain. After the cross-chain transaction is processed, the Universal App’s onCall executes.

cast send $CONNECTED \
  --rpc-url $RPC_BASE \
  --private-key $PRIVATE_KEY \
  --json \
  "call(address,bytes,(address,bool,address,bytes,uint256))" \
  $UNIVERSAL \
  $(cast abi-encode "f(string)" "hello") \
  "(0x0000000000000000000000000000000000000000,false,$UNIVERSAL,0x,0)" | jq -r '.transactionHash'


The third parameter to the call function is the RevertOptions struct:

(revertAddress, callOnRevert, abortAddress, revertMessage, onRevertGasLimit)

revertAddress: address to receive refunded tokens if the call fails. For a call with no token transfer, use zero address..
callOnRevert: whether to invoke onRevert if the call fails. The Gateway’s call does not support this, so it must be false.
abortAddress: address where the message is considered aborted if delivery fails. Use the universal contract address, so that if the call fails, onAbort is called on the universal contract.
revertMessage: arbitrary bytes returned in the revert context.
onRevertGasLimit: gas allocated for onRevert. Since callOnRevert is false, set this to 0.
You can also run the same call with a command:

npx tsx ./commands connected call \
  --rpc $RPC_BASE \
  --contract $CONNECTED \
  --private-key $PRIVATE_KEY \
  --receiver $UNIVERSAL \
  --types string \
  --values hello \
  --name Connected


After you broadcast a transaction on testnet, you can track its progress end-to-end using the ZetaChain CLI:

zetachain query cctx --hash $HASH

This command shows the full cross-chain transaction (CCTX) lifecycle, including its current status, source and destination chain events, and any error or revert details if execution fails. It's the easiest way to confirm when your cross-chain call has been delivered and processed successfully.

Make a call from the Universal App
Your Universal App on ZetaChain can initiate an outgoing call to a contract on a connected EVM chain. The Universal App pulls the destination gas fee in the chain’s gas ZRC-20, then calls the Gateway.

First, quote the exact fee using the destination gas limit:

GAS_LIMIT=500000
ZRC20_BASE=0x236b0DE675cC8F46AE186897fCCeFe3370C9eDeD
 
GAS_FEE=$(cast call --json $ZRC20_BASE \
  "withdrawGasFeeWithGasLimit(uint256)(address,uint256)" \
  $GAS_LIMIT \
  --rpc-url $RPC_ZETACHAIN | jq -r '.[1]') && echo $GAS_FEE


Approve the Universal App to spend the quoted fee:

cast send $ZRC20_BASE \
  "approve(address,uint256)" \
  $UNIVERSAL \
  $GAS_FEE \
  --rpc-url $RPC_ZETACHAIN \
  --private-key $PRIVATE_KEY


Make the cross-chain call:

cast send --json \
  --rpc-url $RPC_ZETACHAIN \
  --private-key $PRIVATE_KEY \
  $UNIVERSAL \
  "call(bytes,address,bytes,(uint256,bool),(address,bool,address,bytes,uint256))" \
  $(cast abi-encode "f(bytes)" $CONNECTED) \
  $ZRC20_BASE \
  $(cast abi-encode "f(string)" "hello") \
  "($GAS_LIMIT,false)" \
  "($UNIVERSAL,false,$UNIVERSAL,0x,0)" | jq -r '.transactionHash'


$GAS_LIMIT is the amount of gas forwarded to the destination call. It must match the value used in withdrawGasFeeWithGasLimit.
isArbitraryCall controls call type. Use false for an authenticated message, use true for an arbitrary function call payload.
RevertOptions:

revertAddress is the Universal contract address, so if the outgoing call fails, a revert cross-chain transaction will be sent back to the Universal contract.
callOnRevert is true. Outgoing calls from ZetaChain support callOnRevert because transactions from connected chains to ZetaChain incur no gas fees.
abortAddress is also the Universal contract address, so if the outgoing call fails and cannot be reverted, the abort is handled by the Universal contract.
revertMessage is left empty in this example to keep the payload minimal.
onRevertGasLimit is set to 0, because revert calls from connected chains to ZetaChain do not incur gas fees.
You can also run the same call with a command:

npx tsx ./commands universal call \
  --rpc $RPC_ZETACHAIN \
  --contract $UNIVERSAL \
  --private-key $PRIVATE_KEY \
  --receiver $CONNECTED \
  --types string \
  --values hello \
  --name Universal \
  --zrc20 $ZRC20_BASE


Option 2: Deploy on Localnet
Localnet lets you deploy and test both contracts entirely on your machine. It runs a local ZetaChain instance alongside connected EVM chains, so you can iterate quickly without waiting for testnet confirmations or dealing with faucets.

npx zetachain localnet start

This command launches Anvil with pre-funded accounts and deploys the ZetaChain core contracts locally. Deployment metadata is saved under ~/.zetachain/localnet/.

Extract the RPC URL, a funded private key, and the relevant contract addresses from the localnet registry:

RPC=http://localhost:8545
ZRC20_ETHEREUM=$(jq -r '."11155112".chainInfo.gasZRC20' ~/.zetachain/localnet/registry.json) && echo $ZRC20_ETHEREUM
PRIVATE_KEY=$(jq -r '.private_keys[0]' ~/.zetachain/localnet/anvil.json) && echo $PRIVATE_KEY
GATEWAY_ETHEREUM=$(jq -r '.["11155112"].contracts[] | select(.contractType == "gateway") | .address' ~/.zetachain/localnet/registry.json) && echo $GATEWAY_ETHEREUM
GATEWAY_ZETACHAIN=$(jq -r '.["31337"].contracts[] | select(.contractType == "gateway") | .address' ~/.zetachain/localnet/registry.json) && echo $GATEWAY_ZETACHAIN


Deploy the Universal App:

UNIVERSAL=$(forge create Universal \
  --rpc-url $RPC \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --json \
  --constructor-args $GATEWAY_ZETACHAIN | jq -r .deployedTo) && echo $UNIVERSAL


Deploy the Connected contract:

CONNECTED=$(forge create Connected \
  --rpc-url $RPC \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --json \
  --constructor-args $GATEWAY_ETHEREUM | jq -r .deployedTo) && echo $CONNECTED


This simulates a connected chain sending a message to the Universal App on ZetaChain:

npx tsx ./commands connected call \
  --rpc $RPC \
  --contract $CONNECTED \
  --private-key $PRIVATE_KEY \
  --receiver $UNIVERSAL \
  --types string \
  --values hello \
  --name Connected


Once the cross-chain transaction is processed locally, the Universal App’s onCall will execute.

This sends a message in the opposite direction, from ZetaChain to the connected chain:

npx tsx ./commands universal call \
  --rpc $RPC \
  --contract $UNIVERSAL \
  --private-key $PRIVATE_KEY \
  --receiver $CONNECTED \
  --types string \
  --values hello \
  --name Universal \
  --zrc20 $ZRC20_ETHEREUM


The command will:

Quote the destination gas fee in $ZRC20_ETHEREUM
Approve the Universal App to spend that fee
Send the cross-chain call through the Gateway
Conclusion
You’ve now built and tested a Universal App that demonstrates the core mechanics of two-way contract communication on ZetaChain. By deploying both the Universal App (on ZetaChain) and the Connected Contract (on a connected EVM chain), you learned how to:

Receive and process incoming calls from connected chains through the Gateway.
Send calls back from ZetaChain to a connected chain.
Handle failures gracefully using revert handling so your cross-chain logic remains robust.
Run the exact same flows on testnet or entirely on localnet for faster iteration.
This pattern is the backbone of building Universal dApps applications that are not limited to a single chain, but instead can orchestrate logic, assets, and data across multiple environments from one place.

From here, you can:

Add more connected chains to expand your app’s reach.
Extend the contract logic to support complex workflows like swaps, staking, or NFT transfers.
Integrate your Universal App into larger protocols to unify liquidity and user experience across ecosystems.
With ZetaChain, these patterns work the same regardless of which chains you connect, making your application future-proof and chain-agnostic from day one.

Your next step is to take this minimal example and turn it into a real cross-chain feature for your project without ever having to think in “single chain” terms again.




Swap
Implement a universal swap app compatible with chains like Ethereum, Solana and Bitcoin
30 min

Introduction
In this tutorial, you'll build a Universal App on ZetaChain that enables seamless cross-chain token swaps. This app allows users to send native gas tokens or ERC-20 tokens from a connected chain and receive a different token on another chain, all in a single transaction. For example, a user can swap USDC on Ethereum for BTC on Bitcoin, without interacting with bridges or centralized exchanges.

You’ll learn how to:

Create a Universal App that performs token swaps across chains
Deploy it to ZetaChain
Trigger a cross-chain swap from a connected EVM chain
The swap logic is implemented as a smart contract deployed on ZetaChain, conforming to the UniversalContract interface. This makes the contract callable from any connected chain through the Gateway. When tokens are sent from a connected chain, they arrive on ZetaChain as ZRC-20 tokens, a native representation of external assets. ZRC-20 tokens preserve the original asset’s properties while enabling programmable behavior on ZetaChain, including cross-chain withdrawals.

The Swap contract performs the following steps:

Receives a cross-chain call along with native or ERC-20 tokens from a connected chain.

Decodes the message payload to extract:

The address of the target token (ZRC-20)
The recipient’s address on the destination chain
Queries the withdrawal gas fee required to send the target token back to the destination chain.

Swaps a portion of the incoming tokens for ZRC-20 gas tokens to cover the withdrawal fee using Uniswap v2 pools.

Swaps the remaining balance into the target token.

Withdraws the swapped tokens to the recipient on the destination chain.

This approach allows users to initiate complex multi-chain operations with a single transaction from any supported chain, abstracting away the complexity of liquidity routing, gas payments, and execution across chains.

Prerequisites
Before you begin, make sure your development environment includes the following tools:

Node.js (v18 or later): Required for running scripts and managing project dependencies.
Yarn: A package manager for installing project dependencies. You may use npm if preferred.
Git: Used to clone repositories and track changes.
jq: A lightweight command-line tool for parsing and querying JSON data. It’s especially useful for extracting values from localnet outputs.
Foundry: A fast, portable toolkit for Ethereum application development. You’ll use forge and cast to compile and deploy contracts.
ZetaChain CLI: The command-line interface for interacting with ZetaChain’s localnet and connected chain gateways.
To install the CLI globally:

npm install -g zetachain@latest

Setting Up Your Environment
Start by creating a new ZetaChain project using the CLI:

zetachain new --project swap

Install dependencies:

cd swap
yarn


Pull Solidity dependencies using Foundry’s package manager:

forge soldeer update

Compile the contract:

forge build

This will set up a working environment with Foundry and ZetaChain CLI support, and prepare your project for local deployment and testing.

Understanding the Swap Contract
The Swap contract is a Universal App deployed on ZetaChain. It enables users to perform token swaps across blockchains with a single cross-chain call. Tokens are received as ZRC-20s, optionally swapped using Uniswap v2 liquidity, and withdrawn back to a connected chain.

Universal App entrypoint: on_call
The contract is deployed on ZetaChain and implements UniversalContract, exposing a single entrypoint. Cross-chain deliveries are executed only via the Gateway, so the call surface stays minimal and trusted.

function onCall(
    MessageContext calldata context,
    address zrc20,
    uint256 amount,
    bytes calldata message
) external onlyGateway


onlyGateway ensures onCall is invoked exclusively by the Gateway.
MessageContext carries the origin chain (context.chainID) and the original caller (context.sender). Treat this as the canonical source identity.
Asset model: ZRC-20
Assets arriving from connected chains are represented as ZRC-20s on ZetaChain. In onCall, zrc20 is the input token and amount is how much was delivered. To send assets out to another chain, the contract approves the Gateway to spend specific ZRC-20 amounts and then calls withdraw.

Two interfaces are central:

Withdrawal gas quote for the destination chain:

(address gasZRC20, uint256 gasFee) = IZRC20(targetToken).withdrawGasFee();

gasZRC20 is the ZRC-20 that represents the destination chain’s gas token.
gasFee is the amount required to execute on the destination chain.
Withdrawal to a connected chain (burn ZRC-20, release native on the other side):

IZRC20(gasZRC20).approve(address(gateway), gasFee);
IZRC20(params.target).approve(address(gateway), out);
 
gateway.withdraw(
  abi.encodePacked(params.to), // chain-agnostic recipient (bytes)
  out,                         // amount of target token
  params.target,               // ZRC-20 to withdraw
  revertOptions                // failure handling
);


Funding destination execution from the user’s input
The app provisions destination gas out of the input, so users don’t need to pre-hold gas on the target chain.

Flow:

Quote the destination gas requirement via withdrawGasFee().

Verify the input covers it using a DEX quote:

uint256 minInput = quoteMinInput(inputToken, targetToken);
if (amount < minInput) revert InsufficientAmount(...);


If the input isn’t already gasZRC20, swap just enough to buy gasFee:

inputForGas = SwapHelperLib.swapTokensForExactTokens(
  uniswapRouter, inputToken, gasFee, gasZRC20, amount
);


Swap the remainder into the target token:

out = SwapHelperLib.swapExactTokensForTokens(
  uniswapRouter, inputToken, amount - inputForGas, targetToken, 0
);


quoteMinInput() uses Uniswap v2 pricing (getAmountsIn) to determine the minimum input necessary to cover the gas fee.

Chain-agnostic addresses
Recipients (and senders in events) are carried as raw bytes, not address, so the same contract can serve EVM, Bitcoin, Solana, etc. For cross-chain withdraw: pass bytes directly to gateway.withdraw.

Decoding the message payload
When a cross-chain call reaches your universal app, any extra parameters are passed as an ABI-encoded payload. For the swap contract, this payload contains three values:

(address targetToken, bytes recipient, bool withdrawFlag)

targetToken: The ZRC-20 token address for the asset to deliver after the swap.
recipient: The destination address in raw bytes form, which works for any supported chain (EVM, Solana, etc.).
withdrawFlag: Controls whether the swapped tokens are sent to another chain (true) or transferred locally on ZetaChain (false).
Inside onCall, you decode the payload like this:

(address targetToken, bytes memory recipient, bool withdrawFlag) =
    abi.decode(message, (address, bytes, bool));


Revert with RevertOptions and onRevert
If the destination call/transfer fails, the Gateway triggers onRevert with a RevertContext. The contract pre-encodes a small recovery message in revertMessage (original sender and original input token), then executes a deterministic refund:

function onRevert(RevertContext calldata context) external onlyGateway {
    (bytes memory sender, address zrc20) =
        abi.decode(context.revertMessage, (bytes, address));
 
    (uint256 out,,) = handleGasAndSwap(
        context.asset, context.amount, zrc20, true
    );
 
    gateway.withdraw(
        sender, // chain-agnostic refund address
        out,
        zrc20,
        RevertOptions({
            revertAddress: address(bytes20(sender)), // best-effort for EVM
            callOnRevert: false,
            abortAddress: address(0),
            revertMessage: "",
            onRevertGasLimit: gasLimit
        })
    );
}


The result is a consistent refund flow across chains, governed by the app.

Swapping using liquidity pools
Universal contracts can route through any DEX/AMM available on ZetaChain. Uniswap v2 is used here purely as an example via SwapHelperLib, which wraps common router calls.

// Buy exact destination gas
SwapHelperLib.swapTokensForExactTokens(
  uniswapRouter, inputToken, gasFee, gasZRC20, amount
);
 
// Swap remainder to target
SwapHelperLib.swapExactTokensForTokens(
  uniswapRouter, inputToken, swapAmount, targetToken, 0
);


You’re free to replace uniswapRouter and the helper calls with any DEX interface or custom routing logic—only the ZRC-20 token flow and the Gateway withdraw semantics are assumed by the rest of the contract.

Option 1: Deploy on Testnet
To deploy the Swap contract to ZetaChain testnet, run the following command:

UNIVERSAL=$(npx ts-node commands/index.ts deploy --private-key $PRIVATE_KEY | jq -r .contractAddress) && echo $UNIVERSAL

This deploys the precompiled contract using the specified private key and outputs the deployed address.

The deployment script automatically uses the correct Gateway and Uniswap router addresses for testnet.

Once complete, the UNIVERSAL environment variable will contain the address of your deployed Swap contract on testnet. You’ll reference this address when triggering swaps from connected chains.

Get your EVM sender address from the private key:

RECIPIENT=$(cast wallet address $PRIVATE_KEY) && echo $RECIPIENT

Query the ZRC-20 address that represents ETH from Ethereum Sepolia:

ZRC20_ETHEREUM_ETH=$(zetachain q tokens show --symbol sETH.SEPOLIA -f zrc20) && echo $ZRC20_ETHEREUM_ETH

Swap from Base to Ethereum
To initiate a swap from Base to Ethereum, run:

npx zetachain evm deposit-and-call \
  --chain-id 84532 \
  --amount 0.001 \
  --types address bytes bool \
  --receiver $UNIVERSAL \
  --values $ZRC20_ETHEREUM_ETH $RECIPIENT true


This sends 0.001 ETH from Base Sepolia into ZetaChain. Under the hood, this command invokes the depositAndCall function on the Base Gateway. The Gateway wraps the incoming ETH as ZRC-20 Base ETH and delivers it to the universal swap contract on ZetaChain along with the encoded payload.

The contract receives the Base ETH as a ZRC-20 token, performs the swap to ZRC-20 Ethereum ETH using Uniswap v2 liquidity on ZetaChain, and then withdraws the swapped tokens to your address on Ethereum Sepolia.

This entire flow is completed as a single cross-chain transaction. You don’t need to pre-fund gas on the destination chain or interact with bridges or routers—everything is orchestrated by the universal contract on ZetaChain.

Transaction on Base:

https://sepolia.basescan.org/tx/0x8def0ff44c0e45803f209bc864123a08a03e6e1fadc5ac6f28f4c17f1463aae9

You can inspect the full cross-chain context with:

zetachain query cctx --hash 0x8def0ff44c0e45803f209bc864123a08a03e6e1fadc5ac6f28f4c17f1463aae9

This will show the inbound delivery from Base to ZetaChain, and the outbound delivery from ZetaChain to Ethereum Sepolia, including transaction hashes, sender and recipient addresses, and token amounts.

84532 → 7001 ✅ OutboundMined
CCTX:     0x11ff9e850f0974de3b23f5347feb8684a88c6124e972da725b854031a632ad37
Tx Hash:  0x8def0ff44c0e45803f209bc864123a08a03e6e1fadc5ac6f28f4c17f1463aae9 (on chain 84532)
Tx Hash:  0xe5e5f72154140f63673d8260ed638c7dbb8c5b6901bc19b1e93651fdb35c6a00 (on chain 7001)
Sender:   0x4955a3F38ff86ae92A914445099caa8eA2B9bA32
Receiver: 0x92ae647a9D8d09D58514037d6535ab93a2A8138f
Message:  00000000000000000000000005ba149a7bd6dc1f937fa9046a9e05c05f3b18b00000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000144955a3f38ff86ae92a914445099caa8ea2b9ba32000000000000000000000000
Amount:   1000000000000000 Gas tokens
7001 → 11155111 ✅ OutboundMined
CCTX:     0xfb6f6e1cb94e646fa7a8123082054aea08fa9a65a5f07e1e0dc48463ebfaf9dd
Tx Hash:  0x11ff9e850f0974de3b23f5347feb8684a88c6124e972da725b854031a632ad37 (on chain 7001)
Tx Hash:  0x285a47661b2216ff6d76cd811ca3e3de622b6927f9da94b1cb706f88ad86ef38 (on chain 11155111)
Sender:   0x92ae647a9D8d09D58514037d6535ab93a2A8138f
Receiver: 0x4955a3F38ff86ae92A914445099caa8eA2B9bA32
Amount:   17091458311542 Gas tokens


Swap from Solana to Ethereum
To initiate a swap from Solana to Ethereum Sepolia, run:

npx zetachain solana deposit-and-call \
  --recipient $UNIVERSAL \
  --types address bytes bool \
  --values $ZRC20_ETHEREUM_ETH $RECIPIENT true \
  --chain-id 901 \
  --private-key $SOLANA_PRIVATE_KEY \
  --amount 0.01


This sends 0.01 SOL to the universal swap contract on ZetaChain. The Solana Gateway locks the native SOL and delivers its ZRC-20 representation to the contract along with the swap payload.

The contract swaps the ZRC-20 SOL for ZRC-20 Ethereum ETH and withdraws the resulting amount to the RECIPIENT on Ethereum Sepolia. The recipient address is passed as raw bytes, which allows the same universal contract to serve cross-chain swaps from both EVM and non-EVM chains like Solana.

Transaction on Solana:

https://solana.fm/tx/28xsic7NqafyxqDjmqfYL5f6RoHFYLrCKvjSA4UJCXyESmdCb1bVpW3dqT2QJrwV6KmfdWuHrwj8uW4txHZiXLxm?cluster=devnet-solana

To inspect the full cross-chain context:

npx zetachain query cctx --hash 28xsic7NqafyxqDjmqfYL5f6RoHFYLrCKvjSA4UJCXyESmdCb1bVpW3dqT2QJrwV6KmfdWuHrwj8uW4txHZiXLxm

901 → 7001 ✅ OutboundMined
CCTX:     0xd6e73b3ce77bc16bfaf1b8449b46991476ea7a8cec7ab1f508cd14aaf972028b
Tx Hash:  28xsic7NqafyxqDjmqfYL5f6RoHFYLrCKvjSA4UJCXyESmdCb1bVpW3dqT2QJrwV6KmfdWuHrwj8uW4txHZiXLxm (on chain 901)
Tx Hash:  0x91001d6539c04bf3629d611543ccf8f819a9f7fdf1f1c76bfd695b7e46750bbe (on chain 7001)
Sender:   AS48jKNQsDGkEdDvfwu1QpqjtqbCadrAq9nGXjFmdX3Z
Receiver: 0x92ae647a9D8d09D58514037d6535ab93a2A8138f
Message:  00000000000000000000000005ba149a7bd6dc1f937fa9046a9e05c05f3b18b00000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000144955a3f38ff86ae92a914445099caa8ea2b9ba32000000000000000000000000
Amount:   10000000 Gas tokens
7001 → 11155111 ✅ OutboundMined
CCTX:     0xc718334a07bac99c6ac21bc8a69bf743eff5c391a3998d957bd51af6240b6d07
Tx Hash:  0xd6e73b3ce77bc16bfaf1b8449b46991476ea7a8cec7ab1f508cd14aaf972028b (on chain 7001)
Tx Hash:  0x791aade1bb72cf516f9a4c6d774237f7736fbe49430aa669fb82b34b27623a85 (on chain 11155111)
Sender:   0x92ae647a9D8d09D58514037d6535ab93a2A8138f
Receiver: 0x4955a3F38ff86ae92A914445099caa8eA2B9bA32
Amount:   8645129169842 Gas tokens


Swap from Bitcoin to Ethereum
You can also trigger the same swap flow from Bitcoin. This command sends 0.05 BTC via inscription, delivers the ZRC-20 representation of BTC to your universal contract on ZetaChain with the encoded payload, swaps to ZRC-20 Ethereum ETH, and withdraws to your address on Ethereum Sepolia:

Before running the command, set PRIVATE_KEY_BTC to your Bitcoin private key.

zetachain bitcoin inscription deposit-and-call \
  --private-key $PRIVATE_KEY_BTC \
  --receiver $UNIVERSAL \
  --types address bytes bool \
  --values $ZRC20_ETHEREUM_ETH $RECIPIENT true \
  --amount 0.05


Once the Bitcoin transaction is observed and processed, your contract executes the swap and withdrawal in a single cross-chain flow.

Option 2: Deploy on Localnet
Query the Uniswap router:

UNISWAP_ROUTER=$(jq -r '.["31337"].contracts[] | select(.contractType == "uniswapRouterInstance") | .address' ~/.zetachain/localnet/registry.json) && echo $UNISWAP_ROUTER

Query the Gateway address:

GATEWAY_ZETACHAIN=$(jq -r '.["31337"].contracts[] | select(.contractType == "gateway") | .address' ~/.zetachain/localnet/registry.json) && echo $GATEWAY_ZETACHAIN

Get the localnet private key:

PRIVATE_KEY=$(jq -r '.private_keys[0]' ~/.zetachain/localnet/anvil.json) && echo $PRIVATE_KEY

Deploy the contract:

UNIVERSAL=$(npx ts-node commands/index.ts deploy \
  --private-key $PRIVATE_KEY \
  --rpc http://localhost:8545 \
  --gateway $GATEWAY_ZETACHAIN \
  --uniswap-router $UNISWAP_ROUTER | jq -r .contractAddress) && echo $UNIVERSAL


This will deploy the contract to your Localnet and store the deployed address in UNIVERSAL.

Swap from Ethereum to BNB
To perform a cross-chain swap from Ethereum to BNB on Localnet, first set the relevant variables.

Get the Gateway contract address for Ethereum:

GATEWAY_ETHEREUM=$(jq -r '.["11155112"].contracts[] | select(.contractType == "gateway") | .address' ~/.zetachain/localnet/registry.json) && echo $GATEWAY_ETHEREUM

Get the ZRC-20 address that represents the BNB gas token:

ZRC20_BNB=$(jq -r '."98".chainInfo.gasZRC20' ~/.zetachain/localnet/registry.json) && echo $ZRC20_BNB

Get your local sender address from the private key:

RECIPIENT=$(cast wallet address $PRIVATE_KEY) && echo $RECIPIENT

Then trigger the swap:

npx zetachain evm deposit-and-call \
  --rpc http://localhost:8545 \
  --chain-id 11155112 \
  --gateway $GATEWAY_ETHEREUM \
  --amount 0.001 \
  --types address bytes bool \
  --receiver $UNIVERSAL \
  --private-key $PRIVATE_KEY \
  --values $ZRC20_BNB $RECIPIENT true


This sends 0.001 ETH from Ethereum to ZetaChain on Localnet, where it will be swapped for ZRC-20 BNB and then withdrawn to your address on the BNB localnet chain.

Conclusion
In this tutorial, you learned how to define a universal app contract that performs cross-chain token swaps. You deployed the Swap contract to a local development network and interacted with the contract by swapping tokens from a connected EVM chain. You also understood the mechanics of handling gas fees and token approvals in cross-chain swaps.

Source Code
You can find the source code for the tutorial in the example contracts repository:

https://github.com/zeta-chain/example-contracts/tree/main/examples/swap



Messaging
Learn how to make cross-chain calls between contracts on EVM chains
30 min

This tutorial shows how to send cross-chain messages between contracts on two EVM chains using ZetaChain’s messaging infrastructure.

Unlike universal apps deployed directly on ZetaChain, this approach allows you to keep all contract logic on connected EVM chains. Messages are automatically routed between them through ZetaChain, without requiring any contracts to be deployed on ZetaChain itself.

Why use this pattern? Unlike universal apps deployed directly on ZetaChain, here all business logic stays on the connected EVM chains you already know. ZetaChain merely transports the payload, no contract code is deployed on ZetaChain itself.

By the end of this tutorial, you will:

Deploy a messaging contract to two EVM testnets (Base and Ethereum Sepolia)
Link them for cross-chain communication
Send a message and token value from one to the other
Track the cross-chain transaction from source to destination

Prerequisites
Make sure you have the following installed:

Node.js v18+
Yarn
Foundry
jq for parsing JSON in shell scripts
A funded private key for both Base Sepolia (84532) and Ethereum Sepolia (11155111)
Create a Project
Create a new project using the messaging template:

npx zetachain new --project messaging

Install TypeSCcipt and Foundry dependencies:

cd messaging
yarn
forge soldeer update


Compile contracts:

forge build

Save your private key in an environment variable so shell scripts can read it:

PRIVATE_KEY=...

Messaging Contract
To enable cross-chain messaging, your contract must inherit from ZetaChain’s Messaging base contract and implement a few required functions.

Import the Messaging.sol contract from the ZetaChain standard contracts package:

import "@zetachain/standard-contracts/contracts/messaging/contracts/Messaging.sol";

Inherit from Messaging in your contract:

contract Example is Messaging { ... }

Initialize the contract with the required parameters in the constructor:

constructor(
    address payable _gateway,
    address owner,
    address _router
) Messaging(_gateway, owner, _router) {}


The Messa`ging base contract provides built-in access to Gateway and Router, and ensures your contract is correctly wired into ZetaChain’s cross-chain messaging system.

You must implement three core internal functions for handling message delivery and fallback:

onMessageReceive
This is called automatically on the destination chain when a cross-chain message arrives successfully.

function onMessageReceive(
    bytes memory data,
    bytes memory sender,
    uint256 amount,
    bytes memory asset
) internal override {
    //...
}


Use this function to decode the message and execute logic like updating state, triggering downstream calls, or transferring the received token value.

onMessageRevert
This is triggered if the destination contract’s onMessageReceive fails (e.g., due to invalid calldata or logic errors).

function onMessageRevert(
    bytes memory data,
    bytes memory sender,
    uint256 amount,
    bytes memory asset
) internal override {
    //...
}


onRevert
This is called when a message fails during routing before reaching the destination chain. It executes on the source chain.

function onRevert(RevertContext calldata context)
    external
    payable
    override
    onlyGateway
{
    if (context.sender != router) revert Unauthorized();
    //...
}


You can use this to refund the user, trigger compensation logic, or emit a notification.

Sending a Message
To initiate a cross-chain message, your contract must call the depositAndCall function on the EVM Gateway. This function is what hands off your message and optional token value to ZetaChain’s messaging layer for routing.

Depending on whether you're sending native gas (like ETH) or ERC-20 tokens, you’ll use one of the following two forms of depositAndCall.

If you want to send a message with ETH as the value:

gateway.depositAndCall{value: msg.value}(
    router,
    message,
    revertOptions
);


If you're sending supported ERC-20 tokens:

gateway.depositAndCall(
    router,
    amount,
    asset,
    message,
    revertOptions
);


asset is the ERC-20 token address being sent (must be supported by ZetaChain).

What’s Inside the Message Payload?
The message argument is a single bytes field. It is ABI-encoded and must follow a structure that the Universal Router on ZetaChain understands.

abi.encode(
    receiver,       // bytes: destination contract address on the target chain
    targetToken,    // address: ZRC-20 address of the token to transfer to the destination contract
    data,           // bytes: message payload (e.g., ABI-encoded "hello")
    gasLimit,       // uint256: gas to forward for execution on the target chain
    revertOptions   // struct: defines what to do on failure
)


If you're sending the string "hello" to a contract on Ethereum Sepolia, you might encode:

bytes memory data = abi.encode("hello");
bytes memory message = abi.encode(
    abi.encodePacked(receiver),  // Destination contract address (as bytes)
    targetToken,                 // Token to transfer on destination chain
    data,                        // ABI-encoded message
    300_000,                     // Gas limit
    revertOptions                // Struct specifying fallback behavior
);


This message is then passed to depositAndCall() and routed through ZetaChain to the destination chain, where it is decoded and passed into the destination contract’s onMessageReceive().

What Is the Universal Router?
When you send a cross-chain message via gateway.depositAndCall(...), the actual logic that handles routing and execution on ZetaChain is implemented inside a contract called the Universal Router.

This contract runs on ZetaChain and acts as the entry point for all cross-chain messaging logic. It is responsible for:

Parsing the message payload sent from the source chain

Swapping tokens (if necessary) into:

The destination chain's gas token to cover execution fees
The destination contract's target token to be delivered
Forwarding the message and token to the destination contract

Handling fallback logic in case the destination call fails

All contracts that use the Messaging base contract share the same Universal Router. This shared router simplifies development, ensuring consistent behavior across all messaging-based apps.

The Universal Router ensures that your contract only needs to focus on sending an encoded payload, everything else, from gas handling to token transfer to delivery mechanics, is managed for you.

You don’t need to interact with the Universal Router directly. Just encode your message, call the Gateway, and ZetaChain will handle the rest.

🔧 Advanced: If you need more control, for example, to customize how tokens are swapped, route to different contracts, or handle messages differently, you can deploy your own instance of a router and point your contracts to it by passing its address to the Messaging constructor.

Deploy Messaging Contracts
Deploy to Base Sepolia:

MESSAGING_BASE=$(./commands/index.ts deploy --rpc https://sepolia.base.org --private-key $PRIVATE_KEY | jq -r .contractAddress)

Deploy to Ethereum Sepolia:

MESSAGING_ETHEREUM=$(./commands/index.ts deploy --rpc https://sepolia.drpc.org --private-key $PRIVATE_KEY | jq -r .contractAddress)

Connect Two Contracts
Before two contracts can communicate across chains, they need to explicitly trust each other. This prevents malicious contracts from spoofing cross-chain messages. In this step, you’ll establish a bidirectional link between the two deployed messaging contracts.

Each contract needs to know:

The address of the counterpart contract on the remote chain
The chain ID of that remote chain
This is done using the setConnected() function in the messaging contract. ZetaChain’s cross-chain infrastructure will only deliver messages to a contract if it has registered the sender as trusted.

⚠️ If you skip this step or set the wrong address/chain ID, messages will be rejected on the destination chain.

./commands/index.ts connect \
  --contract $MESSAGING_BASE \
  --target-contract $MESSAGING_ETHEREUM \
  --rpc https://sepolia.base.org \
  --target-chain-id 11155111 \
  --private-key $PRIVATE_KEY


./commands/index.ts connect \
  --contract $MESSAGING_ETHEREUM \
  --target-contract $MESSAGING_BASE \
  --rpc https://sepolia.drpc.org \
  --target-chain-id 84532 \
  --private-key $PRIVATE_KEY


Once both directions are linked, the contracts can send and receive messages.

Send a Cross-Chain Message
Now that your contracts are deployed and connected, you can send a message from one to the other.

This example sends the string "hello" from the contract on Base Sepolia to the contract on Ethereum Sepolia,

./commands/index.ts message \
  --rpc https://sepolia.base.org \
  --private-key $PRIVATE_KEY \
  --contract $MESSAGING_BASE \
  --target-contract $MESSAGING_ETHEREUM \
  --types string \
  --values hello \
  --target-token 0x05BA149A7bd6dC1F937fA9046A9e05C05f3b18b0 \
  --amount 0.005


Flag	Description
--rpc https://sepolia.base.org	The RPC endpoint for the source chain (Base Sepolia). This is where the transaction will be sent.
--private-key $PRIVATE_KEY	The account that signs and funds the transaction on the source chain. It must hold the token being sent.
--contract $MESSAGING_BASE	Address of the messaging contract deployed on the source chain. This contract initiates the cross-chain call.
--target-contract $MESSAGING_ETHEREUM	The address of the contract on the destination chain. This is the final recipient of the message.
--types string	The ABI type of the message you’re sending. This can be a single type (like string) or a tuple (e.g., string,uint256).
--values hello	The actual value to encode and send across chains, in this case, just the string "hello".
--target-token 0x...	The ZRC20 token address on ZetaChain that represents the destination chain’s token. This tells ZetaChain what asset to transfer to the target contract.
--amount 0.005	The total amount of tokens sent. A portion of this covers gas fees on the destination chain; the remainder is transferred to the destination contract.
How Amount is Handled
When you send a cross-chain message using --amount, you're not just transferring tokens, you’re also prepaying for gas on the destination chain. Here's what happens behind the scenes:

You supply tokens on the source chain (e.g., Base ETH). This can be native gas (like ETH) or any supported ERC-20.

You specify a target token via --target-token, which points to the ZRC-20 representing the token you want to deliver on the destination chain (e.g., Ethereum ETH).

On ZetaChain:

A portion of the supplied amount is automatically swapped into the ZRC-20 version of the gas token for the destination chain (Ethereum ETH in this example). This is used to cover the execution cost of the message on the destination chain.
The remaining amount is swapped into the target token (which might be the same token) and forwarded to the destination contract.
This makes the system fully automated: you don’t need to hold or acquire the destination chain’s native token to interact with it.

{
  "contractAddress": "0xee2E8dfefd723e879CAa30A1DaD94046Fa3D24D4",
  "targetContract": "0x7c9BbA0630c9452F726bc15D0a73cdF769438efE",
  "targetToken": "0x05BA149A7bd6dC1F937fA9046A9e05C05f3b18b0",
  "message": "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000568656c6c6f000000000000000000000000000000000000000000000000000000",
  "transactionHash": "0x939e230dd504efdf1fce31202a5980b4d0376430ddf535d080666256353c02c3",
  "amount": "0.005"
}


Track the Cross-Chain Transaction
Use the transaction hash from the previous step to query its cross-chain status:

npx zetachain query cctx --hash 0x939e230dd504efdf1fce31202a5980b4d0376430ddf535d080666256353c02c3

84532 → 7001 ✅ OutboundMined
CCTX:     0xd88d92d0b9b0a2fde416bf6383e430b51de48114b0b03e7cc34e7f8d8df15cb7
Tx Hash:  0x939e230dd504efdf1fce31202a5980b4d0376430ddf535d080666256353c02c3 (on chain 84532)
Tx Hash:  0x8c368f6a3cfc55950b5d2b0d98c63d1904a79300490ec7d1c258505f372054e3 (on chain 7001)
Sender:   0xee2E8dfefd723e879CAa30A1DaD94046Fa3D24D4
Receiver: 0x5BD35697D4a62DE429247cbBDCc5c47F70477775
Message:  00000000000000000000000000000000000000000000000000000000000000a000000000000000000000000005ba149a7bd6dc1f937fa9046a9e05c05f3b18b000000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000f4240000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000000147c9bba0630c9452f726bc15d0a73cdf769438efe00000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000568656c6c6f000000000000000000000000000000000000000000000000000000000000000000000000000000ee2e8dfefd723e879caa30a1dad94046fa3d24d40000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000f42400000000000000000000000000000000000000000000000000000000000000000
Amount:   5000000000000000 Gas tokens
7001 → 11155111 ✅ OutboundMined
CCTX:     0x8952c9f95dfb5673a9fbfa2196842b750f5530f4931a55088b1276599328fd64
Tx Hash:  0xd88d92d0b9b0a2fde416bf6383e430b51de48114b0b03e7cc34e7f8d8df15cb7 (on chain 7001)
Tx Hash:  0xf30e4414087e8b5c81e257e8a97ac9105dde37cbbd6bb33a1691c4a30585507e (on chain 11155111)
Sender:   0x5BD35697D4a62DE429247cbBDCc5c47F70477775
Receiver: 0x7c9BbA0630c9452F726bc15D0a73cdF769438efE
Message:  00000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000009ad718280b1cf00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000014a34000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000568656c6c6f0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014ee2e8dfefd723e879caa30a1dad94046fa3d24d40000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
Amount:   1074034700777807 Gas tokens


This confirms that the message has successfully moved from Base Sepolia through ZetaChain to Ethereum Sepolia.

You can verify the destination chain transaction on Etherscan:

https://sepolia.etherscan.io/tx/0xf30e4414087e8b5c81e257e8a97ac9105dde37cbbd6bb33a1691c4a30585507e



Solana
Deposit assets and call universal apps from Solana, make outgoing calls to Solana
60 min

Building universal applications with ZetaChain and Solana is easy. You can deposit SOL and SPL-20 tokens directly from Solana into accounts or smart contracts on ZetaChain. Universal contracts on ZetaChain can handle these deposits and execute contract calls initiated from the Solana blockchain.

In this tutorial, you'll:
Set up a local development environment using localnet.
Deploy a universal contract on ZetaChain.
Deposit tokens (SOL and SPL-20) from Solana to ZetaChain.
Execute deposit-and-call transactions, depositing tokens and calling a universal app simultaneously.
Withdraw tokens back to Solana, optionally calling Solana programs as part of the withdrawal.
Interactions with universal apps from Solana are handled by the Solana Gateway program, learn more about it in the docs.

Prerequisites
Ensure you have installed and configured the following before starting:

solana CLI
Clone the Example Project
Start by creating a project and installing the necessary dependencies:

npx zetachain@latest new --project call
cd call
yarn


Launch Localnet
This command brings up the local development environment with ZetaChain and Solana:

yarn zetachain localnet start

Leave this running in one terminal window.

Compile and Deploy an Example Universal Contract
In a new terminal window, compile and deploy the universal contract:

npx hardhat compile --force
npx hardhat deploy --name Universal --network localhost --gateway 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707


You will see a confirmation with your contract address:

🚀 Successfully deployed "Universal" contract on localhost.
📜 Contract address: 0x8198f5d8F8CfFE8f9C413d98a0A55aEB8ab9FbB7


Keep track of the contract address for later (in this example, 0x8198f5d8F8CfFE8f9C413d98a0A55aEB8ab9FbB7).

Deposit
Deposit SOL tokens from Solana to ZetaChain:

npx hardhat localnet:solana-deposit \
  --receiver 0x8198f5d8F8CfFE8f9C413d98a0A55aEB8ab9FbB7 \
  --amount 0.1


--receiver: Universal contract address on ZetaChain.

--amount: Amount of SOL to deposit.

Deposit and Call
Deposit tokens and simultaneously call the deployed universal contract:

npx hardhat localnet:solana-deposit-and-call \
  --receiver 0x8198f5d8F8CfFE8f9C413d98a0A55aEB8ab9FbB7 \
  --amount 0.1 \
  --types '["string"]' hello


This command deposits tokens and triggers the universal contract function with the argument "hello".

Withdraw Tokens to Solana
Withdraw tokens from ZetaChain back to Solana:

npx hardhat zetachain-withdraw \
  --gateway-zeta-chain 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707 \
  --receiver DrexsvCMH9WWjgnjVbx1iFf3YZcKadupFmxnZLfSyotd \
  --network localhost \
  --zrc20 0xd97B1de3619ed2c6BEb3860147E30cA8A7dC9891 \
  --amount 0.1


--gateway-zeta-chain: Address of the ZetaChain gateway.
--receiver: A Solana wallet address to receive the withdrawn tokens.
--zrc20: The ZetaChain representation of the token you want to withdraw (ZRC-20 address).
--amount: The amount to withdraw.
Withdraw and Call a Program on Solana
Beyond simply withdrawing tokens from ZetaChain back to Solana, you can also execute a Solana program as part of the withdrawal process. This allows for more complex interactions, such as triggering on-chain logic immediately upon receiving funds. For example, you can withdraw SOL or SPL-20 tokens and call a Solana program in a single transaction, enabling use cases like automatic staking, swaps, or contract executions.

The solana directory contains an example Solana program with an on_call function, which can be invoked by a universal app on ZetaChain during the withdrawal process.

The following steps will guide you through setting up an example Solana program and using the ZetaChain Gateway to perform a "withdraw and call".

Build and Set Up the Example Solana Program
Set the SPL-20 USDC address. You can find this address in a table in the output of localnet:

USDC_SPL=3Kx5SY7SwzdUZSorLVSpPgxBL8DZFiu8mg4FWduu2tQp

cd solana && anchor build && npx ts-node setup/main.ts "$USDC_SPL" && cd -

After running this, you should see output indicating that the program was successfully deployed, such as:

Connected program deployment output: Program Id: 9BjVGjn28E58LgSi547JYEpqpgRoo1TErkbyXiRSNDQy

Withdraw SOL and Call the Solana Program
Make a call to the ZetaChain Gateway to withdraw SOL and call a program on Solana:

npx hardhat zetachain-withdraw-and-call \
  --receiver 9BjVGjn28E58LgSi547JYEpqpgRoo1TErkbyXiRSNDQy \
  --gateway-zeta-chain 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707 \
  --zrc20 0xd97B1de3619ed2c6BEb3860147E30cA8A7dC9891 \
  --amount 0.01 \
  --network localhost \
  --types '["bytes"]' $(npx ts-node solana/setup/encodeCallArgs.ts "sol" "$USDC_SPL")


--receiver: The Solana program ID you want to call.
--types '["bytes"]': Specifies that the contract call argument is a bytes array (the encoded Solana call data).
"$ENCODED_ACCOUNTS_AND_DATA": The encoded Solana program call arguments we generated in the previous step.
--zrc20: ZRC-20 address of SOL on ZetaChain.
Withdraw SPL-20 and Call the Solana Program
Make a call to the ZetaChain Gateway to withdraw ZRC-20 SPL-20 USDC and call a program on Solana:

npx hardhat zetachain-withdraw-and-call \
  --receiver 9BjVGjn28E58LgSi547JYEpqpgRoo1TErkbyXiRSNDQy \
  --gateway-zeta-chain 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707 \
  --zrc20 0x48f80608B672DC30DC7e3dbBd0343c5F02C738Eb \
  --amount 0.01 \
  --network localhost \
  --types '["bytes"]' $(npx ts-node solana/setup/encodeCallArgs.ts "spl" "$USDC_SPL")


--zrc20: ZRC-20 address of SPL-20 USDC on ZetaChain.
In this tutorial you’ve learned how to deploy a universal contract on ZetaChain, deposit SOL and SPL-20 tokens from Solana, call contracts during deposits, withdraw assets back to Solana, and even trigger Solana programs upon withdrawal.





ZetaChain and EVM
ZetaChain and EVM protocol contracts
GatewayEVM
Git Source

The GatewayEVM contract is the endpoint to call smart contracts on external chains.

The contract doesn't hold any funds and should never have active allowances.

State Variables
custody
The address of the custody contract.

address public custody;

tssAddress
The address of the TSS (Threshold Signature Scheme) contract.

address public tssAddress;

zetaConnector
The address of the ZetaConnector contract.

address public zetaConnector;

zetaToken
The address of the Zeta token contract.

address public zetaToken;

TSS_ROLE
New role identifier for tss role.

bytes32 public constant TSS_ROLE = keccak256("TSS_ROLE");

ASSET_HANDLER_ROLE
New role identifier for asset handler role.

bytes32 public constant ASSET_HANDLER_ROLE = keccak256("ASSET_HANDLER_ROLE");

PAUSER_ROLE
New role identifier for pauser role.

bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

MAX_PAYLOAD_SIZE
Max size of payload + revertOptions revert message.

uint256 public constant MAX_PAYLOAD_SIZE = 2880;

Functions
constructor
Note: oz-upgrades-unsafe-allow: constructor

constructor();

initialize
Initialize with tss address. address of zeta token and admin account set as DEFAULT_ADMIN_ROLE.

Using admin to authorize upgrades and pause, and tss for tss role.

function initialize(address tssAddress_, address zetaToken_, address admin_) public initializer;

_authorizeUpgrade
Authorizes the upgrade of the contract, sender must be owner.

function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE);

Parameters

Name	Type	Description
newImplementation	address	Address of the new implementation.
updateTSSAddress
Update tss address

function updateTSSAddress(address newTSSAddress) external onlyRole(DEFAULT_ADMIN_ROLE);

Parameters

Name	Type	Description
newTSSAddress	address	new tss address
pause
Pause contract.

function pause() external onlyRole(PAUSER_ROLE);

unpause
Unpause contract.

function unpause() external onlyRole(PAUSER_ROLE);

executeRevert
Transfers msg.value to destination contract and executes it's onRevert function.

This function can only be called by the TSS address and it is payable.

function executeRevert(
    address destination,
    bytes calldata data,
    RevertContext calldata revertContext
)
    public
    payable
    nonReentrant
    onlyRole(TSS_ROLE)
    whenNotPaused;


Parameters

Name	Type	Description
destination	address	Address to call.
data	bytes	Calldata to pass to the call.
revertContext	RevertContext	
execute
Executes a call to a destination address without ERC20 tokens.

This function can only be called by the TSS address and it is payable.

function execute(
    MessageContext calldata messageContext,
    address destination,
    bytes calldata data
)
    external
    payable
    nonReentrant
    onlyRole(TSS_ROLE)
    whenNotPaused
    returns (bytes memory);


Parameters

Name	Type	Description
messageContext	MessageContext	Message context containing sender.
destination	address	Address to call.
data	bytes	Calldata to pass to the call.
Returns

Name	Type	Description
<none>	bytes	The result of the call.
executeWithERC20
Executes a call to a destination contract using ERC20 tokens.

This function can only be called by the custody or connector address. It uses the ERC20 allowance system, resetting gateway allowance at the end.

function executeWithERC20(
    MessageContext calldata messageContext,
    address token,
    address to,
    uint256 amount,
    bytes calldata data
)
    public
    nonReentrant
    onlyRole(ASSET_HANDLER_ROLE)
    whenNotPaused;


Parameters

Name	Type	Description
messageContext	MessageContext	Message context containing sender.
token	address	Address of the ERC20 token.
to	address	Address of the contract to call.
amount	uint256	Amount of tokens to transfer.
data	bytes	Calldata to pass to the call.
revertWithERC20
Directly transfers ERC20 tokens and calls onRevert.

This function can only be called by the custody or connector address.

function revertWithERC20(
    address token,
    address to,
    uint256 amount,
    bytes calldata data,
    RevertContext calldata revertContext
)
    external
    nonReentrant
    onlyRole(ASSET_HANDLER_ROLE)
    whenNotPaused;


Parameters

Name	Type	Description
token	address	Address of the ERC20 token.
to	address	Address of the contract to call.
amount	uint256	Amount of tokens to transfer.
data	bytes	Calldata to pass to the call.
revertContext	RevertContext	Revert context to pass to onRevert.
deposit
Deposits ETH to the TSS address.

function deposit(address receiver, RevertOptions calldata revertOptions) external payable whenNotPaused;

Parameters

Name	Type	Description
receiver	address	Address of the receiver.
revertOptions	RevertOptions	Revert options.
deposit
Deposits ERC20 tokens to the custody or connector contract.

function deposit(
    address receiver,
    uint256 amount,
    address asset,
    RevertOptions calldata revertOptions
)
    external
    whenNotPaused;


Parameters

Name	Type	Description
receiver	address	Address of the receiver.
amount	uint256	Amount of tokens to deposit.
asset	address	Address of the ERC20 token.
revertOptions	RevertOptions	Revert options.
depositAndCall
Deposits ETH to the TSS address and calls an omnichain smart contract.

function depositAndCall(
    address receiver,
    bytes calldata payload,
    RevertOptions calldata revertOptions
)
    external
    payable
    whenNotPaused;


Parameters

Name	Type	Description
receiver	address	Address of the receiver.
payload	bytes	Calldata to pass to the call.
revertOptions	RevertOptions	Revert options.
depositAndCall
Deposits ERC20 tokens to the custody or connector contract and calls an omnichain smart contract.

function depositAndCall(
    address receiver,
    uint256 amount,
    address asset,
    bytes calldata payload,
    RevertOptions calldata revertOptions
)
    external
    whenNotPaused;


Parameters

Name	Type	Description
receiver	address	Address of the receiver.
amount	uint256	Amount of tokens to deposit.
asset	address	Address of the ERC20 token.
payload	bytes	Calldata to pass to the call.
revertOptions	RevertOptions	Revert options.
call
Calls an omnichain smart contract without asset transfer.

function call(address receiver, bytes calldata payload, RevertOptions calldata revertOptions) external whenNotPaused;

Parameters

Name	Type	Description
receiver	address	Address of the receiver.
payload	bytes	Calldata to pass to the call.
revertOptions	RevertOptions	Revert options.
setCustody
Sets the custody contract address.

function setCustody(address custody_) external onlyRole(DEFAULT_ADMIN_ROLE);

Parameters

Name	Type	Description
custody_	address	Address of the custody contract.
setConnector
Sets the connector contract address.

function setConnector(address zetaConnector_) external onlyRole(DEFAULT_ADMIN_ROLE);

Parameters

Name	Type	Description
zetaConnector_	address	Address of the connector contract.
_resetApproval
Resets the approval of a token for a specified address. This is used to ensure that the approval is set to zero before setting it to a new value.

function _resetApproval(address token, address to) private returns (bool);

Parameters

Name	Type	Description
token	address	Address of the ERC20 token.
to	address	Address to reset the approval for.
Returns

Name	Type	Description
<none>	bool	True if the approval reset was successful or if the token reverts on zero approval.
_transferFromToAssetHandler
Transfers tokens from the sender to the asset handler. This function handles the transfer of tokens to either the connector or custody contract based on the asset type.

function _transferFromToAssetHandler(address from, address token, uint256 amount) private;

Parameters

Name	Type	Description
from	address	Address of the sender.
token	address	Address of the ERC20 token.
amount	uint256	Amount of tokens to transfer.
_transferToAssetHandler
Transfers tokens to the asset handler. This function handles the transfer of tokens to either the connector or custody contract based on the asset type.

function _transferToAssetHandler(address token, uint256 amount) private;

Parameters

Name	Type	Description
token	address	Address of the ERC20 token.
amount	uint256	Amount of tokens to transfer.
_executeArbitraryCall
Private function to execute an arbitrary call to a destination address.

function _executeArbitraryCall(address destination, bytes calldata data) private returns (bytes memory);

Parameters

Name	Type	Description
destination	address	Address to call.
data	bytes	Calldata to pass to the call.
Returns

Name	Type	Description
<none>	bytes	The result of the call.
_executeAuthenticatedCall
Private function to execute an authenticated call to a destination address.

function _executeAuthenticatedCall(
    MessageContext calldata messageContext,
    address destination,
    bytes calldata data
)
    private
    returns (bytes memory);


Parameters

Name	Type	Description
messageContext	MessageContext	Message context containing sender and arbitrary call flag.
destination	address	Address to call.
data	bytes	Calldata to pass to the call.
Returns

Name	Type	Description
<none>	bytes	The result of the call.
_revertIfOnCallOrOnRevert
function _revertIfOnCallOrOnRevert(bytes calldata data) private pure;

GatewayZEVM
Git Source

The GatewayZEVM contract is the endpoint to call smart contracts on omnichain.

The contract doesn't hold any funds and should never have active allowances.

State Variables
PROTOCOL_ADDRESS
The constant address of the protocol

address public constant PROTOCOL_ADDRESS = 0x735b14BB79463307AAcBED86DAf3322B1e6226aB;

PAUSER_ROLE
New role identifier for pauser role.

bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

zetaToken
The address of the Zeta token.

address public zetaToken;

registry
The address of the registry contract on ZetaChain

address public registry;

Functions
onlyProtocol
Only protocol address allowed modifier.

modifier onlyProtocol();

constructor
Note: oz-upgrades-unsafe-allow: constructor

constructor();

initialize
Initialize with address of zeta token and admin account set as DEFAULT_ADMIN_ROLE.

Using admin to authorize upgrades and pause.

function initialize(address zetaToken_, address admin_) public initializer;

_authorizeUpgrade
Authorizes the upgrade of the contract.

function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE);

Parameters

Name	Type	Description
newImplementation	address	The address of the new implementation.
receive
Receive function to receive ZETA from WETH9.withdraw().

receive() external payable whenNotPaused;

pause
Pause contract.

function pause() external onlyRole(PAUSER_ROLE);

unpause
Unpause contract.

function unpause() external onlyRole(PAUSER_ROLE);

setRegistryAddress
Set registry address, callable only by DEFAULT_ADMIN_ROLE.

function setRegistryAddress(address _registry) external onlyRole(DEFAULT_ADMIN_ROLE);

Parameters

Name	Type	Description
_registry	address	The address of the registry contract.
_safeTransferFrom
Helper function to safely execute transferFrom

function _safeTransferFrom(address zrc20, address from, address to, uint256 amount) private returns (bool);

Parameters

Name	Type	Description
zrc20	address	The ZRC20 token address
from	address	The sender address
to	address	The recipient address
amount	uint256	The amount to transfer
Returns

Name	Type	Description
<none>	bool	True if the transfer was successful, false otherwise.
_safeBurn
function _safeBurn(address zrc20, uint256 amount) private returns (bool);

_safeDeposit
function _safeDeposit(address zrc20, address target, uint256 amount) private returns (bool);

_burnProtocolFees
Helper function to burn gas fees.

function _burnProtocolFees(address gasZRC20, uint256 gasFee) private;

Parameters

Name	Type	Description
gasZRC20	address	The address of the gas ZRC20 token.
gasFee	uint256	The amount of gasZRC20 that should be burned.
_burnZRC20ProtocolFees
Helper function to burn gas fees for ZRC20s withdrawals.

function _burnZRC20ProtocolFees(address zrc20, uint256 gasLimit) private returns (uint256);

Parameters

Name	Type	Description
zrc20	address	The address of the ZRC20 token.
gasLimit	uint256	Gas limit.
_withdrawZRC20WithGasLimit
Private function to withdraw ZRC20 tokens with gas limit.

function _withdrawZRC20WithGasLimit(uint256 amount, address zrc20, uint256 gasLimit) private returns (uint256);

Parameters

Name	Type	Description
amount	uint256	The amount of tokens to withdraw.
zrc20	address	The address of the ZRC20 token.
gasLimit	uint256	Gas limit.
Returns

Name	Type	Description
<none>	uint256	The gas fee for the withdrawal.
_getGasLimitForZETATransfer
Helper function to get gas limit for the ZETA transfer to the external chain.

function _getGasLimitForZETATransfer(uint256 chainId) private view returns (uint256 gasLimit);

Parameters

Name	Type	Description
chainId	uint256	Chain id of the external chain.
Returns

Name	Type	Description
gasLimit	uint256	The gas limit.
_getProtocolFlatFeeFromRegistry
Helper function to get protocol flat fee for the external chain.

function _getProtocolFlatFeeFromRegistry(uint256 chainId) private view returns (uint256 protocolFlatFee);

Parameters

Name	Type	Description
chainId	uint256	Chain id of the external chain.
Returns

Name	Type	Description
protocolFlatFee	uint256	The protocol flat fee.
_computeAndPayFeesForZETAWithdrawals
Helper function to burn gas fees for ZETA withdrawals.

function _computeAndPayFeesForZETAWithdrawals(
    uint256 chainId,
    uint256 gasLimit
)
    private
    returns (uint256 gasFee, uint256 protocolFlatFee, uint256 gasLimit_);


Parameters

Name	Type	Description
chainId	uint256	Chain id of the external chain.
gasLimit	uint256	The gas limit.
Returns

Name	Type	Description
gasFee	uint256	The gas fee for the withdrawal.
protocolFlatFee	uint256	The protocol flat fee.
gasLimit_	uint256	The gas limit used for the withdrawal.
_transferZETA
Private function to transfer ZETA tokens.

function _transferZETA(uint256 amount, address to) private;

Parameters

Name	Type	Description
amount	uint256	The amount of tokens to transfer.
to	address	The address to transfer the tokens to.
withdraw
Withdraw ZRC20 tokens to an external chain.

function withdraw(
    bytes memory receiver,
    uint256 amount,
    address zrc20,
    RevertOptions calldata revertOptions
)
    external
    whenNotPaused;


Parameters

Name	Type	Description
receiver	bytes	The receiver address on the external chain.
amount	uint256	The amount of tokens to withdraw.
zrc20	address	The address of the ZRC20 token.
revertOptions	RevertOptions	Revert options.
withdraw
Withdraw ZRC20 tokens to an external chain with custom gas limit.

Use this function for simple gas ZRC20 withdrawals to the receivers that are either smart contract accounts or smart contracts with custom receive/fallback implementations.

function withdraw(
    bytes memory receiver,
    uint256 amount,
    address zrc20,
    uint256 gasLimit,
    RevertOptions calldata revertOptions
)
    external
    whenNotPaused;


Parameters

Name	Type	Description
receiver	bytes	The receiver address on the external chain.
amount	uint256	The amount of tokens to withdraw.
zrc20	address	The address of the ZRC20 token.
gasLimit	uint256	The custom gas limit for the withdrawal (must be >= MIN_GAS_LIMIT).
revertOptions	RevertOptions	Revert options.
withdrawAndCall
Withdraw ZRC20 tokens and call a smart contract on an external chain.

function withdrawAndCall(
    bytes memory receiver,
    uint256 amount,
    address zrc20,
    bytes calldata message,
    CallOptions calldata callOptions,
    RevertOptions calldata revertOptions
)
    external
    whenNotPaused;


Parameters

Name	Type	Description
receiver	bytes	The receiver address on the external chain.
amount	uint256	The amount of tokens to withdraw.
zrc20	address	The address of the ZRC20 token.
message	bytes	The calldata to pass to the contract call.
callOptions	CallOptions	Call options including gas limit and arbirtrary call flag.
revertOptions	RevertOptions	Revert options.
withdraw
Withdraw ZETA tokens to an external chain.

function withdraw(
    bytes memory receiver,
    uint256 chainId,
    RevertOptions calldata revertOptions
)
    external
    payable
    whenNotPaused
    nonReentrant;


withdrawAndCall
Withdraw ZETA tokens and call a smart contract on an external chain.

function withdrawAndCall(
    bytes memory receiver,
    uint256 chainId,
    bytes calldata message,
    CallOptions calldata callOptions,
    RevertOptions calldata revertOptions
)
    external
    payable
    whenNotPaused
    nonReentrant;


call
Call a smart contract on an external chain without asset transfer.

function call(
    bytes memory receiver,
    address zrc20,
    bytes calldata message,
    CallOptions calldata callOptions,
    RevertOptions calldata revertOptions
)
    external
    whenNotPaused;


Parameters

Name	Type	Description
receiver	bytes	The receiver address on the external chain.
zrc20	address	Address of zrc20 to pay fees.
message	bytes	The calldata to pass to the contract call.
callOptions	CallOptions	Call options including gas limit and arbirtrary call flag.
revertOptions	RevertOptions	Revert options.
_call
function _call(
    bytes memory receiver,
    address zrc20,
    bytes calldata message,
    CallOptions memory callOptions,
    RevertOptions memory revertOptions
)
    private;


deposit
Deposit foreign coins into ZRC20.

function deposit(address zrc20, uint256 amount, address target) external onlyProtocol whenNotPaused;

Parameters

Name	Type	Description
zrc20	address	The address of the ZRC20 token.
amount	uint256	The amount of tokens to deposit.
target	address	The target address to receive the deposited tokens.
deposit
Deposit native ZETA.

function deposit(address target) external payable nonReentrant onlyProtocol whenNotPaused;

Parameters

Name	Type	Description
target	address	The target address to receive the ZETA.
execute
Execute a user-specified contract on ZEVM.

function execute(
    MessageContext calldata context,
    address zrc20,
    uint256 amount,
    address target,
    bytes calldata message
)
    external
    nonReentrant
    onlyProtocol
    whenNotPaused;


Parameters

Name	Type	Description
context	MessageContext	The context of the cross-chain call.
zrc20	address	The address of the ZRC20 token.
amount	uint256	The amount of tokens to transfer.
target	address	The target contract to call.
message	bytes	The calldata to pass to the contract call.
depositAndCall
Deposit foreign coins into ZRC20 and call a user-specified contract on ZEVM.

function depositAndCall(
    MessageContext calldata context,
    address zrc20,
    uint256 amount,
    address target,
    bytes calldata message
)
    external
    nonReentrant
    onlyProtocol
    whenNotPaused;


Parameters

Name	Type	Description
context	MessageContext	The context of the cross-chain call.
zrc20	address	The address of the ZRC20 token.
amount	uint256	The amount of tokens to transfer.
target	address	The target contract to call.
message	bytes	The calldata to pass to the contract call.
depositAndCall
Deposit native ZETA and call a user-specified contract on ZEVM.

function depositAndCall(
    MessageContext calldata context,
    address target,
    bytes calldata message
)
    external
    payable
    nonReentrant
    onlyProtocol
    whenNotPaused;


Parameters

Name	Type	Description
context	MessageContext	The context of the cross-chain call.
target	address	The target contract to call.
message	bytes	The calldata to pass to the contract call.
executeRevert
Revert a user-specified contract on ZEVM.

function executeRevert(
    address target,
    RevertContext calldata revertContext
)
    external
    nonReentrant
    onlyProtocol
    whenNotPaused;


Parameters

Name	Type	Description
target	address	The target contract to call.
revertContext	RevertContext	Revert context to pass to onRevert.
depositAndRevert
Deposit foreign coins into ZRC20 and revert a user-specified contract on ZEVM.

function depositAndRevert(
    address zrc20,
    uint256 amount,
    address target,
    RevertContext calldata revertContext
)
    external
    nonReentrant
    onlyProtocol
    whenNotPaused;


Parameters

Name	Type	Description
zrc20	address	The address of the ZRC20 token.
amount	uint256	The amount of tokens to revert.
target	address	The target contract to call.
revertContext	RevertContext	Revert context to pass to onRevert.
depositAndRevert
Deposit native ZETA and revert a user-specified contract on ZEVM.

function depositAndRevert(
    address target,
    RevertContext calldata revertContext
)
    external
    payable
    nonReentrant
    onlyProtocol
    whenNotPaused;


Parameters

Name	Type	Description
target	address	The target contract to call.
revertContext	RevertContext	Revert context to pass to onRevert.
executeAbort
Call onAbort on a user-specified contract on ZEVM. this function doesn't deposit the asset to the target contract. This operation is done directly by the protocol. the assets are deposited to the target contract even if onAbort reverts.

function executeAbort(
    address target,
    AbortContext calldata abortContext
)
    external
    nonReentrant
    onlyProtocol
    whenNotPaused;


Parameters

Name	Type	Description
target	address	The target contract to call.
abortContext	AbortContext	Abort context to pass to onAbort.
getMaxMessageSize
Returns the maximum message size.

function getMaxMessageSize() external pure returns (uint256);

Returns

Name	Type	Description
<none>	uint256	The maximum message size.
getMinGasLimit
Returns the minimum gas limit allowed.

function getMinGasLimit() external pure returns (uint256);

Returns

Name	Type	Description
<none>	uint256	The minimum gas limit.
getMaxRevertGasLimit
Returns the maximum revert gas limit allowed.

function getMaxRevertGasLimit() external pure returns (uint256);

Returns

Name	Type	Description
<none>	uint256	The maximum revert gas limit.
INotSupportedMethods
Git Source

Interface for contracts that with non supported methods.

Errors
CallOnRevertNotSupported
error CallOnRevertNotSupported();

ERC20Custody
Git Source

Holds the ERC20 tokens deposited on ZetaChain and includes functionality to call a contract.

This contract does not call smart contracts directly, it passes through the Gateway contract.

State Variables
gateway
Gateway contract.

IGatewayEVM public gateway;

whitelisted
Mapping of whitelisted tokens => true/false.

mapping(address => bool) public whitelisted;

tssAddress
The address of the TSS (Threshold Signature Scheme) contract.

address public tssAddress;

supportsLegacy
Used to flag if contract supports legacy methods (eg. deposit).

bool public supportsLegacy;

PAUSER_ROLE
New role identifier for pauser role.

bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

WITHDRAWER_ROLE
New role identifier for withdrawer role.

bytes32 public constant WITHDRAWER_ROLE = keccak256("WITHDRAWER_ROLE");

WHITELISTER_ROLE
New role identifier for whitelister role.

bytes32 public constant WHITELISTER_ROLE = keccak256("WHITELISTER_ROLE");

Functions
initialize
Initializer for ERC20Custody.

Set admin as default admin and pauser, and tssAddress as tss role.

function initialize(address gateway_, address tssAddress_, address admin_) public initializer;

_authorizeUpgrade
Authorizes the upgrade of the contract, sender must be owner.

function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE);

Parameters

Name	Type	Description
newImplementation	address	Address of the new implementation.
pause
Pause contract.

function pause() external onlyRole(PAUSER_ROLE);

unpause
Unpause contract.

function unpause() external onlyRole(PAUSER_ROLE);

updateTSSAddress
Update tss address

function updateTSSAddress(address newTSSAddress) external onlyRole(DEFAULT_ADMIN_ROLE);

Parameters

Name	Type	Description
newTSSAddress	address	new tss address
setSupportsLegacy
Unpause contract.

function setSupportsLegacy(bool _supportsLegacy) external onlyRole(DEFAULT_ADMIN_ROLE);

whitelist
Whitelist ERC20 token.

function whitelist(address token) external onlyRole(WHITELISTER_ROLE);

Parameters

Name	Type	Description
token	address	address of ERC20 token
unwhitelist
Unwhitelist ERC20 token.

function unwhitelist(address token) external onlyRole(WHITELISTER_ROLE);

Parameters

Name	Type	Description
token	address	address of ERC20 token
withdraw
Withdraw directly transfers the tokens to the destination address without contract call.

This function can only be called by the TSS address.

function withdraw(
    address to,
    address token,
    uint256 amount
)
    external
    nonReentrant
    onlyRole(WITHDRAWER_ROLE)
    whenNotPaused;


Parameters

Name	Type	Description
to	address	Destination address for the tokens.
token	address	Address of the ERC20 token.
amount	uint256	Amount of tokens to withdraw.
withdrawAndCall
WithdrawAndCall transfers tokens to Gateway and call a contract through the Gateway.

This function can only be called by the TSS address.

function withdrawAndCall(
    MessageContext calldata messageContext,
    address to,
    address token,
    uint256 amount,
    bytes calldata data
)
    public
    nonReentrant
    onlyRole(WITHDRAWER_ROLE)
    whenNotPaused;


Parameters

Name	Type	Description
messageContext	MessageContext	Message context containing sender.
to	address	Address of the contract to call.
token	address	Address of the ERC20 token.
amount	uint256	Amount of tokens to withdraw.
data	bytes	Calldata to pass to the contract call.
withdrawAndRevert
WithdrawAndRevert transfers tokens to Gateway and call a contract with a revert functionality through the Gateway.

This function can only be called by the TSS address.

function withdrawAndRevert(
    address to,
    address token,
    uint256 amount,
    bytes calldata data,
    RevertContext calldata revertContext
)
    public
    nonReentrant
    onlyRole(WITHDRAWER_ROLE)
    whenNotPaused;


Parameters

Name	Type	Description
to	address	Address of the contract to call.
token	address	Address of the ERC20 token.
amount	uint256	Amount of tokens to withdraw.
data	bytes	Calldata to pass to the contract call.
revertContext	RevertContext	Revert context to pass to onRevert.
deposit
Deposits asset to custody and pay fee in zeta erc20.

Note: deprecated: This method is deprecated.

function deposit(
    bytes calldata recipient,
    IERC20 asset,
    uint256 amount,
    bytes calldata message
)
    external
    nonReentrant
    whenNotPaused;


IERC20Custody
Git Source

Functions
whitelisted
Mapping of whitelisted tokens => true/false.

function whitelisted(address token) external view returns (bool);

withdraw
Withdraw directly transfers the tokens to the destination address without contract call.

This function can only be called by the TSS address.

function withdraw(address token, address to, uint256 amount) external;

Parameters

Name	Type	Description
token	address	Address of the ERC20 token.
to	address	Destination address for the tokens.
amount	uint256	Amount of tokens to withdraw.
withdrawAndCall
WithdrawAndCall transfers tokens to Gateway and call a contract through the Gateway.

This function can only be called by the TSS address.

function withdrawAndCall(
    MessageContext calldata messageContext,
    address token,
    address to,
    uint256 amount,
    bytes calldata data
)
    external;


Parameters

Name	Type	Description
messageContext	MessageContext	Message context containing sender.
token	address	Address of the ERC20 token.
to	address	Address of the contract to call.
amount	uint256	Amount of tokens to withdraw.
data	bytes	Calldata to pass to the contract call.
withdrawAndRevert
WithdrawAndRevert transfers tokens to Gateway and call a contract with a revert functionality through the Gateway.

This function can only be called by the TSS address.

function withdrawAndRevert(
    address token,
    address to,
    uint256 amount,
    bytes calldata data,
    RevertContext calldata revertContext
)
    external;


Parameters

Name	Type	Description
token	address	Address of the ERC20 token.
to	address	Address of the contract to call.
amount	uint256	Amount of tokens to withdraw.
data	bytes	Calldata to pass to the contract call.
revertContext	RevertContext	Revert context to pass to onRevert.
IERC20CustodyErrors
Git Source

Interface for the errors used in the ERC20 custody contract.

Errors
ZeroAddress
Error for zero address input.

error ZeroAddress();

NotWhitelisted
Error for not whitelisted ERC20 token

error NotWhitelisted();

LegacyMethodsNotSupported
Error for calling not supported legacy methods.

error LegacyMethodsNotSupported();

IERC20CustodyEvents
Git Source

Interface for the events emitted by the ERC20 custody contract.

Events
Withdrawn
Emitted when tokens are withdrawn.

event Withdrawn(address indexed to, address indexed token, uint256 amount);

Parameters

Name	Type	Description
to	address	The address receiving the tokens.
token	address	The address of the ERC20 token.
amount	uint256	The amount of tokens withdrawn.
WithdrawnAndCalled
Emitted when tokens are withdrawn and a contract call is made.

event WithdrawnAndCalled(address indexed to, address indexed token, uint256 amount, bytes data);

Parameters

Name	Type	Description
to	address	The address receiving the tokens.
token	address	The address of the ERC20 token.
amount	uint256	The amount of tokens withdrawn.
data	bytes	The calldata passed to the contract call.
WithdrawnAndReverted
Emitted when tokens are withdrawn and a revertable contract call is made.

event WithdrawnAndReverted(
    address indexed to, address indexed token, uint256 amount, bytes data, RevertContext revertContext
);


Parameters

Name	Type	Description
to	address	The address receiving the tokens.
token	address	The address of the ERC20 token.
amount	uint256	The amount of tokens withdrawn.
data	bytes	The calldata passed to the contract call.
revertContext	RevertContext	Revert context to pass to onRevert.
Whitelisted
Emitted when ERC20 token is whitelisted

event Whitelisted(address indexed token);

Parameters

Name	Type	Description
token	address	address of ERC20 token.
Unwhitelisted
Emitted when ERC20 token is unwhitelisted

event Unwhitelisted(address indexed token);

Parameters

Name	Type	Description
token	address	address of ERC20 token.
Deposited
Emitted in legacy deposit method.

event Deposited(bytes recipient, IERC20 indexed asset, uint256 amount, bytes message);

UpdatedCustodyTSSAddress
Emitted when tss address is updated

event UpdatedCustodyTSSAddress(address oldTSSAddress, address newTSSAddress);

Parameters

Name	Type	Description
oldTSSAddress	address	old tss address
newTSSAddress	address	new tss address
Callable
Git Source

Interface implemented by contracts receiving authenticated calls.

Functions
onCall
function onCall(MessageContext calldata context, bytes calldata message) external payable returns (bytes memory);

IGatewayEVM
Git Source

Interface for the GatewayEVM contract.

Functions
executeWithERC20
Executes a call to a contract using ERC20 tokens.

function executeWithERC20(
    MessageContext calldata messageContext,
    address token,
    address to,
    uint256 amount,
    bytes calldata data
)
    external;


Parameters

Name	Type	Description
messageContext	MessageContext	Message context containing sender and arbitrary call flag.
token	address	The address of the ERC20 token.
to	address	The address of the contract to call.
amount	uint256	The amount of tokens to transfer.
data	bytes	The calldata to pass to the contract call.
executeRevert
Transfers msg.value to destination contract and executes it's onRevert function.

This function can only be called by the TSS address and it is payable.

function executeRevert(
    address destination,
    bytes calldata data,
    RevertContext calldata revertContext
)
    external
    payable;


Parameters

Name	Type	Description
destination	address	Address to call.
data	bytes	Calldata to pass to the call.
revertContext	RevertContext	Revert context to pass to onRevert.
execute
Executes a call to a destination address without ERC20 tokens.

This function can only be called by the TSS address and it is payable.

function execute(
    MessageContext calldata messageContext,
    address destination,
    bytes calldata data
)
    external
    payable
    returns (bytes memory);


Parameters

Name	Type	Description
messageContext	MessageContext	Message context containing sender and arbitrary call flag.
destination	address	Address to call.
data	bytes	Calldata to pass to the call.
Returns

Name	Type	Description
<none>	bytes	The result of the call.
revertWithERC20
Executes a revertable call to a contract using ERC20 tokens.

function revertWithERC20(
    address token,
    address to,
    uint256 amount,
    bytes calldata data,
    RevertContext calldata revertContext
)
    external;


Parameters

Name	Type	Description
token	address	The address of the ERC20 token.
to	address	The address of the contract to call.
amount	uint256	The amount of tokens to transfer.
data	bytes	The calldata to pass to the contract call.
revertContext	RevertContext	Revert context to pass to onRevert.
deposit
Deposits ETH to the TSS address.

function deposit(address receiver, RevertOptions calldata revertOptions) external payable;

Parameters

Name	Type	Description
receiver	address	Address of the receiver.
revertOptions	RevertOptions	Revert options.
deposit
Deposits ERC20 tokens to the custody or connector contract.

function deposit(address receiver, uint256 amount, address asset, RevertOptions calldata revertOptions) external;

Parameters

Name	Type	Description
receiver	address	Address of the receiver.
amount	uint256	Amount of tokens to deposit.
asset	address	Address of the ERC20 token.
revertOptions	RevertOptions	Revert options.
depositAndCall
Deposits ETH to the TSS address and calls an omnichain smart contract.

function depositAndCall(
    address receiver,
    bytes calldata payload,
    RevertOptions calldata revertOptions
)
    external
    payable;


Parameters

Name	Type	Description
receiver	address	Address of the receiver.
payload	bytes	Calldata to pass to the call.
revertOptions	RevertOptions	Revert options.
depositAndCall
Deposits ERC20 tokens to the custody or connector contract and calls an omnichain smart contract.

function depositAndCall(
    address receiver,
    uint256 amount,
    address asset,
    bytes calldata payload,
    RevertOptions calldata revertOptions
)
    external;


Parameters

Name	Type	Description
receiver	address	Address of the receiver.
amount	uint256	Amount of tokens to deposit.
asset	address	Address of the ERC20 token.
payload	bytes	Calldata to pass to the call.
revertOptions	RevertOptions	Revert options.
call
Calls an omnichain smart contract without asset transfer.

function call(address receiver, bytes calldata payload, RevertOptions calldata revertOptions) external;

Parameters

Name	Type	Description
receiver	address	Address of the receiver.
payload	bytes	Calldata to pass to the call.
revertOptions	RevertOptions	Revert options.
IGatewayEVMErrors
Git Source

Interface for the errors used in the GatewayEVM contract.

Errors
ExecutionFailed
Error for failed execution.

error ExecutionFailed();

DepositFailed
Error for failed deposit.

error DepositFailed();

InsufficientETHAmount
Error for insufficient ETH amount.

error InsufficientETHAmount();

InsufficientERC20Amount
Error for insufficient ERC20 token amount.

error InsufficientERC20Amount();

ZeroAddress
Error for zero address input.

error ZeroAddress();

ApprovalFailed
Error for failed token approval.

error ApprovalFailed(address token, address spender);

Parameters

Name	Type	Description
token	address	The address of the token for which approval failed.
spender	address	The address that was supposed to be approved to spend the tokens.
CustodyInitialized
Error for already initialized custody.

error CustodyInitialized();

ConnectorInitialized
Error for already initialized connector.

error ConnectorInitialized();

NotWhitelistedInCustody
Error when trying to transfer not whitelisted token to custody.

error NotWhitelistedInCustody(address token);

Parameters

Name	Type	Description
token	address	The address of the token that is not whitelisted in custody.
NotAllowedToCallOnCall
Error when trying to call onCall method using arbitrary call.

error NotAllowedToCallOnCall();

NotAllowedToCallOnRevert
Error when trying to call onRevert method using arbitrary call.

error NotAllowedToCallOnRevert();

PayloadSizeExceeded
Error indicating payload size exceeded in external functions.

error PayloadSizeExceeded(uint256 provided, uint256 maximum);

Parameters

Name	Type	Description
provided	uint256	The size of the payload that was provided.
maximum	uint256	The maximum allowed payload size.
IGatewayEVMEvents
Git Source

Interface for the events emitted by the GatewayEVM contract.

Events
Executed
Emitted when a contract call is executed.

event Executed(address indexed destination, uint256 value, bytes data);

Parameters

Name	Type	Description
destination	address	The address of the contract called.
value	uint256	The amount of ETH sent with the call.
data	bytes	The calldata passed to the contract call.
Reverted
Emitted when a contract call is reverted.

event Reverted(address indexed to, address indexed token, uint256 amount, bytes data, RevertContext revertContext);

Parameters

Name	Type	Description
to	address	The address of the contract called.
token	address	The address of the ERC20 token, empty if gas token
amount	uint256	The amount of ETH sent with the call.
data	bytes	The calldata passed to the contract call.
revertContext	RevertContext	Revert context to pass to onRevert.
ExecutedWithERC20
Emitted when a contract call with ERC20 tokens is executed.

event ExecutedWithERC20(address indexed token, address indexed to, uint256 amount, bytes data);

Parameters

Name	Type	Description
token	address	The address of the ERC20 token.
to	address	The address of the contract called.
amount	uint256	The amount of tokens transferred.
data	bytes	The calldata passed to the contract call.
Deposited
Emitted when a deposit is made.

event Deposited(
    address indexed sender,
    address indexed receiver,
    uint256 amount,
    address asset,
    bytes payload,
    RevertOptions revertOptions
);


Parameters

Name	Type	Description
sender	address	The address of the sender.
receiver	address	The address of the receiver.
amount	uint256	The amount of ETH or tokens deposited.
asset	address	The address of the ERC20 token (zero address if ETH).
payload	bytes	The calldata passed with the deposit. No longer used. Kept to maintain compatibility.
revertOptions	RevertOptions	Revert options.
DepositedAndCalled
Emitted when a deposit and call is made.

event DepositedAndCalled(
    address indexed sender,
    address indexed receiver,
    uint256 amount,
    address asset,
    bytes payload,
    RevertOptions revertOptions
);


Parameters

Name	Type	Description
sender	address	The address of the sender.
receiver	address	The address of the receiver.
amount	uint256	The amount of ETH or tokens deposited.
asset	address	The address of the ERC20 token (zero address if ETH).
payload	bytes	The calldata passed with the deposit.
revertOptions	RevertOptions	Revert options.
Called
Emitted when an omnichain smart contract call is made without asset transfer.

event Called(address indexed sender, address indexed receiver, bytes payload, RevertOptions revertOptions);

Parameters

Name	Type	Description
sender	address	The address of the sender.
receiver	address	The address of the receiver.
payload	bytes	The calldata passed to the call.
revertOptions	RevertOptions	Revert options.
UpdatedGatewayTSSAddress
Emitted when tss address is updated

event UpdatedGatewayTSSAddress(address oldTSSAddress, address newTSSAddress);

Parameters

Name	Type	Description
oldTSSAddress	address	old tss address
newTSSAddress	address	new tss address
MessageContext
Git Source

Message context passed to execute function.

struct MessageContext {
    address sender;
}


Properties

Name	Type	Description
sender	address	Sender from omnichain contract.
IRegistry
Git Source

Structs
ChainMetadataEntry
Structure for metadata entries used during bootstrapping

struct ChainMetadataEntry {
    uint256 chainId;
    string key;
    bytes value;
}


ContractConfigEntry
Structure for contract configuration entries used during bootstrapping

struct ContractConfigEntry {
    uint256 chainId;
    string contractType;
    string key;
    bytes value;
}


IZetaConnectorEvents
Git Source

Interface for the events emitted by the ZetaConnector contracts.

Events
Withdrawn
Emitted when tokens are withdrawn.

event Withdrawn(address indexed to, uint256 amount);

Parameters

Name	Type	Description
to	address	The address to which the tokens are withdrawn.
amount	uint256	The amount of tokens withdrawn.
WithdrawnAndCalled
Emitted when tokens are withdrawn and a contract is called.

event WithdrawnAndCalled(address indexed to, uint256 amount, bytes data);

Parameters

Name	Type	Description
to	address	The address to which the tokens are withdrawn.
amount	uint256	The amount of tokens withdrawn.
data	bytes	The calldata passed to the contract call.
WithdrawnAndReverted
Emitted when tokens are withdrawn and a contract is called with a revert callback.

event WithdrawnAndReverted(address indexed to, uint256 amount, bytes data, RevertContext revertContext);

Parameters

Name	Type	Description
to	address	The address to which the tokens are withdrawn.
amount	uint256	The amount of tokens withdrawn.
data	bytes	The calldata passed to the contract call.
revertContext	RevertContext	Revert context to pass to onRevert.
UpdatedZetaConnectorTSSAddress
Emitted when tss address is updated

event UpdatedZetaConnectorTSSAddress(address oldTSSAddress, address newTSSAddress);

Parameters

Name	Type	Description
oldTSSAddress	address	old tss address
newTSSAddress	address	new tss address
IZetaNonEthNew
Git Source

IZetaNonEthNew is a mintable / burnable version of IERC20.

Functions
burnFrom
Burns the specified amount of tokens from the specified account.

Emits a {Transfer} event with to set to the zero address.

function burnFrom(address account, uint256 amount) external;

Parameters

Name	Type	Description
account	address	The address of the account from which tokens will be burned.
amount	uint256	The amount of tokens to burn.
mint
Mints the specified amount of tokens to the specified account.

Emits a {Transfer} event with from set to the zero address.

function mint(address mintee, uint256 value, bytes32 internalSendHash) external;

Parameters

Name	Type	Description
mintee	address	The address of the account to which tokens will be minted.
value	uint256	The amount of tokens to mint.
internalSendHash	bytes32	A hash used for internal tracking of the minting transaction.
ConnectorErrors
Git Source

Interface with connector custom errors

Errors
CallerIsNotPauser
error CallerIsNotPauser(address caller);

CallerIsNotTss
error CallerIsNotTss(address caller);

CallerIsNotTssUpdater
error CallerIsNotTssUpdater(address caller);

CallerIsNotTssOrUpdater
error CallerIsNotTssOrUpdater(address caller);

ZetaTransferError
error ZetaTransferError();

ExceedsMaxSupply
error ExceedsMaxSupply(uint256 maxSupply);

IZetaNonEthInterface
Git Source

IZetaNonEthInterface.sol is a mintable / burnable version of IERC20

Functions
burnFrom
function burnFrom(address account, uint256 amount) external;

mint
function mint(address mintee, uint256 value, bytes32 internalSendHash) external;

ZetaConnectorBase
Git Source

Main abstraction of ZetaConnector. This contract manages interactions between TSS and different chains. There's an instance of this contract on each chain supported by ZetaChain.

State Variables
zetaToken
address public immutable zetaToken;

pauserAddress
Multisig contract to pause incoming transactions. The responsibility of pausing outgoing transactions is left to the protocol for more flexibility.

address public pauserAddress;

tssAddress
Collectively held by ZetaChain validators.

address public tssAddress;

tssAddressUpdater
This address will start pointing to a multisig contract, then it will become the TSS address itself.

address public tssAddressUpdater;

Functions
constructor
Constructor requires initial addresses. zetaToken address is the only immutable one, while others can be updated.

constructor(address zetaToken_, address tssAddress_, address tssAddressUpdater_, address pauserAddress_);

onlyPauser
Modifier to restrict actions to pauser address.

modifier onlyPauser();

onlyTssAddress
Modifier to restrict actions to TSS address.

modifier onlyTssAddress();

onlyTssUpdater
Modifier to restrict actions to TSS updater address.

modifier onlyTssUpdater();

updatePauserAddress
Update the pauser address. The only address allowed to do that is the current pauser.

function updatePauserAddress(address pauserAddress_) external onlyPauser;

updateTssAddress
Update the TSS address. The address can be updated by the TSS updater or the TSS address itself.

function updateTssAddress(address tssAddress_) external;

renounceTssAddressUpdater
Changes the ownership of tssAddressUpdater to be the one held by the ZetaChain TSS Signer nodes.

function renounceTssAddressUpdater() external onlyTssUpdater;

pause
Pause the input (send) transactions.

function pause() external onlyPauser;

unpause
Unpause the contract to allow transactions again.

function unpause() external onlyPauser;

send
Entrypoint to send data and value through ZetaChain.

function send(ZetaInterfaces.SendInput calldata input) external virtual;

onReceive
Handler to receive data from other chain. This method can be called only by TSS. Access validation is in implementation.

function onReceive(
    bytes calldata zetaTxSenderAddress,
    uint256 sourceChainId,
    address destinationAddress,
    uint256 zetaValue,
    bytes calldata message,
    bytes32 internalSendHash
)
    external
    virtual;


onRevert
Handler to receive errors from other chain. This method can be called only by TSS. Access validation is in implementation.

function onRevert(
    address zetaTxSenderAddress,
    uint256 sourceChainId,
    bytes calldata destinationAddress,
    uint256 destinationChainId,
    uint256 remainingZetaValue,
    bytes calldata message,
    bytes32 internalSendHash
)
    external
    virtual;


Events
ZetaSent
event ZetaSent(
    address sourceTxOriginAddress,
    address indexed zetaTxSenderAddress,
    uint256 indexed destinationChainId,
    bytes destinationAddress,
    uint256 zetaValueAndGas,
    uint256 destinationGasLimit,
    bytes message,
    bytes zetaParams
);


ZetaReceived
event ZetaReceived(
    bytes zetaTxSenderAddress,
    uint256 indexed sourceChainId,
    address indexed destinationAddress,
    uint256 zetaValue,
    bytes message,
    bytes32 indexed internalSendHash
);


ZetaReverted
event ZetaReverted(
    address zetaTxSenderAddress,
    uint256 sourceChainId,
    uint256 indexed destinationChainId,
    bytes destinationAddress,
    uint256 remainingZetaValue,
    bytes message,
    bytes32 indexed internalSendHash
);


TSSAddressUpdated
event TSSAddressUpdated(address callerAddress, address newTssAddress);

TSSAddressUpdaterUpdated
event TSSAddressUpdaterUpdated(address callerAddress, address newTssUpdaterAddress);

PauserAddressUpdated
event PauserAddressUpdated(address callerAddress, address newTssAddress);

ZetaConnectorEth
Git Source

ETH implementation of ZetaConnector. This contract manages interactions between TSS and different chains. This version is only for Ethereum network because in the other chains we mint and burn and in this one we lock and unlock.

Functions
constructor
constructor(
    address zetaToken_,
    address tssAddress_,
    address tssAddressUpdater_,
    address pauserAddress_
)
    ZetaConnectorBase(zetaToken_, tssAddress_, tssAddressUpdater_, pauserAddress_);


getLockedAmount
function getLockedAmount() external view returns (uint256);

send
Entrypoint to send data through ZetaChain This call locks the token on the contract and emits an event with all the data needed by the protocol.

function send(ZetaInterfaces.SendInput calldata input) external override whenNotPaused;

onReceive
Handler to receive data from other chain. This method can be called only by TSS. Transfers the Zeta tokens to destination and calls onZetaMessage if it's needed.

function onReceive(
    bytes calldata zetaTxSenderAddress,
    uint256 sourceChainId,
    address destinationAddress,
    uint256 zetaValue,
    bytes calldata message,
    bytes32 internalSendHash
)
    external
    override
    onlyTssAddress;


onRevert
Handler to receive errors from other chain. This method can be called only by TSS. Transfers the Zeta tokens to destination and calls onZetaRevert if it's needed.

function onRevert(
    address zetaTxSenderAddress,
    uint256 sourceChainId,
    bytes calldata destinationAddress,
    uint256 destinationChainId,
    uint256 remainingZetaValue,
    bytes calldata message,
    bytes32 internalSendHash
)
    external
    override
    whenNotPaused
    onlyTssAddress;


ZetaConnectorNonEth
Git Source

Non ETH implementation of ZetaConnector. This contract manages interactions between TSS and different chains. This version is for every chain but Etherum network because in the other chains we mint and burn and in Etherum we lock and unlock

State Variables
maxSupply
uint256 public maxSupply = 2 ** 256 - 1;

Functions
constructor
constructor(
    address zetaTokenAddress_,
    address tssAddress_,
    address tssAddressUpdater_,
    address pauserAddress_
)
    ZetaConnectorBase(zetaTokenAddress_, tssAddress_, tssAddressUpdater_, pauserAddress_);


getLockedAmount
function getLockedAmount() external view returns (uint256);

setMaxSupply
function setMaxSupply(uint256 maxSupply_) external onlyTssAddress;

send
Entry point to send data to protocol This call burn the token and emit an event with all the data needed by the protocol

function send(ZetaInterfaces.SendInput calldata input) external override whenNotPaused;

onReceive
Handler to receive data from other chain. This method can be called only by TSS. Transfer the Zeta tokens to destination and calls onZetaMessage if it's needed. To perform the transfer mint new tokens, validating first the maxSupply allowed in the current chain.

function onReceive(
    bytes calldata zetaTxSenderAddress,
    uint256 sourceChainId,
    address destinationAddress,
    uint256 zetaValue,
    bytes calldata message,
    bytes32 internalSendHash
)
    external
    override
    onlyTssAddress;


onRevert
Handler to receive errors from other chain. This method can be called only by TSS. Transfer the Zeta tokens to destination and calls onZetaRevert if it's needed. To perform the transfer mint new tokens, validating first the maxSupply allowed in the current chain.

function onRevert(
    address zetaTxSenderAddress,
    uint256 sourceChainId,
    bytes calldata destinationAddress,
    uint256 destinationChainId,
    uint256 remainingZetaValue,
    bytes calldata message,
    bytes32 internalSendHash
)
    external
    override
    whenNotPaused
    onlyTssAddress;


Events
MaxSupplyUpdated
event MaxSupplyUpdated(address callerAddress, uint256 newMaxSupply);

ZetaErrors
Git Source

Common custom errors

Errors
CallerIsNotTss
error CallerIsNotTss(address caller);

CallerIsNotConnector
error CallerIsNotConnector(address caller);

CallerIsNotTssUpdater
error CallerIsNotTssUpdater(address caller);

CallerIsNotTssOrUpdater
error CallerIsNotTssOrUpdater(address caller);

InvalidAddress
error InvalidAddress();

ZetaTransferError
error ZetaTransferError();

ZetaEth
Git Source

Ethereum is the origin and native chain of the ZETA token deployment (native)

ZetaEth.sol is an implementation of OpenZeppelin's ERC20

Functions
constructor
constructor(address creator, uint256 initialSupply);

ZetaCommonErrors
Git Source

Errors
InvalidAddress
error InvalidAddress();

ZetaConnector
Git Source

Functions
send
Sending value and data cross-chain is as easy as calling connector.send(SendInput)

function send(ZetaInterfaces.SendInput calldata input) external;

ZetaInterfaces
Git Source

Structs
SendInput
Use SendInput to interact with the Connector: connector.send(SendInput)

struct SendInput {
    uint256 destinationChainId;
    bytes destinationAddress;
    uint256 destinationGasLimit;
    bytes message;
    uint256 zetaValueAndGas;
    bytes zetaParams;
}


ZetaMessage
Our Connector calls onZetaMessage with this struct as argument

struct ZetaMessage {
    bytes zetaTxSenderAddress;
    uint256 sourceChainId;
    address destinationAddress;
    uint256 zetaValue;
    bytes message;
}


ZetaRevert
Our Connector calls onZetaRevert with this struct as argument

struct ZetaRevert {
    address zetaTxSenderAddress;
    uint256 sourceChainId;
    bytes destinationAddress;
    uint256 destinationChainId;
    uint256 remainingZetaValue;
    bytes message;
}


ZetaReceiver
Git Source

Functions
onZetaMessage
onZetaMessage is called when a cross-chain message reaches a contract

function onZetaMessage(ZetaInterfaces.ZetaMessage calldata zetaMessage) external;

onZetaRevert
onZetaRevert is called when a cross-chain message reverts. It's useful to rollback to the original state

function onZetaRevert(ZetaInterfaces.ZetaRevert calldata zetaRevert) external;

ZetaTokenConsumer
Git Source

*ZetaTokenConsumer makes it easier to handle the following situations:

Getting Zeta using native coin (to pay for destination gas while using connector.send)
Getting Zeta using a token (to pay for destination gas while using connector.send)
Getting native coin using Zeta (to return unused destination gas when onZetaRevert is executed)
Getting a token using Zeta (to return unused destination gas when onZetaRevert is executed)*
The interface can be implemented using different strategies, like UniswapV2, UniswapV3, etc

Functions
getZetaFromEth
function getZetaFromEth(address destinationAddress, uint256 minAmountOut) external payable returns (uint256);

getZetaFromToken
function getZetaFromToken(
    address destinationAddress,
    uint256 minAmountOut,
    address inputToken,
    uint256 inputTokenAmount
)
    external
    returns (uint256);


getEthFromZeta
function getEthFromZeta(
    address destinationAddress,
    uint256 minAmountOut,
    uint256 zetaTokenAmount
)
    external
    returns (uint256);


getTokenFromZeta
function getTokenFromZeta(
    address destinationAddress,
    uint256 minAmountOut,
    address outputToken,
    uint256 zetaTokenAmount
)
    external
    returns (uint256);


hasZetaLiquidity
function hasZetaLiquidity() external view returns (bool);

Events
EthExchangedForZeta
event EthExchangedForZeta(uint256 amountIn, uint256 amountOut);

TokenExchangedForZeta
event TokenExchangedForZeta(address token, uint256 amountIn, uint256 amountOut);

ZetaExchangedForEth
event ZetaExchangedForEth(uint256 amountIn, uint256 amountOut);

ZetaExchangedForToken
event ZetaExchangedForToken(address token, uint256 amountIn, uint256 amountOut);

ZetaNonEth
Git Source

On non-native (non-Ethereum) chains, ZETA tokens are minted and burned after the initial deployment on Ethereum.

State Variables
connectorAddress
address public connectorAddress;

tssAddress
Collectively held by Zeta blockchain validators

address public tssAddress;

tssAddressUpdater
Initially a multi-sig, eventually held by Zeta blockchain validators (via renounceTssAddressUpdater)

address public tssAddressUpdater;

Functions
constructor
constructor(address tssAddress_, address tssAddressUpdater_) ERC20("Zeta", "ZETA");

updateTssAndConnectorAddresses
function updateTssAndConnectorAddresses(address tssAddress_, address connectorAddress_) external;

renounceTssAddressUpdater
Sets tssAddressUpdater to be tssAddress

function renounceTssAddressUpdater() external;

mint
function mint(address mintee, uint256 value, bytes32 internalSendHash) external override;

burnFrom
Only Connector can mint. Minting requires burning the equivalent amount on another chain

function burnFrom(address account, uint256 amount) public override(IZetaNonEthInterface, ERC20Burnable);

Events
Minted
event Minted(address indexed mintee, uint256 amount, bytes32 indexed internalSendHash);

Burnt
event Burnt(address indexed burnee, uint256 amount);

TSSAddressUpdated
event TSSAddressUpdated(address callerAddress, address newTssAddress);

TSSAddressUpdaterUpdated
event TSSAddressUpdaterUpdated(address callerAddress, address newTssUpdaterAddress);

ConnectorAddressUpdated
event ConnectorAddressUpdated(address callerAddress, address newConnectorAddress);

Registry
Git Source

Satellite registry contract for connected chains, receiving updates from CoreRegistry.

This contract is deployed on every connected chain and maintains a synchronized view of the registry.

State Variables
GATEWAY_ROLE
Identifier for the gateway role

bytes32 public constant GATEWAY_ROLE = keccak256("GATEWAY_ROLE");

gatewayEVM
GatewayEVM contract that will call this contract with messages from CoreRegistry

IGatewayEVM public gatewayEVM;

coreRegistry
Represents the address of the CoreRegistry contract on the ZetaChain

address public coreRegistry;

Functions
onlyRegistry
Restricts function calls to only be made by this contract itself

Only registry address allowed modifier.

This is used to ensure functions receiving cross-chain messages can only be called through the onCall function using a self-call pattern, preventing direct external calls to these functions

modifier onlyRegistry();

initialize
Initialize the Registry contract

function initialize(
    address admin_,
    address registryManager_,
    address gatewayEVM_,
    address coreRegistry_
)
    public
    initializer;


Parameters

Name	Type	Description
admin_	address	Address with DEFAULT_ADMIN_ROLE, authorized for upgrades and pausing actions
registryManager_	address	Address with REGISTRY_MANAGER_ROLE, authorized for all registry write actions.
gatewayEVM_	address	Address of the GatewayEVM contract for cross-chain messaging
coreRegistry_	address	Address of the CoreRegistry contract deployed on ZetaChain
onCall
onCall is called by the GatewayEVM when a cross-chain message is received

function onCall(
    MessageContext calldata context,
    bytes calldata data
)
    external
    onlyRole(GATEWAY_ROLE)
    whenNotPaused
    returns (bytes memory);


Parameters

Name	Type	Description
context	MessageContext	Information about the cross-chain message
data	bytes	The encoded function call to execute
changeChainStatus
Changes status of the chain to activated/deactivated

Only callable through onCall from CoreRegistry

function changeChainStatus(
    uint256 chainId,
    address gasZRC20,
    bytes calldata registry,
    bool activation
)
    external
    onlyRegistry
    whenNotPaused;


Parameters

Name	Type	Description
chainId	uint256	The ID of the chain being activated/deactivated.
gasZRC20	address	The address of the ZRC20 token that represents gas token for the chain.
registry	bytes	Address of the Registry contract on the connected chain.
activation	bool	Whether activate or deactivate the chain
updateChainMetadata
Updates chain metadata, only for the active chains

Only callable through onCall from CoreRegistry

function updateChainMetadata(
    uint256 chainId,
    string calldata key,
    bytes calldata value
)
    external
    onlyRegistry
    whenNotPaused;


Parameters

Name	Type	Description
chainId	uint256	The ID of the chain
key	string	The metadata key to update
value	bytes	The new value for the metadata
registerContract
Registers a new contract address for a specific chain

Only callable through onCall from CoreRegistry

function registerContract(
    uint256 chainId,
    string calldata contractType,
    bytes calldata addressBytes
)
    external
    onlyRegistry
    whenNotPaused;


Parameters

Name	Type	Description
chainId	uint256	The ID of the chain where the contract is deployed
contractType	string	The type of the contract (e.g., "connector", "gateway")
addressBytes	bytes	The address of the contract
updateContractConfiguration
Updates contract configuration

Only callable through onCall from CoreRegistry

function updateContractConfiguration(
    uint256 chainId,
    string calldata contractType,
    string calldata key,
    bytes calldata value
)
    external
    onlyRegistry
    whenNotPaused;


Parameters

Name	Type	Description
chainId	uint256	The ID of the chain where the contract is deployed
contractType	string	The type of the contract
key	string	The configuration key to update
value	bytes	The new value for the configuration
setContractActive
Sets a contract's active status

Only callable through onCall from CoreRegistry

function setContractActive(uint256 chainId, string calldata contractType, bool active) external onlyRegistry;

Parameters

Name	Type	Description
chainId	uint256	The ID of the chain where the contract is deployed
contractType	string	The type of the contract
active	bool	Whether the contract should be active
registerZRC20Token
Registers a new ZRC20 token in the registry

Only callable through onCall from CoreRegistry

function registerZRC20Token(
    address address_,
    string calldata symbol,
    uint256 originChainId,
    bytes calldata originAddress,
    string calldata coinType,
    uint8 decimals
)
    external
    onlyRegistry
    whenNotPaused;


Parameters

Name	Type	Description
address_	address	The address of the ZRC20 token on ZetaChain
symbol	string	The symbol of the token
originChainId	uint256	The ID of the foreign chain where the original asset exists
originAddress	bytes	The address or identifier of the asset on its native chain
coinType	string	The type of the original coin
decimals	uint8	The number of decimals the token uses
setZRC20TokenActive
Updates ZRC20 token active status

Only callable through onCall from CoreRegistry

function setZRC20TokenActive(address address_, bool active) external onlyRegistry whenNotPaused;

Parameters

Name	Type	Description
address_	address	The address of the ZRC20 token
active	bool	Whether the token should be active
bootstrapChains
Bootstrap the registry with chain data

This function can only be called by an address with the REGISTRY_MANAGER_ROLE.

function bootstrapChains(
    ChainInfoDTO[] calldata chains,
    ChainMetadataEntry[] calldata metadataEntries
)
    external
    onlyRole(REGISTRY_MANAGER_ROLE)
    whenNotPaused;


Parameters

Name	Type	Description
chains	ChainInfoDTO[]	Array of chain data structures to bootstrap
metadataEntries	ChainMetadataEntry[]	Array of chain metadata entries
bootstrapContracts
Bootstrap the registry with contract data

This function can only be called by an address with the REGISTRY_MANAGER_ROLE.

function bootstrapContracts(
    ContractInfoDTO[] calldata contracts,
    ContractConfigEntry[] calldata configEntries
)
    external
    onlyRole(REGISTRY_MANAGER_ROLE)
    whenNotPaused;


Parameters

Name	Type	Description
contracts	ContractInfoDTO[]	Array of contract data structures to bootstrap
configEntries	ContractConfigEntry[]	Array of contract configuration entries
bootstrapZRC20Tokens
Bootstrap the registry with ZRC20 token data

This function can only be called by an address with the REGISTRY_MANAGER_ROLE.

function bootstrapZRC20Tokens(ZRC20Info[] calldata tokens) external onlyRole(REGISTRY_MANAGER_ROLE) whenNotPaused;

Parameters

Name	Type	Description
tokens	ZRC20Info[]	Array of ZRC20 token data structures to bootstrap
ZetaConnectorBase
Git Source

Abstract base contract for ZetaConnector.

This contract implements basic functionality for handling tokens and interacting with the Gateway contract.

State Variables
gateway
The Gateway contract used for executing cross-chain calls.

IGatewayEVM public gateway;

zetaToken
The address of the Zeta token.

address public zetaToken;

tssAddress
The address of the TSS (Threshold Signature Scheme) contract.

address public tssAddress;

WITHDRAWER_ROLE
New role identifier for withdrawer role.

bytes32 public constant WITHDRAWER_ROLE = keccak256("WITHDRAWER_ROLE");

PAUSER_ROLE
New role identifier for pauser role.

bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

TSS_ROLE
New role identifier for tss role.

bytes32 public constant TSS_ROLE = keccak256("TSS_ROLE");

Functions
constructor
Note: oz-upgrades-unsafe-allow: constructor

constructor();

initialize
Initializer for ZetaConnectors.

Set admin as default admin and pauser, and tssAddress as tss role.

function initialize(
    address gateway_,
    address zetaToken_,
    address tssAddress_,
    address admin_
)
    public
    virtual
    onlyInitializing;


_authorizeUpgrade
Authorizes the upgrade of the contract, sender must be owner.

function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE);

Parameters

Name	Type	Description
newImplementation	address	Address of the new implementation.
updateTSSAddress
Update tss address

function updateTSSAddress(address newTSSAddress) external onlyRole(DEFAULT_ADMIN_ROLE);

Parameters

Name	Type	Description
newTSSAddress	address	new tss address
pause
Pause contract.

function pause() external onlyRole(PAUSER_ROLE);

unpause
Unpause contract.

function unpause() external onlyRole(PAUSER_ROLE);

deposit
Handle received tokens.

function deposit(uint256 amount) external virtual;

Parameters

Name	Type	Description
amount	uint256	The amount of tokens received.
Errors
ZeroAddress
Error indicating that a zero address was provided.

error ZeroAddress();

ZetaConnectorNative
Git Source

Implementation of ZetaConnectorBase for native token handling.

This contract directly transfers Zeta tokens and interacts with the Gateway contract.

Functions
initialize
Initializer for ZetaConnectorNative.

function initialize(
    address gateway_,
    address zetaToken_,
    address tssAddress_,
    address admin_
)
    public
    override
    initializer;


withdraw
Withdraw tokens to a specified address.

This function can only be called by the TSS address.

function withdraw(address to, uint256 amount) external nonReentrant onlyRole(WITHDRAWER_ROLE) whenNotPaused;

Parameters

Name	Type	Description
to	address	The address to withdraw tokens to.
amount	uint256	The amount of tokens to withdraw.
withdrawAndCall
Withdraw tokens and call a contract through Gateway.

This function can only be called by the TSS address.

function withdrawAndCall(
    MessageContext calldata messageContext,
    address to,
    uint256 amount,
    bytes calldata data
)
    external
    nonReentrant
    onlyRole(WITHDRAWER_ROLE)
    whenNotPaused;


Parameters

Name	Type	Description
messageContext	MessageContext	Message context containing sender.
to	address	The address to withdraw tokens to.
amount	uint256	The amount of tokens to withdraw.
data	bytes	The calldata to pass to the contract call.
withdrawAndRevert
Withdraw tokens and call a contract with a revert callback through Gateway.

This function can only be called by the TSS address.

function withdrawAndRevert(
    address to,
    uint256 amount,
    bytes calldata data,
    RevertContext calldata revertContext
)
    external
    nonReentrant
    onlyRole(WITHDRAWER_ROLE)
    whenNotPaused;


Parameters

Name	Type	Description
to	address	The address to withdraw tokens to.
amount	uint256	The amount of tokens to withdraw.
data	bytes	The calldata to pass to the contract call.
revertContext	RevertContext	Revert context to pass to onRevert.
deposit
Handle received tokens.

function deposit(uint256 amount) external override whenNotPaused;

Parameters

Name	Type	Description
amount	uint256	The amount of tokens received.
ZetaConnectorNonNative
Git Source

Implementation of ZetaConnectorBase for non-native token handling.

This contract mints and burns Zeta tokens and interacts with the Gateway contract.

State Variables
maxSupply
Max supply for minting.

uint256 public maxSupply;

Functions
initialize
Initializer for ZetaConnectorNonNative.

function initialize(
    address gateway_,
    address zetaToken_,
    address tssAddress_,
    address admin_
)
    public
    override
    initializer;


setMaxSupply
Set max supply for minting.

This function can only be called by the TSS address.

function setMaxSupply(uint256 maxSupply_) external onlyRole(TSS_ROLE) whenNotPaused;

Parameters

Name	Type	Description
maxSupply_	uint256	New max supply.
withdraw
Withdraw tokens to a specified address.

This function can only be called by the TSS address.

function withdraw(
    address to,
    uint256 amount,
    bytes32 internalSendHash
)
    external
    nonReentrant
    onlyRole(WITHDRAWER_ROLE)
    whenNotPaused;


Parameters

Name	Type	Description
to	address	The address to withdraw tokens to.
amount	uint256	The amount of tokens to withdraw.
internalSendHash	bytes32	A hash used for internal tracking of the transaction.
withdrawAndCall
Withdraw tokens and call a contract through Gateway.

This function can only be called by the TSS address, and mints if supply is not reached.

function withdrawAndCall(
    MessageContext calldata messageContext,
    address to,
    uint256 amount,
    bytes calldata data,
    bytes32 internalSendHash
)
    external
    nonReentrant
    onlyRole(WITHDRAWER_ROLE)
    whenNotPaused;


Parameters

Name	Type	Description
messageContext	MessageContext	Message context containing sender.
to	address	The address to withdraw tokens to.
amount	uint256	The amount of tokens to withdraw.
data	bytes	The calldata to pass to the contract call.
internalSendHash	bytes32	A hash used for internal tracking of the transaction.
withdrawAndRevert
Withdraw tokens and call a contract with a revert callback through Gateway.

This function can only be called by the TSS address, and mints if supply is not reached.

function withdrawAndRevert(
    address to,
    uint256 amount,
    bytes calldata data,
    bytes32 internalSendHash,
    RevertContext calldata revertContext
)
    external
    nonReentrant
    onlyRole(WITHDRAWER_ROLE)
    whenNotPaused;


Parameters

Name	Type	Description
to	address	The address to withdraw tokens to.
amount	uint256	The amount of tokens to withdraw.
data	bytes	The calldata to pass to the contract call.
internalSendHash	bytes32	A hash used for internal tracking of the transaction.
revertContext	RevertContext	Revert context to pass to onRevert.
deposit
Handle received tokens and burn them.

function deposit(uint256 amount) external override whenNotPaused;

Parameters

Name	Type	Description
amount	uint256	The amount of tokens received.
_mintTo
mints to provided account and checks if totalSupply will be exceeded

function _mintTo(address to, uint256 amount, bytes32 internalSendHash) private;

Events
MaxSupplyUpdated
Event triggered when max supply is updated.

event MaxSupplyUpdated(uint256 maxSupply);

Parameters

Name	Type	Description
maxSupply	uint256	New max supply.
Errors
ExceedsMaxSupply
error ExceedsMaxSupply();

BaseRegistry
Git Source

State Variables
PAUSER_ROLE
New role identifier for pauser role.

bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

REGISTRY_MANAGER_ROLE
New role identifier for registry manager role.

bytes32 public constant REGISTRY_MANAGER_ROLE = keccak256("REGISTRY_MANAGER_ROLE");

admin
Address with DEFAULT_ADMIN_ROLE, authorized for upgrades and pausing actions.

address public admin;

registryManager
Address with REGISTRY_MANAGER_ROLE, authorized for all registry write actions.

address public registryManager;

_activeChains
Active chains in the registry.

uint256[] internal _activeChains;

_allChains
Array of all chain IDs in the registry (active and inactive).

uint256[] internal _allChains;

_allContracts
Array to store all contracts as chainId and contractType pairs.

ContractIdentifier[] internal _allContracts;

_allZRC20Addresses
Array of all ZRC20 token addresses.

address[] internal _allZRC20Addresses;

_chains
Maps chain IDs to their information.

mapping(uint256 => ChainInfo) internal _chains;

_contracts
Maps chain ID -> contract type -> ContractInfo

mapping(uint256 => mapping(string => ContractInfo)) internal _contracts;

_zrc20Tokens
Maps ZRC20 token address to their information

mapping(address => ZRC20Info) internal _zrc20Tokens;

_zrc20SymbolToAddress
Maps token symbol to ZRC20 address.

mapping(string => address) internal _zrc20SymbolToAddress;

_originAssetToZRC20
Maps origin chain ID and origin address to ZRC20 token address.

mapping(uint256 => mapping(bytes => address)) internal _originAssetToZRC20;

Functions
constructor
Note: oz-upgrades-unsafe-allow: constructor

constructor();

_authorizeUpgrade
Authorizes the upgrade of the contract, sender must be admin.

function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE);

Parameters

Name	Type	Description
newImplementation	address	Address of the new implementation,
pause
Pause contract.

function pause() external onlyRole(PAUSER_ROLE);

unpause
Unpause contract.

function unpause() external onlyRole(DEFAULT_ADMIN_ROLE);

changeAdmin
Changes the admin address and transfers DEFAULT_ADMIN_ROLE and PAUSER_ROLE.

Only callable by current admin.

function changeAdmin(address newAdmin) external onlyRole(DEFAULT_ADMIN_ROLE);

Parameters

Name	Type	Description
newAdmin	address	The address of the new admin.
changeRegistryManager
Changes the registry manager address and transfers REGISTRY_MANAGER_ROLE and PAUSER_ROLE.

Only callable by admin.

function changeRegistryManager(address newRegistryManager) external onlyRole(DEFAULT_ADMIN_ROLE);

Parameters

Name	Type	Description
newRegistryManager	address	The address of the new registry manager.
_changeChainStatus
Changes status of the chain to activated/deactivated.

function _changeChainStatus(uint256 chainId, address gasZRC20, bytes calldata registry, bool activation) internal;

Parameters

Name	Type	Description
chainId	uint256	The ID of the chain to activate.
gasZRC20	address	The address of the ZRC20 token that represents gas token for the chain.
registry	bytes	Address of the Registry contract on the connected chain.
activation	bool	Whether activate or deactivate the chain
_updateChainMetadata
Updates chain metadata, only for the active chains.

function _updateChainMetadata(uint256 chainId, string calldata key, bytes calldata value) internal;

Parameters

Name	Type	Description
chainId	uint256	The ID of the chain.
key	string	The metadata key to update.
value	bytes	The new value for the metadata.
_registerContract
Registers a new contract address for a specific chain.

function _registerContract(uint256 chainId, string calldata contractType, bytes calldata addressBytes) internal;

Parameters

Name	Type	Description
chainId	uint256	The ID of the chain where the contract is deployed.
contractType	string	The type of the contract (e.g., "connector", "gateway").
addressBytes	bytes	The bytes representation of the non-EVM address.
_updateContractConfiguration
Updates contract configuration.

function _updateContractConfiguration(
    uint256 chainId,
    string calldata contractType,
    string calldata key,
    bytes calldata value
)
    internal;


Parameters

Name	Type	Description
chainId	uint256	The ID of the chain where the contract is deployed.
contractType	string	The type of the contract.
key	string	The configuration key to update.
value	bytes	The new value for the configuration.
_setContractActive
Sets a contract's active status

function _setContractActive(uint256 chainId, string calldata contractType, bool active) internal;

Parameters

Name	Type	Description
chainId	uint256	The ID of the chain where the contract is deployed.
contractType	string	The type of the contract.
active	bool	Whether the contract should be active.
_registerZRC20Token
Registers a new ZRC20 token in the registry.

function _registerZRC20Token(
    address address_,
    string calldata symbol,
    uint256 originChainId,
    bytes calldata originAddress,
    string calldata coinType,
    uint8 decimals
)
    internal;


Parameters

Name	Type	Description
address_	address	The address of the ZRC20 token on ZetaChain.
symbol	string	The symbol of the token.
originChainId	uint256	The ID of the foreign chain where the original asset exists.
originAddress	bytes	The address or identifier of the asset on its native chain.
coinType	string	The type of the original coin.
decimals	uint8	The number of decimals the token uses.
_setZRC20TokenActive
Updates ZRC20 token active status.

function _setZRC20TokenActive(address address_, bool active) internal;

getChainInfo
Gets information about a specific chain.

function getChainInfo(uint256 chainId) external view returns (address gasZRC20, bytes memory registry);

Parameters

Name	Type	Description
chainId	uint256	The ID of the chain.
Returns

Name	Type	Description
gasZRC20	address	The address of the ZRC20 token that represents gas token for the chain.
registry	bytes	The registry address deployed on the chain.
getChainMetadata
Gets chain-specific metadata

function getChainMetadata(uint256 chainId, string calldata key) external view returns (bytes memory);

Parameters

Name	Type	Description
chainId	uint256	The ID of the chain
key	string	The metadata key to retrieve
Returns

Name	Type	Description
<none>	bytes	The value of the requested metadata
getContractInfo
Gets information about a specific contract

function getContractInfo(
    uint256 chainId,
    string calldata contractType
)
    external
    view
    returns (bool active, bytes memory addressBytes);


Parameters

Name	Type	Description
chainId	uint256	The ID of the chain where the contract is deployed
contractType	string	The type of the contract
Returns

Name	Type	Description
active	bool	Whether the contract is active
addressBytes	bytes	The address of the contract
getContractConfiguration
Gets contract-specific configuration

function getContractConfiguration(
    uint256 chainId,
    string calldata contractType,
    string calldata key
)
    external
    view
    returns (bytes memory);


Parameters

Name	Type	Description
chainId	uint256	The ID of the chain where the contract is deployed
contractType	string	The type of the contract
key	string	The configuration key to retrieve
Returns

Name	Type	Description
<none>	bytes	The value of the requested configuration
getZRC20TokenInfo
Gets information about a specific ZRC20 token

function getZRC20TokenInfo(address address_)
    external
    view
    returns (
        bool active,
        string memory symbol,
        uint256 originChainId,
        bytes memory originAddress,
        string memory coinType,
        uint8 decimals
    );


Parameters

Name	Type	Description
address_	address	The address of the ZRC20 token
Returns

Name	Type	Description
active	bool	Whether the token is active
symbol	string	The symbol of the token
originChainId	uint256	The ID of the foreign chain where the original asset exists
originAddress	bytes	The address or identifier of the asset on its native chain
coinType	string	The type of the original coin
decimals	uint8	The number of decimals the token uses
getZRC20AddressByForeignAsset
Gets the ZRC20 token address for a specific asset on a foreign chain.

function getZRC20AddressByForeignAsset(
    uint256 originChainId,
    bytes calldata originAddress
)
    external
    view
    returns (address);


Parameters

Name	Type	Description
originChainId	uint256	The ID of the foreign chain
originAddress	bytes	The address or identifier of the asset on its native chain.
Returns

Name	Type	Description
<none>	address	The address of the corresponding ZRC20 token on ZetaChain.
getActiveChains
Gets all active chains in the registry.

function getActiveChains() external view returns (uint256[] memory);

Returns

Name	Type	Description
<none>	uint256[]	Array of chain IDs for all active chains.
getAllChains
Returns information for all chains (active and inactive) in the registry.

function getAllChains() external view returns (ChainInfoDTO[] memory chainsInfo);

Returns

Name	Type	Description
chainsInfo	ChainInfoDTO[]	Array of ChainInfoDTO structs containing information about all chains.
getAllContracts
Returns information for all contracts in the registry.

function getAllContracts() external view returns (ContractInfoDTO[] memory contractsInfo);

Returns

Name	Type	Description
contractsInfo	ContractInfoDTO[]	Array of ContractInfoDTO structs containing information about all contracts.
getAllZRC20Tokens
Returns information for all ZRC20 tokens in the registry.

function getAllZRC20Tokens() external view returns (ZRC20Info[] memory tokensInfo);

Returns

Name	Type	Description
tokensInfo	ZRC20Info[]	Array of ZRC20Info structs containing information about all ZRC20 tokens.
_removeFromActiveChains
Removes a chain ID from the active chains array.

function _removeFromActiveChains(uint256 chainId) private;

Parameters

Name	Type	Description
chainId	uint256	The ID of the chain to remove.
IBaseRegistry
Git Source

Interface for the BaseRegistry contract.

Functions
changeChainStatus
Changes status of the chain to activated/deactivated.

function changeChainStatus(uint256 chainId, address gasZRC20, bytes calldata registry, bool activation) external;

Parameters

Name	Type	Description
chainId	uint256	The ID of the chain to activate.
gasZRC20	address	The address of the ZRC20 token that represents gas token for the chain.
registry	bytes	
activation	bool	Whether activate or deactivate a chain
updateChainMetadata
Updates chain metadata.

function updateChainMetadata(uint256 chainId, string calldata key, bytes calldata value) external;

Parameters

Name	Type	Description
chainId	uint256	The ID of the chain.
key	string	The metadata key to update.
value	bytes	The new value for the metadata.
registerContract
Registers a new contract address for a specific chain.

function registerContract(uint256 chainId, string calldata contractType, bytes calldata addressBytes) external;

Parameters

Name	Type	Description
chainId	uint256	The ID of the chain where the contract is deployed.
contractType	string	The type of the contract (e.g., "connector", "gateway").
addressBytes	bytes	The bytes representation of the non-EVM address.
updateContractConfiguration
Updates contract configuration.

function updateContractConfiguration(
    uint256 chainId,
    string calldata contractType,
    string calldata key,
    bytes calldata value
)
    external;


Parameters

Name	Type	Description
chainId	uint256	The ID of the chain where the contract is deployed.
contractType	string	The type of the contract.
key	string	The configuration key to update.
value	bytes	The new value for the configuration.
setContractActive
function setContractActive(uint256 chainId, string calldata contractType, bool active) external;

registerZRC20Token
Registers a new ZRC20 token in the registry.

function registerZRC20Token(
    address address_,
    string calldata symbol,
    uint256 originChainId,
    bytes calldata originAddress,
    string calldata coinType,
    uint8 decimals
)
    external;


Parameters

Name	Type	Description
address_	address	The address of the ZRC20 token on ZetaChain.
symbol	string	The symbol of the token.
originChainId	uint256	The ID of the foreign chain where the original asset exists.
originAddress	bytes	The address or identifier of the asset on its native chain.
coinType	string	
decimals	uint8	
setZRC20TokenActive
Updates ZRC20 token information.

function setZRC20TokenActive(address address_, bool active) external;

Parameters

Name	Type	Description
address_	address	The address of the ZRC20 token.
active	bool	Whether the token should be active.
getChainInfo
Gets information about a specific chain.

function getChainInfo(uint256 chainId) external view returns (address gasZRC20, bytes memory registry);

Parameters

Name	Type	Description
chainId	uint256	The ID of the chain.
Returns

Name	Type	Description
gasZRC20	address	The address of the ZRC20 token that represents gas token for the chain.
registry	bytes	The registry address deployed on the chain.
getChainMetadata
Gets chain-specific metadata.

function getChainMetadata(uint256 chainId, string calldata key) external view returns (bytes memory);

Parameters

Name	Type	Description
chainId	uint256	The ID of the chain.
key	string	The metadata key to retrieve.
Returns

Name	Type	Description
<none>	bytes	The value of the requested metadata.
getContractInfo
Gets information about a specific contract.

function getContractInfo(
    uint256 chainId,
    string calldata contractType
)
    external
    view
    returns (bool active, bytes memory addressBytes);


Parameters

Name	Type	Description
chainId	uint256	The ID of the chain where the contract is deployed.
contractType	string	The type of the contract.
Returns

Name	Type	Description
active	bool	Whether the contract is active.
addressBytes	bytes	The address of the contract.
getContractConfiguration
Gets contract-specific configuration.

function getContractConfiguration(
    uint256 chainId,
    string calldata contractType,
    string calldata key
)
    external
    view
    returns (bytes memory);


Parameters

Name	Type	Description
chainId	uint256	The ID of the chain where the contract is deployed.
contractType	string	The type of the contract.
key	string	The configuration key to retrieve.
Returns

Name	Type	Description
<none>	bytes	The value of the requested configuration.
getZRC20TokenInfo
Gets information about a specific ZRC20 token.

function getZRC20TokenInfo(address address_)
    external
    view
    returns (
        bool active,
        string memory symbol,
        uint256 originChainId,
        bytes memory originAddress,
        string memory coinType,
        uint8 decimals
    );


Parameters

Name	Type	Description
address_	address	The address of the ZRC20 token.
Returns

Name	Type	Description
active	bool	Whether the token is active.
symbol	string	The symbol of the token
originChainId	uint256	The ID of the foreign chain where the original asset exists.
originAddress	bytes	The address or identifier of the asset on its native chain.
coinType	string	The type of the original coin.
decimals	uint8	The number of decimals the token uses.
getZRC20AddressByForeignAsset
Gets the ZRC20 token address for a specific asset on a foreign chain.

function getZRC20AddressByForeignAsset(
    uint256 originChainId,
    bytes calldata originAddress
)
    external
    view
    returns (address);


Parameters

Name	Type	Description
originChainId	uint256	The ID of the foreign chain.
originAddress	bytes	The address or identifier of the asset on its native chain.
Returns

Name	Type	Description
<none>	address	The address of the corresponding ZRC20 token on ZetaChain.
getActiveChains
Gets all active chains in the registry.

function getActiveChains() external view returns (uint256[] memory);

Returns

Name	Type	Description
<none>	uint256[]	Array of chain IDs for all active chains.
getAllChains
Returns information for all chains (active and inactive) in the registry.

function getAllChains() external view returns (ChainInfoDTO[] memory);

Returns

Name	Type	Description
<none>	ChainInfoDTO[]	chainsInfo Array of ChainInfoDTO structs containing information about all chains.
getAllContracts
Returns information for all contracts in the registry.

function getAllContracts() external view returns (ContractInfoDTO[] memory);

Returns

Name	Type	Description
<none>	ContractInfoDTO[]	contractsInfo Array of ContractInfoDTO structs containing information about all contracts.
getAllZRC20Tokens
Gets all active chains in the registry.

function getAllZRC20Tokens() external view returns (ZRC20Info[] memory);

Returns

Name	Type	Description
<none>	ZRC20Info[]	tokensInfo Array of ZRC20Info structs containing information about all ZRC20 tokens.
IBaseRegistryErrors
Git Source

Interface for the errors used by the BaseRegistry contract.

Errors
ZeroAddress
Error thrown when a zero address is provided where a non-zero address is required.

error ZeroAddress();

InvalidSender
Error thrown when the sender is invalid

error InvalidSender();

TransferFailed
Error thrown when a ZRC20 token transfer failed.

error TransferFailed();

ChainActive
Error thrown when a chain is already active.

error ChainActive(uint256 chainId);

Parameters

Name	Type	Description
chainId	uint256	The ID of the chain that is already active.
ChainNonActive
Error thrown when a chain is not active.

error ChainNonActive(uint256 chainId);

Parameters

Name	Type	Description
chainId	uint256	The ID of the chain that is not active.
InvalidContractType
Error thrown when a contract type is invalid.

error InvalidContractType(string message);

Parameters

Name	Type	Description
message	string	Describes why error happened
ContractAlreadyRegistered
Error thrown when a contract is already registered.

error ContractAlreadyRegistered(uint256 chainId, string contractType, bytes addressBytes);

Parameters

Name	Type	Description
chainId	uint256	The ID of the chain.
contractType	string	The type of the contract.
addressBytes	bytes	The address of the contract.
ContractNotFound
Error thrown when a contract is not found in the registry.

error ContractNotFound(uint256 chainId, string contractType);

Parameters

Name	Type	Description
chainId	uint256	The ID of the chain,
contractType	string	The type of the contract.
ZRC20AlreadyRegistered
Error thrown when a ZRC20 token is already registered.

error ZRC20AlreadyRegistered(address address_);

Parameters

Name	Type	Description
address_	address	The address of the ZRC20 token.
ZRC20SymbolAlreadyInUse
Error thrown when a ZRC20 token symbol is already in use.

error ZRC20SymbolAlreadyInUse(string symbol);

Parameters

Name	Type	Description
symbol	string	The symbol that is already in use.
IBaseRegistryEvents
Git Source

Interface for the events emitted by the BaseRegistry contract.

Events
ChainStatusChanged
Emitted when a chain status has changed.

event ChainStatusChanged(uint256 indexed chainId, bool newStatus);

Parameters

Name	Type	Description
chainId	uint256	The ID of the chain.
newStatus	bool	The new chain status (is active or not).
ChainMetadataUpdated
Emitted when a chain metadata is set.

event ChainMetadataUpdated(uint256 indexed chainId, string key, bytes value);

Parameters

Name	Type	Description
chainId	uint256	The ID of the chain.
key	string	The metadata key to update.
value	bytes	The new value for the metadata.
ContractRegistered
Emitted when a new contract is registered.

event ContractRegistered(uint256 indexed chainId, string indexed contractType, bytes addressBytes);

Parameters

Name	Type	Description
chainId	uint256	The ID of the chain where the contract is deployed.
contractType	string	The type of the contract (e.g. "connector", "gateway", "tss").
addressBytes	bytes	The contract address in bytes representation.
ContractStatusChanged
Emitted when a contract status has changed.

event ContractStatusChanged(bytes addressBytes);

Parameters

Name	Type	Description
addressBytes	bytes	The contract address in bytes representation.
ContractConfigurationUpdated
Emitted when a contract configuration is updated.

event ContractConfigurationUpdated(uint256 indexed chainId, string contractType, string key, bytes value);

Parameters

Name	Type	Description
chainId	uint256	The ID of the chain where the contract is deployed.
contractType	string	The type of the contract.
key	string	The configuration key to update.
value	bytes	The new value for the configuration.
ZRC20TokenRegistered
Emitted when a ZRC20 token is registered.

event ZRC20TokenRegistered(
    bytes indexed originAddress, address indexed address_, uint8 decimals, uint256 originChainId, string symbol
);


Parameters

Name	Type	Description
originAddress	bytes	The address of the asset on its native chain.
address_	address	The address of the ZRC20 token on ZetaChain.
decimals	uint8	The number of decimals the token uses.
originChainId	uint256	The ID of the foreign chain where the original asset exists.
symbol	string	The symbol of the token.
ZRC20TokenUpdated
Emitted when a ZRC20 token is updated.

event ZRC20TokenUpdated(address address_, bool active);

Parameters

Name	Type	Description
address_	address	The address of the ZRC20 token.
active	bool	Whether the token should be active.
AdminChanged
Emitted when admin address is changed.

event AdminChanged(address oldAdmin, address newAdmin);

Parameters

Name	Type	Description
oldAdmin	address	The previous admin address.
newAdmin	address	The new admin address.
RegistryManagerChanged
Emitted when registry manager address is changed.

event RegistryManagerChanged(address oldRegistryManager, address newRegistryManager);

Parameters

Name	Type	Description
oldRegistryManager	address	The previous registry manager address.
newRegistryManager	address	The new registry manager address.
ChainInfo
Git Source

Structure that contains information about a chain.

struct ChainInfo {
    bool active;
    uint256 chainId;
    address gasZRC20;
    bytes registry;
    mapping(string => bytes) metadata;
}


ChainInfoDTO
Git Source

Structure that contains information about a chain, used for data retrieving.

struct ChainInfoDTO {
    bool active;
    uint256 chainId;
    address gasZRC20;
    bytes registry;
}


ContractIdentifier
Git Source

Each entry consists of: chainId (uint256) and contractType (string)

struct ContractIdentifier {
    uint256 chainId;
    string contractType;
}


ContractInfo
Git Source

Structure that contains information about a contract registered in the system.

struct ContractInfo {
    bool active;
    bytes addressBytes;
    string contractType;
    mapping(string => bytes) configuration;
}


ContractInfoDTO
Git Source

Structure that contains information about a contract registered in the system, used for data retrieving.

struct ContractInfoDTO {
    bool active;
    bytes addressBytes;
    string contractType;
    uint256 chainId;
}


ZRC20Info
Git Source

Structure that contains information about a ZRC20 token.

struct ZRC20Info {
    bool active;
    address address_;
    bytes originAddress;
    uint256 originChainId;
    string symbol;
    string coinType;
    uint8 decimals;
}


Constants
Git Source

MAX_REVERT_GAS_LIMIT
uint256 constant MAX_REVERT_GAS_LIMIT = 2_000_000;

RevertGasLimitExceeded
Git Source

Error indicating revert gas limit exceeds maximum allowed

error RevertGasLimitExceeded(uint256 provided, uint256 maximum);

Parameters

Name	Type	Description
provided	uint256	The gas limit provided for revert operation.
maximum	uint256	The maximum allowed gas limit for revert operation.
Abortable
Git Source

Interface for contracts that support abortable calls.

Functions
onAbort
Called when a revertable call is aborted.

function onAbort(AbortContext calldata abortContext) external;

Parameters

Name	Type	Description
abortContext	AbortContext	Abort context to pass to onAbort.
Revertable
Git Source

Interface for contracts that support revertable calls.

Functions
onRevert
Called when a revertable call is made.

function onRevert(RevertContext calldata revertContext) external payable;

Parameters

Name	Type	Description
revertContext	RevertContext	Revert context to pass to onRevert.
AbortContext
Git Source

Struct containing abort context passed to onAbort.

struct AbortContext {
    bytes sender;
    address asset;
    uint256 amount;
    bool outgoing;
    uint256 chainID;
    bytes revertMessage;
}


Properties

Name	Type	Description
sender	bytes	Address of account that initiated smart contract call. bytes is used as the crosschain transaction can be initiated from a non-EVM chain.
asset	address	Address of asset. On a connected chain, it contains the fungible token address or is empty if it's a gas token. On ZetaChain, it contains the address of the ZRC20.
amount	uint256	Amount specified with the transaction.
outgoing	bool	Flag to indicate if the crosschain transaction was outgoing: from ZetaChain to connected chain. if false, the transaction was incoming: from connected chain to ZetaChain.
chainID	uint256	Chain ID of the connected chain.
revertMessage	bytes	Arbitrary data specified in the RevertOptions object when initating the crosschain transaction.
RevertContext
Git Source

Struct containing revert context passed to onRevert.

struct RevertContext {
    address sender;
    address asset;
    uint256 amount;
    bytes revertMessage;
}


Properties

Name	Type	Description
sender	address	Address of account that initiated smart contract call.
asset	address	Address of asset. On a connected chain, it contains the fungible token address or is empty if it's a gas token. On ZetaChain, it contains the address of the ZRC20.
amount	uint256	Amount specified with the transaction.
revertMessage	bytes	Arbitrary data sent back in onRevert.
RevertOptions
Git Source

Struct containing revert options

struct RevertOptions {
    address revertAddress;
    bool callOnRevert;
    address abortAddress;
    bytes revertMessage;
    uint256 onRevertGasLimit;
}


Properties

Name	Type	Description
revertAddress	address	Address to receive revert.
callOnRevert	bool	Flag if onRevert hook should be called.
abortAddress	address	Address to receive funds if aborted.
revertMessage	bytes	Arbitrary data sent back in onRevert.
onRevertGasLimit	uint256	Gas limit for revert tx, unused on GatewayZEVM methods
CoreRegistry
Git Source

Central registry for ZetaChain, managing chain info, ZRC20 data, and contract addresses across all chains.

The contract doesn't hold any funds and should never have active allowances.

State Variables
CROSS_CHAIN_GAS_LIMIT
Cross-chain message gas limit

uint256 public constant CROSS_CHAIN_GAS_LIMIT = 500_000;

gatewayZEVM
Instance of the GatewayZEVM contract for cross-chain communication

IGatewayZEVM public gatewayZEVM;

Functions
initialize
Initialize the CoreRegistry contract.

function initialize(address admin_, address registryManager_, address gatewayZEVM_) public initializer;

Parameters

Name	Type	Description
admin_	address	Address with DEFAULT_ADMIN_ROLE, authorized for upgrades and pausing actions.
registryManager_	address	Address with REGISTRY_MANAGER_ROLE, authorized for all registry write actions.
gatewayZEVM_	address	Address of the GatewayZEVM contract for cross-chain messaging
changeChainStatus
Changes status of the chain to activated/deactivated.

function changeChainStatus(
    uint256 chainId,
    address gasZRC20,
    bytes calldata registry,
    bool activation
)
    external
    onlyRole(REGISTRY_MANAGER_ROLE)
    whenNotPaused;


Parameters

Name	Type	Description
chainId	uint256	The ID of the chain to activate.
gasZRC20	address	The address of the ZRC20 token that represents gas token for the chain.
registry	bytes	Address of the Registry contract on the connected chain.
activation	bool	Whether activate or deactivate the chain
updateChainMetadata
Updates chain metadata, only for the active chains.

function updateChainMetadata(
    uint256 chainId,
    string calldata key,
    bytes calldata value
)
    external
    onlyRole(REGISTRY_MANAGER_ROLE)
    whenNotPaused;


Parameters

Name	Type	Description
chainId	uint256	The ID of the chain.
key	string	The metadata key to update.
value	bytes	The new value for the metadata.
registerContract
Registers a new contract address for a specific chain.

function registerContract(
    uint256 chainId,
    string calldata contractType,
    bytes calldata addressBytes
)
    external
    onlyRole(REGISTRY_MANAGER_ROLE)
    whenNotPaused;


Parameters

Name	Type	Description
chainId	uint256	The ID of the chain where the contract is deployed.
contractType	string	The type of the contract (e.g., "connector", "gateway").
addressBytes	bytes	The bytes representation of the non-EVM address.
updateContractConfiguration
Updates contract configuration.

function updateContractConfiguration(
    uint256 chainId,
    string calldata contractType,
    string calldata key,
    bytes calldata value
)
    external
    onlyRole(REGISTRY_MANAGER_ROLE)
    whenNotPaused;


Parameters

Name	Type	Description
chainId	uint256	The ID of the chain where the contract is deployed.
contractType	string	The type of the contract.
key	string	The configuration key to update.
value	bytes	The new value for the configuration.
setContractActive
Sets a contract's active status

function setContractActive(
    uint256 chainId,
    string calldata contractType,
    bool active
)
    external
    onlyRole(REGISTRY_MANAGER_ROLE)
    whenNotPaused;


Parameters

Name	Type	Description
chainId	uint256	The ID of the chain where the contract is deployed.
contractType	string	The type of the contract.
active	bool	Whether the contract should be active.
registerZRC20Token
Registers a new ZRC20 token in the registry.

function registerZRC20Token(
    address address_,
    string calldata symbol,
    uint256 originChainId,
    bytes calldata originAddress,
    string calldata coinType,
    uint8 decimals
)
    external
    onlyRole(REGISTRY_MANAGER_ROLE)
    whenNotPaused;


Parameters

Name	Type	Description
address_	address	The address of the ZRC20 token on ZetaChain.
symbol	string	The symbol of the token.
originChainId	uint256	The ID of the foreign chain where the original asset exists.
originAddress	bytes	The address or identifier of the asset on its native chain.
coinType	string	The type of the original coin.
decimals	uint8	The number of decimals the token uses.
setZRC20TokenActive
Updates ZRC20 token active status.

function setZRC20TokenActive(address address_, bool active) external onlyRole(REGISTRY_MANAGER_ROLE) whenNotPaused;

_broadcastChainActivation
Broadcast chain activation update to all satellite registries.

function _broadcastChainActivation(
    uint256 chainId,
    address gasZRC20,
    bytes calldata registry,
    bool activation
)
    internal;


Parameters

Name	Type	Description
chainId	uint256	The ID of the chain being activated/deactivated.
gasZRC20	address	The address of the ZRC20 token that represents gas token for the chain.
registry	bytes	Address of the Registry contract on the connected chain.
activation	bool	Whether activate or deactivate the chain
_broadcastChainMetadataUpdate
Broadcast chain metadata to all satellite registries

function _broadcastChainMetadataUpdate(uint256 chainId, string calldata key, bytes calldata value) private;

Parameters

Name	Type	Description
chainId	uint256	The ID of the chain whose metadata is being updated
key	string	The metadata key being updated
value	bytes	The new value for the metadata
_broadcastContractRegistration
Broadcast contract registration to all satellite registries

contractType The type of the contract

addressBytes The bytes representation of the non-EVM address

function _broadcastContractRegistration(
    uint256 chainId,
    string calldata contractType,
    bytes calldata addressBytes
)
    private;


Parameters

Name	Type	Description
chainId	uint256	The ID of the chain where the contract is deployed
contractType	string	
addressBytes	bytes	
_broadcastContractConfigUpdate
Broadcast contract configuration update to all satellite registries

contractType The type of the contract

key The configuration key being updated

value The new value for the configuration

function _broadcastContractConfigUpdate(
    uint256 chainId,
    string calldata contractType,
    string calldata key,
    bytes calldata value
)
    private;


Parameters

Name	Type	Description
chainId	uint256	The ID of the chain where the contract is deployed
contractType	string	
key	string	
value	bytes	
_broadcastContractStatusUpdate
Broadcast contract status update to all satellite registries

contractType The type of the contract

active Whether the contract should be active

function _broadcastContractStatusUpdate(uint256 chainId, string calldata contractType, bool active) private;

Parameters

Name	Type	Description
chainId	uint256	The ID of the chain where the contract is deployed
contractType	string	
active	bool	
_broadcastZRC20Registration
Broadcast ZRC20 token registration to all satellite registries

function _broadcastZRC20Registration(
    address address_,
    string calldata symbol,
    uint256 originChainId,
    bytes calldata originAddress,
    string calldata coinType,
    uint8 decimals
)
    private;


Parameters

Name	Type	Description
address_	address	The address of the ZRC20 token on ZetaChain
symbol	string	The symbol of the token
originChainId	uint256	The ID of the foreign chain where the original asset exists
originAddress	bytes	The address or identifier of the asset on its native chain
coinType	string	The type of the original coin
decimals	uint8	The number of decimals the token uses
_broadcastZRC20Update
Broadcast ZRC20 token update to all satellite registries

function _broadcastZRC20Update(address address_, bool active) private;

Parameters

Name	Type	Description
address_	address	The address of the ZRC20 token
active	bool	Whether the token should be active
_broadcastToAllChains
Generic function to broadcast encoded messages to all satellite registries

function _broadcastToAllChains(bytes memory encodedMessage) private;

Parameters

Name	Type	Description
encodedMessage	bytes	The fully encoded function call to broadcast
_sendCrossChainMessage
Sends a cross-chain message to the Registry contract on a target chain.

function _sendCrossChainMessage(uint256 targetChainId, bytes memory message) private;

Parameters

Name	Type	Description
targetChainId	uint256	The ID of the chain to send the message to.
message	bytes	The encoded function call to execute on the target chain.
ICoreRegistry
Git Source

Functions
gatewayZEVM
function gatewayZEVM() external returns (address);

IGatewayZEVM
Git Source

Interface for the GatewayZEVM contract.

Defines functions for cross-chain interactions and token handling.

Functions
withdraw
Withdraw ZRC20 tokens to an external chain.

function withdraw(
    bytes memory receiver,
    uint256 amount,
    address zrc20,
    RevertOptions calldata revertOptions
)
    external;


Parameters

Name	Type	Description
receiver	bytes	The receiver address on the external chain.
amount	uint256	The amount of tokens to withdraw.
zrc20	address	The address of the ZRC20 token.
revertOptions	RevertOptions	Revert options.
withdraw
Withdraw ZETA tokens to an external chain.

function withdraw(bytes memory receiver, uint256 chainId, RevertOptions calldata revertOptions) external payable;

Parameters

Name	Type	Description
receiver	bytes	The receiver address on the external chain.
chainId	uint256	
revertOptions	RevertOptions	Revert options.
withdrawAndCall
Withdraw ZRC20 tokens and call a smart contract on an external chain.

function withdrawAndCall(
    bytes memory receiver,
    uint256 amount,
    address zrc20,
    bytes calldata message,
    CallOptions calldata callOptions,
    RevertOptions calldata revertOptions
)
    external;


Parameters

Name	Type	Description
receiver	bytes	The receiver address on the external chain.
amount	uint256	The amount of tokens to withdraw.
zrc20	address	The address of the ZRC20 token.
message	bytes	The calldata to pass to the contract call.
callOptions	CallOptions	Call options including gas limit and arbirtrary call flag.
revertOptions	RevertOptions	Revert options.
withdrawAndCall
Withdraw ZETA tokens and call a smart contract on an external chain.

function withdrawAndCall(
    bytes memory receiver,
    uint256 chainId,
    bytes calldata message,
    CallOptions calldata callOptions,
    RevertOptions calldata revertOptions
)
    external
    payable;


Parameters

Name	Type	Description
receiver	bytes	The receiver address on the external chain.
chainId	uint256	Chain id of the external chain.
message	bytes	The calldata to pass to the contract call.
callOptions	CallOptions	Call options including gas limit and arbirtrary call flag.
revertOptions	RevertOptions	Revert options.
call
Call a smart contract on an external chain without asset transfer.

function call(
    bytes memory receiver,
    address zrc20,
    bytes calldata message,
    CallOptions calldata callOptions,
    RevertOptions calldata revertOptions
)
    external;


Parameters

Name	Type	Description
receiver	bytes	The receiver address on the external chain.
zrc20	address	Address of zrc20 to pay fees.
message	bytes	The calldata to pass to the contract call.
callOptions	CallOptions	Call options including gas limit and arbirtrary call flag.
revertOptions	RevertOptions	Revert options.
deposit
Deposit foreign coins into ZRC20.

function deposit(address zrc20, uint256 amount, address target) external;

Parameters

Name	Type	Description
zrc20	address	The address of the ZRC20 token.
amount	uint256	The amount of tokens to deposit.
target	address	The target address to receive the deposited tokens.
deposit
Deposit native ZETA.

function deposit(address target) external payable;

Parameters

Name	Type	Description
target	address	The target address to receive the ZETA.
execute
Execute a user-specified contract on ZEVM.

function execute(
    MessageContext calldata context,
    address zrc20,
    uint256 amount,
    address target,
    bytes calldata message
)
    external;


Parameters

Name	Type	Description
context	MessageContext	The context of the cross-chain call.
zrc20	address	The address of the ZRC20 token.
amount	uint256	The amount of tokens to transfer.
target	address	The target contract to call.
message	bytes	The calldata to pass to the contract call.
depositAndCall
Deposit foreign coins into ZRC20 and call a user-specified contract on ZEVM.

function depositAndCall(
    MessageContext calldata context,
    address zrc20,
    uint256 amount,
    address target,
    bytes calldata message
)
    external;


Parameters

Name	Type	Description
context	MessageContext	The context of the cross-chain call.
zrc20	address	The address of the ZRC20 token.
amount	uint256	The amount of tokens to transfer.
target	address	The target contract to call.
message	bytes	The calldata to pass to the contract call.
depositAndCall
Deposit native ZETA and call a user-specified contract on ZEVM.

function depositAndCall(MessageContext calldata context, address target, bytes calldata message) external payable;

Parameters

Name	Type	Description
context	MessageContext	The context of the cross-chain call.
target	address	The target contract to call.
message	bytes	The calldata to pass to the contract call.
executeRevert
Revert a user-specified contract on ZEVM.

function executeRevert(address target, RevertContext calldata revertContext) external;

Parameters

Name	Type	Description
target	address	The target contract to call.
revertContext	RevertContext	Revert context to pass to onRevert.
depositAndRevert
Deposit foreign coins into ZRC20 and revert a user-specified contract on ZEVM.

function depositAndRevert(
    address zrc20,
    uint256 amount,
    address target,
    RevertContext calldata revertContext
)
    external;


Parameters

Name	Type	Description
zrc20	address	The address of the ZRC20 token.
amount	uint256	The amount of tokens to revert.
target	address	The target contract to call.
revertContext	RevertContext	Revert context to pass to onRevert.
IGatewayZEVMErrors
Git Source

Interface for the errors used in the GatewayZEVM contract.

Errors
WithdrawalFailed
Error indicating a withdrawal failure.

error WithdrawalFailed(address token, address recipient, uint256 amount);

Parameters

Name	Type	Description
token	address	The address of the token that failed to withdraw.
recipient	address	The address that was supposed to receive the tokens.
amount	uint256	The amount of tokens that failed to withdraw.
InsufficientAmount
Error indicating an insufficient token amount.

error InsufficientAmount();

ZRC20BurnFailed
Error indicating a failure to burn ZRC20 tokens.

error ZRC20BurnFailed(address zrc20, uint256 amount);

Parameters

Name	Type	Description
zrc20	address	The address of the ZRC20 token that failed to burn.
amount	uint256	The amount of tokens that failed to burn.
ZRC20TransferFailed
Error indicating a failure to transfer ZRC20 tokens.

error ZRC20TransferFailed(address zrc20, address from, address to, uint256 amount);

Parameters

Name	Type	Description
zrc20	address	The address of the ZRC20 token that failed to transfer.
from	address	The address sending the tokens.
to	address	The address receiving the tokens.
amount	uint256	The amount of tokens that failed to transfer.
ZRC20DepositFailed
Error indicating a failure to deposit ZRC20 tokens.

error ZRC20DepositFailed(address zrc20, address to, uint256 amount);

Parameters

Name	Type	Description
zrc20	address	The address of the ZRC20 token that failed to deposit.
to	address	The address that was supposed to receive the deposit.
amount	uint256	The amount of tokens that failed to deposit.
GasFeeTransferFailed
Error indicating a failure to transfer gas fee.

error GasFeeTransferFailed(address token, address to, uint256 amount);

Parameters

Name	Type	Description
token	address	The address of the token used for gas fee.
to	address	The address that was supposed to receive the gas fee.
amount	uint256	The amount of gas fee that failed to transfer.
CallerIsNotProtocol
Error indicating that the caller is not the protocol account.

error CallerIsNotProtocol();

InvalidTarget
Error indicating an invalid target address.

error InvalidTarget();

FailedZetaSent
Error indicating a failure to send ZETA tokens.

error FailedZetaSent(address recipient, uint256 amount);

Parameters

Name	Type	Description
recipient	address	The address that was supposed to receive the ZETA tokens.
amount	uint256	The amount of ZETA tokens that failed to send.
OnlyWZETAOrProtocol
Error indicating that only WZETA or the protocol address can call the function.

error OnlyWZETAOrProtocol();

InsufficientGasLimit
Error indicating an insufficient gas limit.

error InsufficientGasLimit();

MessageSizeExceeded
Error indicating message size exceeded in external functions.

error MessageSizeExceeded(uint256 provided, uint256 maximum);

Parameters

Name	Type	Description
provided	uint256	The size of the message that was provided.
maximum	uint256	The maximum allowed message size.
ZeroGasPrice
Error indicating an invalid gas price.

error ZeroGasPrice();

IGatewayZEVMEvents
Git Source

Interface for the events emitted by the GatewayZEVM contract.

Events
Called
Emitted when a cross-chain call is made.

event Called(
    address indexed sender,
    address indexed zrc20,
    bytes receiver,
    bytes message,
    CallOptions callOptions,
    RevertOptions revertOptions
);


Parameters

Name	Type	Description
sender	address	The address of the sender.
zrc20	address	Address of zrc20 to pay fees.
receiver	bytes	The receiver address on the external chain.
message	bytes	The calldata passed to the contract call.
callOptions	CallOptions	Call options including gas limit and arbirtrary call flag.
revertOptions	RevertOptions	Revert options.
Withdrawn
Emitted when a withdrawal is made.

event Withdrawn(
    address indexed sender,
    uint256 indexed chainId,
    bytes receiver,
    address zrc20,
    uint256 value,
    uint256 gasfee,
    uint256 protocolFlatFee,
    bytes message,
    CallOptions callOptions,
    RevertOptions revertOptions
);


Parameters

Name	Type	Description
sender	address	The address from which the tokens are withdrawn.
chainId	uint256	Chain id of external chain.
receiver	bytes	The receiver address on the external chain.
zrc20	address	The address of the ZRC20 token.
value	uint256	The amount of tokens withdrawn.
gasfee	uint256	The gas fee for the withdrawal.
protocolFlatFee	uint256	The protocol flat fee for the withdrawal.
message	bytes	The calldata passed with the withdraw. No longer used. Kept to maintain compatibility.
callOptions	CallOptions	Call options including gas limit and arbirtrary call flag.
revertOptions	RevertOptions	Revert options.
WithdrawnAndCalled
Emitted when a withdraw and call is made.

event WithdrawnAndCalled(
    address indexed sender,
    uint256 indexed chainId,
    bytes receiver,
    address zrc20,
    uint256 value,
    uint256 gasfee,
    uint256 protocolFlatFee,
    bytes message,
    CallOptions callOptions,
    RevertOptions revertOptions
);


Parameters

Name	Type	Description
sender	address	The address from which the tokens are withdrawn.
chainId	uint256	Chain id of external chain.
receiver	bytes	The receiver address on the external chain.
zrc20	address	The address of the ZRC20 token.
value	uint256	The amount of tokens withdrawn.
gasfee	uint256	The gas fee for the withdrawal.
protocolFlatFee	uint256	The protocol flat fee for the withdrawal.
message	bytes	The calldata passed to the contract call.
callOptions	CallOptions	Call options including gas limit and arbirtrary call flag.
revertOptions	RevertOptions	Revert options.
CallOptions
Git Source

CallOptions struct passed to call and withdrawAndCall functions.

struct CallOptions {
    uint256 gasLimit;
    bool isArbitraryCall;
}


Properties

Name	Type	Description
gasLimit	uint256	Gas limit.
isArbitraryCall	bool	Indicates if call should be arbitrary or authenticated.
ISystem
Git Source

Interface for the System contract.

Defines functions for system contract callable by fungible module.

Functions
FUNGIBLE_MODULE_ADDRESS
function FUNGIBLE_MODULE_ADDRESS() external view returns (address);

wZetaContractAddress
function wZetaContractAddress() external view returns (address);

uniswapv2FactoryAddress
function uniswapv2FactoryAddress() external view returns (address);

gasPriceByChainId
function gasPriceByChainId(uint256 chainID) external view returns (uint256);

gasCoinZRC20ByChainId
function gasCoinZRC20ByChainId(uint256 chainID) external view returns (address);

gasZetaPoolByChainId
function gasZetaPoolByChainId(uint256 chainID) external view returns (address);

IWETH9
Git Source

Interface for the Weth9 contract.

Functions
totalSupply
function totalSupply() external view returns (uint256);

balanceOf
function balanceOf(address owner) external view returns (uint256);

allowance
function allowance(address owner, address spender) external view returns (uint256);

approve
function approve(address spender, uint256 wad) external returns (bool);

transfer
function transfer(address to, uint256 wad) external returns (bool);

transferFrom
function transferFrom(address from, address to, uint256 wad) external returns (bool);

deposit
function deposit() external payable;

withdraw
function withdraw(uint256 wad) external;

Events
Approval
event Approval(address indexed owner, address indexed spender, uint256 value);

Transfer
event Transfer(address indexed from, address indexed to, uint256 value);

Deposit
event Deposit(address indexed dst, uint256 wad);

Withdrawal
event Withdrawal(address indexed src, uint256 wad);

CoinType
Git Source

Coin types for ZRC20. Zeta value should not be used.

enum CoinType {
    Zeta,
    Gas,
    ERC20
}


IZRC20
Git Source

Interface for the ZRC20 token contract.

Functions
totalSupply
function totalSupply() external view returns (uint256);

balanceOf
function balanceOf(address account) external view returns (uint256);

transfer
function transfer(address recipient, uint256 amount) external returns (bool);

allowance
function allowance(address owner, address spender) external view returns (uint256);

approve
function approve(address spender, uint256 amount) external returns (bool);

transferFrom
function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

deposit
function deposit(address to, uint256 amount) external returns (bool);

burn
function burn(uint256 amount) external returns (bool);

withdraw
function withdraw(bytes memory to, uint256 amount) external returns (bool);

withdrawGasFee
function withdrawGasFee() external view returns (address, uint256);

withdrawGasFeeWithGasLimit
function withdrawGasFeeWithGasLimit(uint256 gasLimit) external view returns (address, uint256);

PROTOCOL_FLAT_FEE
Name is in upper case to maintain compatibility with ZRC20.sol v1

function PROTOCOL_FLAT_FEE() external view returns (uint256);

GAS_LIMIT
Name is in upper case to maintain compatibility with ZRC20.sol v1

function GAS_LIMIT() external view returns (uint256);

SYSTEM_CONTRACT_ADDRESS
Name is in upper case to maintain compatibility with ZRC20.sol v1

function SYSTEM_CONTRACT_ADDRESS() external view returns (address);

setName
function setName(string memory newName) external;

setSymbol
function setSymbol(string memory newSymbol) external;

IZRC20Metadata
Git Source

Interface for the ZRC20 metadata.

Functions
name
function name() external view returns (string memory);

symbol
function symbol() external view returns (string memory);

decimals
function decimals() external view returns (uint8);

ZRC20Events
Git Source

Interface for the ZRC20 events.

Events
Transfer
event Transfer(address indexed from, address indexed to, uint256 value);

Approval
event Approval(address indexed owner, address indexed spender, uint256 value);

Deposit
event Deposit(bytes from, address indexed to, uint256 value);

Withdrawal
event Withdrawal(address indexed from, bytes to, uint256 value, uint256 gasFee, uint256 protocolFlatFee);

UpdatedSystemContract
event UpdatedSystemContract(address systemContract);

UpdatedGateway
event UpdatedGateway(address gateway);

UpdatedGasLimit
event UpdatedGasLimit(uint256 gasLimit);

UpdatedProtocolFlatFee
event UpdatedProtocolFlatFee(uint256 protocolFlatFee);

UniversalContract
Git Source

Abstract contract for contracts that can receive cross-chain calls on ZetaChain.

Contracts extending this abstract contract can handle incoming cross-chain messages and execute logic based on the provided context, token, and message payload.

State Variables
registry
Reference to the ZetaChain Registry contract

ICoreRegistry public constant registry = ICoreRegistry(0x7CCE3Eb018bf23e1FE2a32692f2C77592D110394);

gateway
Reference to the ZetaChain Gateway contract

IGatewayZEVM public immutable gateway;

Functions
onlyGateway
Restricts function access to only the gateway contract

Used on functions that process cross-chain messages to ensure they're only called through the Gateway, where message validation occurs. Important for security in functions like onCall() and onRevert() that handle incoming cross-chain operations.

modifier onlyGateway();

constructor
Initializes the contract by retrieving the gateway address from the registry

Fetches the gateway contract address for the current chain from the registry. If the gateway is not active or not found, the gateway will remain uninitialized (address(0)).

constructor();

onCall
Function to handle cross-chain calls with native ZETA transfers

function onCall(MessageContext calldata context, bytes calldata message) external payable virtual;

onCall
Function to handle cross-chain calls with ZRC20 token transfers

function onCall(
    MessageContext calldata context,
    address zrc20,
    uint256 amount,
    bytes calldata message
)
    external
    virtual;


Errors
Unauthorized
Error thrown when a function is called by an unauthorized address

error Unauthorized();

zContract
Git Source

Note: deprecated: should be removed once v2 SystemContract is not used anymore. UniversalContract should be used

Functions
onCrossChainCall
function onCrossChainCall(zContext calldata context, address zrc20, uint256 amount, bytes calldata message) external;

MessageContext
Git Source

Provides contextual information when executing a cross-chain call on ZetaChain.

This struct helps identify the sender of the message across different blockchain environments.

struct MessageContext {
    bytes sender;
    address senderEVM;
    uint256 chainID;
}


zContext
Git Source

Note: deprecated: should be removed once v2 SystemContract is not used anymore. MessageContext should be used

struct zContext {
    bytes origin;
    address sender;
    uint256 chainID;
}


ZetaConnectorZEVM
Git Source

State Variables
wzeta
WZETA token address.

address public wzeta;

FUNGIBLE_MODULE_ADDRESS
Fungible module address.

address public constant FUNGIBLE_MODULE_ADDRESS = payable(0x735b14BB79463307AAcBED86DAf3322B1e6226aB);

Functions
onlyFungibleModule
Modifier to restrict actions to fungible module.

modifier onlyFungibleModule();

constructor
constructor(address wzeta_);

receive
Receive function to receive ZETA from WETH9.withdraw().

receive() external payable;

setWzetaAddress
function setWzetaAddress(address wzeta_) external onlyFungibleModule;

send
Sends ZETA and bytes messages (to execute it) crosschain.

function send(ZetaInterfaces.SendInput calldata input) external;

Parameters

Name	Type	Description
input	ZetaInterfaces.SendInput	
onReceive
Handler to receive data from other chain. This method can be called only by Fungible Module. Transfer the Zeta tokens to destination and calls onZetaMessage if it's needed. To perform the transfer wrap the new tokens

function onReceive(
    bytes calldata zetaTxSenderAddress,
    uint256 sourceChainId,
    address destinationAddress,
    uint256 zetaValue,
    bytes calldata message,
    bytes32 internalSendHash
)
    external
    payable
    onlyFungibleModule;


onRevert
Handler to receive errors from other chain. This method can be called only by Fungible Module. Transfer the Zeta tokens to destination and calls onZetaRevert if it's needed.

function onRevert(
    address zetaTxSenderAddress,
    uint256 sourceChainId,
    bytes calldata destinationAddress,
    uint256 destinationChainId,
    uint256 remainingZetaValue,
    bytes calldata message,
    bytes32 internalSendHash
)
    external
    payable
    onlyFungibleModule;


Events
SetWZETA
event SetWZETA(address wzeta_);

ZetaSent
event ZetaSent(
    address sourceTxOriginAddress,
    address indexed zetaTxSenderAddress,
    uint256 indexed destinationChainId,
    bytes destinationAddress,
    uint256 zetaValueAndGas,
    uint256 destinationGasLimit,
    bytes message,
    bytes zetaParams
);


ZetaReceived
event ZetaReceived(
    bytes zetaTxSenderAddress,
    uint256 indexed sourceChainId,
    address indexed destinationAddress,
    uint256 zetaValue,
    bytes message,
    bytes32 indexed internalSendHash
);


ZetaReverted
event ZetaReverted(
    address zetaTxSenderAddress,
    uint256 sourceChainId,
    uint256 indexed destinationChainId,
    bytes destinationAddress,
    uint256 remainingZetaValue,
    bytes message,
    bytes32 indexed internalSendHash
);


Errors
OnlyWZETAOrFungible
Contract custom errors.

error OnlyWZETAOrFungible();

WZETATransferFailed
error WZETATransferFailed();

OnlyFungibleModule
error OnlyFungibleModule();

FailedZetaSent
error FailedZetaSent();

WrongValue
error WrongValue();

ZetaInterfaces
Git Source

Structs
SendInput
Use SendInput to interact with the Connector: connector.send(SendInput)

struct SendInput {
    uint256 destinationChainId;
    bytes destinationAddress;
    uint256 destinationGasLimit;
    bytes message;
    uint256 zetaValueAndGas;
    bytes zetaParams;
}


ZetaMessage
Our Connector calls onZetaMessage with this struct as argument

struct ZetaMessage {
    bytes zetaTxSenderAddress;
    uint256 sourceChainId;
    address destinationAddress;
    uint256 zetaValue;
    bytes message;
}


ZetaRevert
Our Connector calls onZetaRevert with this struct as argument

struct ZetaRevert {
    address zetaTxSenderAddress;
    uint256 sourceChainId;
    bytes destinationAddress;
    uint256 destinationChainId;
    uint256 remainingZetaValue;
    bytes message;
}


ZetaReceiver
Git Source

Functions
onZetaMessage
onZetaMessage is called when a cross-chain message reaches a contract

function onZetaMessage(ZetaInterfaces.ZetaMessage calldata zetaMessage) external;

onZetaRevert
onZetaRevert is called when a cross-chain message reverts. It's useful to rollback to the original state

function onZetaRevert(ZetaInterfaces.ZetaRevert calldata zetaRevert) external;

GatewayZEVMValidations
Git Source

Library containing validation functions for GatewayZEVM contract

This library provides common validation logic used across GatewayZEVM contract

State Variables
MAX_MESSAGE_SIZE
Maximum message size constant

uint256 internal constant MAX_MESSAGE_SIZE = 2880;

MIN_GAS_LIMIT
Minimum gas limit constant

uint256 internal constant MIN_GAS_LIMIT = 100_000;

Functions
validateNonZeroAddress
Validates that an address is not zero

function validateNonZeroAddress(address addr) internal pure;

Parameters

Name	Type	Description
addr	address	The address to validate
validateReceiver
Validates that receiver bytes are not empty

function validateReceiver(bytes memory receiver) internal pure;

Parameters

Name	Type	Description
receiver	bytes	The receiver bytes to validate
validateAmount
Validates that amount is not zero

function validateAmount(uint256 amount) internal pure;

Parameters

Name	Type	Description
amount	uint256	The amount to validate
validateGasLimit
Validates that gas limit meets minimum requirement

function validateGasLimit(uint256 gasLimit) internal pure;

Parameters

Name	Type	Description
gasLimit	uint256	The gas limit to validate
validateTarget
Validates that target address is not restricted

function validateTarget(address target, address protocolAddress, address contractAddress) private pure;

Parameters

Name	Type	Description
target	address	The target address to validate
protocolAddress	address	The protocol address to check against
contractAddress	address	The contract address to check against
validateMessageSize
Validates message size constraints

function validateMessageSize(uint256 messageLength, uint256 revertMessageLength) internal pure;

Parameters

Name	Type	Description
messageLength	uint256	The length of the main message
revertMessageLength	uint256	The length of the revert message
validateRevertOptions
Validates revert options

function validateRevertOptions(RevertOptions calldata revertOptions) internal pure;

Parameters

Name	Type	Description
revertOptions	RevertOptions	The revert options to validate
validateCallAndRevertOptions
Validates call options and revert options together

function validateCallAndRevertOptions(
    CallOptions calldata callOptions,
    RevertOptions calldata revertOptions,
    uint256 messageLength
)
    internal
    pure;


Parameters

Name	Type	Description
callOptions	CallOptions	The call options to validate
revertOptions	RevertOptions	The revert options to validate
messageLength	uint256	The length of the message
validateWithdrawalParams
Validates standard withdrawal parameters

function validateWithdrawalParams(
    bytes memory receiver,
    uint256 amount,
    RevertOptions calldata revertOptions
)
    internal
    pure;


Parameters

Name	Type	Description
receiver	bytes	The receiver address
amount	uint256	The amount to withdraw
revertOptions	RevertOptions	The revert options
validateWithdrawalAndCallParams
Validates withdrawal and call parameters

function validateWithdrawalAndCallParams(
    bytes memory receiver,
    uint256 amount,
    bytes calldata message,
    CallOptions calldata callOptions,
    RevertOptions calldata revertOptions
)
    internal
    pure;


Parameters

Name	Type	Description
receiver	bytes	The receiver address
amount	uint256	The amount to withdraw
message	bytes	The message to send
callOptions	CallOptions	The call options
revertOptions	RevertOptions	The revert options
validateDepositParams
Validates deposit parameters

function validateDepositParams(
    address zrc20,
    uint256 amount,
    address target,
    address protocolAddress,
    address contractAddress
)
    internal
    pure;


Parameters

Name	Type	Description
zrc20	address	The ZRC20 token address
amount	uint256	The amount to deposit
target	address	The target address
protocolAddress	address	The protocol address
contractAddress	address	The contract address
validateExecuteParams
Validates execute parameters

function validateExecuteParams(address zrc20, address target) internal pure;

Parameters

Name	Type	Description
zrc20	address	The ZRC20 token address
target	address	The target address
validateZetaDepositParams
Validates ZETA deposit and call parameters

function validateZetaDepositParams(
    uint256 amount,
    address target,
    address protocolAddress,
    address contractAddress
)
    internal
    pure;


Parameters

Name	Type	Description
amount	uint256	The amount to deposit
target	address	The target address
protocolAddress	address	The protocol address
contractAddress	address	The contract address
Errors
EmptyAddress
Error indicating a empty address was provided.

error EmptyAddress();

SystemContract
Git Source

The system contract it's called by the protocol to interact with the blockchain. Also includes a lot of tools to make easier to interact with ZetaChain.

State Variables
gasPriceByChainId
Map to know the gas price of each chain given a chain id.

mapping(uint256 => uint256) public gasPriceByChainId;

gasCoinZRC20ByChainId
Map to know the ZRC20 address of a token given a chain id, ex zETH, zBNB etc.

mapping(uint256 => address) public gasCoinZRC20ByChainId;

gasZetaPoolByChainId
mapping(uint256 => address) public gasZetaPoolByChainId;

FUNGIBLE_MODULE_ADDRESS
Fungible address is always the same, it's on protocol level.

address public constant FUNGIBLE_MODULE_ADDRESS = 0x735b14BB79463307AAcBED86DAf3322B1e6226aB;

uniswapv2FactoryAddress
Uniswap V2 addresses.

address public immutable uniswapv2FactoryAddress;

uniswapv2Router02Address
address public immutable uniswapv2Router02Address;

wZetaContractAddress
Address of the wrapped ZETA to interact with Uniswap V2.

address public wZetaContractAddress;

zetaConnectorZEVMAddress
Address of ZEVM Zeta Connector.

address public zetaConnectorZEVMAddress;

Functions
constructor
Only fungible module can deploy a system contract.

constructor(address wzeta_, address uniswapv2Factory_, address uniswapv2Router02_);

depositAndCall
Deposit foreign coins into ZRC20 and call user specified contract on zEVM.

function depositAndCall(
    zContext calldata context,
    address zrc20,
    uint256 amount,
    address target,
    bytes calldata message
)
    external;


Parameters

Name	Type	Description
context	zContext	
zrc20	address	
amount	uint256	
target	address	
message	bytes	
sortTokens
Sort token addresses lexicographically. Used to handle return values from pairs sorted in the order.

function sortTokens(address tokenA, address tokenB) internal pure returns (address token0, address token1);

Parameters

Name	Type	Description
tokenA	address	
tokenB	address	
Returns

Name	Type	Description
token0	address	token1, returns sorted token addresses,.
token1	address	
uniswapv2PairFor
Calculates the CREATE2 address for a pair without making any external calls.

function uniswapv2PairFor(address factory, address tokenA, address tokenB) public pure returns (address pair);

Parameters

Name	Type	Description
factory	address	
tokenA	address	
tokenB	address	
Returns

Name	Type	Description
pair	address	tokens pair address.
setGasPrice
Fungible module updates the gas price oracle periodically.

function setGasPrice(uint256 chainID, uint256 price) external;

Parameters

Name	Type	Description
chainID	uint256	
price	uint256	
setGasCoinZRC20
Setter for gasCoinZRC20ByChainId map.

function setGasCoinZRC20(uint256 chainID, address zrc20) external;

Parameters

Name	Type	Description
chainID	uint256	
zrc20	address	
setGasZetaPool
Set the pool wzeta/erc20 address.

function setGasZetaPool(uint256 chainID, address erc20) external;

Parameters

Name	Type	Description
chainID	uint256	
erc20	address	
setWZETAContractAddress
Setter for wrapped ZETA address.

function setWZETAContractAddress(address addr) external;

Parameters

Name	Type	Description
addr	address	
setConnectorZEVMAddress
Setter for zetaConnector ZEVM Address

function setConnectorZEVMAddress(address addr) external;

Parameters

Name	Type	Description
addr	address	
Events
SystemContractDeployed
Custom SystemContract errors.

event SystemContractDeployed();

SetGasPrice
event SetGasPrice(uint256, uint256);

SetGasCoin
event SetGasCoin(uint256, address);

SetGasZetaPool
event SetGasZetaPool(uint256, address);

SetWZeta
event SetWZeta(address);

SetConnectorZEVM
event SetConnectorZEVM(address);

SystemContractErrors
Git Source

Custom errors for SystemContract

Errors
CallerIsNotFungibleModule
error CallerIsNotFungibleModule();

InvalidTarget
error InvalidTarget();

CantBeIdenticalAddresses
error CantBeIdenticalAddresses();

CantBeZeroAddress
error CantBeZeroAddress();

ZeroAddress
error ZeroAddress();

WETH9
Git Source

State Variables
name
string public name = "Wrapped Ether";

symbol
string public symbol = "WETH";

decimals
uint8 public decimals = 18;

balanceOf
mapping(address => uint256) public balanceOf;

allowance
mapping(address => mapping(address => uint256)) public allowance;

Functions
receive
receive() external payable;

deposit
function deposit() public payable;

withdraw
function withdraw(uint256 wad) public;

totalSupply
function totalSupply() public view returns (uint256);

approve
function approve(address guy, uint256 wad) public returns (bool);

transfer
function transfer(address dst, uint256 wad) public returns (bool);

transferFrom
function transferFrom(address src, address dst, uint256 wad) public returns (bool);

Events
Approval
event Approval(address indexed src, address indexed guy, uint256 wad);

Transfer
event Transfer(address indexed src, address indexed dst, uint256 wad);

Deposit
event Deposit(address indexed dst, uint256 wad);

Withdrawal
event Withdrawal(address indexed src, uint256 wad);

ZRC20
Git Source

State Variables
FUNGIBLE_MODULE_ADDRESS
Fungible address is always the same, maintained at the protocol level

address public constant FUNGIBLE_MODULE_ADDRESS = 0x735b14BB79463307AAcBED86DAf3322B1e6226aB;

CHAIN_ID
Chain id.abi

uint256 public immutable CHAIN_ID;

COIN_TYPE
Coin type, checkout Interfaces.sol.

CoinType public immutable COIN_TYPE;

SYSTEM_CONTRACT_ADDRESS
System contract address.

Name is in upper case to maintain compatibility with ZRC20.sol v1

address public SYSTEM_CONTRACT_ADDRESS;

GAS_LIMIT
Gas limit.

Name is in upper case to maintain compatibility with ZRC20.sol v1

uint256 public GAS_LIMIT;

PROTOCOL_FLAT_FEE
Protocol flat fee.

Name is in upper case to maintain compatibility with ZRC20.sol v1

uint256 public override PROTOCOL_FLAT_FEE;

_balances
mapping(address => uint256) private _balances;

_allowances
mapping(address => mapping(address => uint256)) private _allowances;

_totalSupply
uint256 private _totalSupply;

_name
string private _name;

_symbol
string private _symbol;

_decimals
uint8 private _decimals;

gatewayAddress
Gateway contract address.

This variable is added at last position to maintain storage layout with ZRC20.sol v1

address public gatewayAddress;

Functions
_msgSender
function _msgSender() internal view virtual returns (address);

onlyFungible
Only fungible module modifier.

modifier onlyFungible();

constructor
The only one allowed to deploy new ZRC20 is fungible address.

constructor(
    string memory name_,
    string memory symbol_,
    uint8 decimals_,
    uint256 chainid_,
    CoinType coinType_,
    uint256 gasLimit_,
    address systemContractAddress_,
    address gatewayAddress_
);


name
ZRC20 name

function name() public view virtual override returns (string memory);

Returns

Name	Type	Description
<none>	string	name as string
setName
Name can be updated by fungible module account.

function setName(string memory newName) external override onlyFungible;

setSymbol
Symbol can be updated by fungible module account.

function setSymbol(string memory newSymbol) external override onlyFungible;

symbol
ZRC20 symbol.

function symbol() public view virtual override returns (string memory);

Returns

Name	Type	Description
<none>	string	symbol as string.
decimals
ZRC20 decimals.

function decimals() public view virtual override returns (uint8);

Returns

Name	Type	Description
<none>	uint8	returns uint8 decimals.
totalSupply
ZRC20 total supply.

function totalSupply() public view virtual override returns (uint256);

Returns

Name	Type	Description
<none>	uint256	returns uint256 total supply.
balanceOf
Returns ZRC20 balance of an account.

function balanceOf(address account) public view virtual override returns (uint256);

Parameters

Name	Type	Description
account	address	
Returns

Name	Type	Description
<none>	uint256	uint256 account balance.
transfer
Returns ZRC20 balance of an account.

function transfer(address recipient, uint256 amount) public virtual override returns (bool);

Parameters

Name	Type	Description
recipient	address	
amount	uint256	
Returns

Name	Type	Description
<none>	bool	true/false if transfer succeeded/failed.
allowance
Returns token allowance from owner to spender.

function allowance(address owner, address spender) public view virtual override returns (uint256);

Parameters

Name	Type	Description
owner	address	
spender	address	
Returns

Name	Type	Description
<none>	uint256	uint256 allowance.
approve
Approves amount transferFrom for spender.

function approve(address spender, uint256 amount) public virtual override returns (bool);

Parameters

Name	Type	Description
spender	address	
amount	uint256	
Returns

Name	Type	Description
<none>	bool	true/false if succeeded/failed.
transferFrom
Transfers tokens from sender to recipient.

function transferFrom(address sender, address recipient, uint256 amount) public virtual override returns (bool);

Parameters

Name	Type	Description
sender	address	
recipient	address	
amount	uint256	
Returns

Name	Type	Description
<none>	bool	true/false if succeeded/failed.
burn
Burns an amount of tokens.

function burn(uint256 amount) external override returns (bool);

Parameters

Name	Type	Description
amount	uint256	
Returns

Name	Type	Description
<none>	bool	true/false if succeeded/failed.
_transfer
function _transfer(address sender, address recipient, uint256 amount) internal virtual;

_mint
function _mint(address account, uint256 amount) internal virtual;

_burn
function _burn(address account, uint256 amount) internal virtual;

_approve
function _approve(address owner, address spender, uint256 amount) internal virtual;

deposit
Deposits corresponding tokens from external chain, only callable by Fungible module.

function deposit(address to, uint256 amount) external override returns (bool);

Parameters

Name	Type	Description
to	address	
amount	uint256	
Returns

Name	Type	Description
<none>	bool	true/false if succeeded/failed.
withdrawGasFee
Withdraws gas fees.

function withdrawGasFee() public view override returns (address, uint256);

Returns

Name	Type	Description
<none>	address	returns the ZRC20 address for gas on the same chain of this ZRC20, and calculates the gas fee for withdraw()
<none>	uint256	
withdrawGasFeeWithGasLimit
Withdraws gas fees with specified gasLimit

function withdrawGasFeeWithGasLimit(uint256 gasLimit) public view override returns (address, uint256);

Returns

Name	Type	Description
<none>	address	returns the ZRC20 address for gas on the same chain of this ZRC20, and calculates the gas fee for withdraw()
<none>	uint256	
withdraw
Withraws ZRC20 tokens to external chains, this function causes cctx module to send out outbound tx to the outbound chain this contract should be given enough allowance of the gas ZRC20 to pay for outbound tx gas fee.

function withdraw(bytes memory to, uint256 amount) external override returns (bool);

Parameters

Name	Type	Description
to	bytes	
amount	uint256	
Returns

Name	Type	Description
<none>	bool	true/false if succeeded/failed.
updateSystemContractAddress
Updates system contract address. Can only be updated by the fungible module.

function updateSystemContractAddress(address addr) external onlyFungible;

Parameters

Name	Type	Description
addr	address	
updateGatewayAddress
Updates gateway contract address. Can only be updated by the fungible module.

function updateGatewayAddress(address addr) external onlyFungible;

Parameters

Name	Type	Description
addr	address	
updateGasLimit
Updates gas limit. Can only be updated by the fungible module.

function updateGasLimit(uint256 gasLimit_) external onlyFungible;

Parameters

Name	Type	Description
gasLimit_	uint256	
updateProtocolFlatFee
Updates protocol flat fee. Can only be updated by the fungible module.

function updateProtocolFlatFee(uint256 protocolFlatFee_) external onlyFungible;

Parameters

Name	Type	Description
protocolFlatFee_	uint256	
ZRC20Errors
Git Source

Custom errors for ZRC20

Errors
CallerIsNotFungibleModule
error CallerIsNotFungibleModule();

InvalidSender
error InvalidSender();

GasFeeTransferFailed
error GasFeeTransferFailed();

ZeroGasCoin
error ZeroGasCoin();

ZeroGasPrice
error ZeroGasPrice();

LowAllowance
error LowAllowance();

LowBalance
error LowBalance();

ZeroAddress
error ZeroAddress();






Solana
Solana protocol contracts
Crate Documentation
Version: 0.1.0

Format Version: 41

Module gateway
Modules
Module program
Module representing the program.

pub mod program { /* ... */ }

Types
Struct Gateway
Type representing the program.

pub struct Gateway;

Implementations
Trait Implementations
Freeze

Send

TryFrom

fn try_from(value: U) -> Result<T, <T as TryFrom<U>>::Error> { /* ... */ }

Into

fn into(self: Self) -> U { /* ... */ }

Calls U::from(self).
From

fn from(t: T) -> T { /* ... */ }

Returns the argument unchanged.
VZip

fn vzip(self: Self) -> V { /* ... */ }

BorrowMut

fn borrow_mut(self: &mut Self) -> &mut T { /* ... */ }

Unpin

Any

fn type_id(self: &Self) -> TypeId { /* ... */ }

RefUnwindSafe

Sync

UnwindSafe

TryInto

fn try_into(self: Self) -> Result<U, <U as TryFrom<T>>::Error> { /* ... */ }

Same

Clone

fn clone(self: &Self) -> Gateway { /* ... */ }

CloneToUninit

unsafe fn clone_to_uninit(self: &Self, dst: *mut u8) { /* ... */ }

IntoEither

Borrow

fn borrow(self: &Self) -> &T { /* ... */ }

Id

fn id() -> Pubkey { /* ... */ }

ToOwned

fn to_owned(self: &Self) -> T { /* ... */ }

fn clone_into(self: &Self, target: &mut T) { /* ... */ }

Module gateway
pub mod gateway { /* ... */ }

Functions
Function initialize
Initializes the gateway PDA.

Arguments:

ctx - The instruction context.
tss_address - The Ethereum TSS address (20 bytes).
chain_id - The chain ID associated with the PDA.
pub fn initialize(ctx: Context<''_, ''_, ''_, ''_, Initialize<''_>>, tss_address: [u8; 20], chain_id: u64) -> Result<()> { /* ... */ }

Function increment_nonce
Increments nonce, used by TSS in case outbound fails.

Arguments:

ctx - The instruction context.
amount - The amount in original outbound.
signature - The TSS signature.
recovery_id - The recovery ID for signature verification.
message_hash - Message hash for signature verification.
nonce - The current nonce value.
pub fn increment_nonce(ctx: Context<''_, ''_, ''_, ''_, IncrementNonce<''_>>, amount: u64, signature: [u8; 64], recovery_id: u8, message_hash: [u8; 32], nonce: u64) -> Result<()> { /* ... */ }

Function execute
Withdraws amount to destination program pda, and calls on_call on destination program

Arguments:

ctx - The instruction context.
amount - Amount of SOL to transfer.
sender - Sender's address.
data - Arbitrary data to pass to the destination program.
signature - Signature of the message.
recovery_id - Recovery ID of the signature.
message_hash - Hash of the message.
nonce - Nonce of the message.
pub fn execute(ctx: Context<''_, ''_, ''_, ''_, Execute<''_>>, amount: u64, sender: [u8; 20], data: Vec<u8>, signature: [u8; 64], recovery_id: u8, message_hash: [u8; 32], nonce: u64) -> Result<()> { /* ... */ }

Function execute_revert
Withdraws amount to destination program pda, and calls on_revert on destination program

Arguments:

ctx - The instruction context.
amount - The amount of SOL to withdraw.
sender - Sender from ZEVM.
data - Data to pass to destination program.
signature - The TSS signature.
recovery_id - The recovery ID for signature verification.
message_hash - Message hash for signature verification.
nonce - The current nonce value.
pub fn execute_revert(ctx: Context<''_, ''_, ''_, ''_, Execute<''_>>, amount: u64, sender: Pubkey, data: Vec<u8>, signature: [u8; 64], recovery_id: u8, message_hash: [u8; 32], nonce: u64) -> Result<()> { /* ... */ }

Function execute_spl_token
Withdraws amount of SPL tokens to destination program pda, and calls on_call on destination program

Arguments:

ctx - The instruction context.
decimals - Token decimals for precision.
amount - The amount of tokens to withdraw.
sender - Sender from ZEVM.
data - Data to pass to destination program.
signature - The TSS signature.
recovery_id - The recovery ID for signature verification.
message_hash - Message hash for signature verification.
nonce - The current nonce value.
pub fn execute_spl_token(ctx: Context<''_, ''_, ''_, ''_, ExecuteSPLToken<''_>>, decimals: u8, amount: u64, sender: [u8; 20], data: Vec<u8>, signature: [u8; 64], recovery_id: u8, message_hash: [u8; 32], nonce: u64) -> Result<()> { /* ... */ }

Function execute_spl_token_revert
Withdraws SPL token amount to destination program pda, and calls on_revert on destination program

Arguments:

ctx - The instruction context.
decimals - Token decimals for precision.
amount - The amount of tokens to withdraw.
sender - Sender from ZEVM.
data - Data to pass to destination program.
signature - The TSS signature.
recovery_id - The recovery ID for signature verification.
message_hash - Message hash for signature verification.
nonce - The current nonce value.
pub fn execute_spl_token_revert(ctx: Context<''_, ''_, ''_, ''_, ExecuteSPLToken<''_>>, decimals: u8, amount: u64, sender: Pubkey, data: Vec<u8>, signature: [u8; 64], recovery_id: u8, message_hash: [u8; 32], nonce: u64) -> Result<()> { /* ... */ }

Function set_deposit_paused
Pauses or unpauses deposits. Caller is authority stored in PDA.

Arguments:

ctx - The instruction context.
deposit_paused - Boolean flag to pause or unpause deposits.
pub fn set_deposit_paused(ctx: Context<''_, ''_, ''_, ''_, UpdatePaused<''_>>, deposit_paused: bool) -> Result<()> { /* ... */ }

Function update_tss
Updates the TSS address. Caller is authority stored in PDA.

Arguments:

ctx - The instruction context.
tss_address - The new Ethereum TSS address (20 bytes).
pub fn update_tss(ctx: Context<''_, ''_, ''_, ''_, UpdateTss<''_>>, tss_address: [u8; 20]) -> Result<()> { /* ... */ }

Function update_authority
Updates the PDA authority. Caller is authority stored in PDA.

Arguments:

ctx - The instruction context.
new_authority_address - The new authority's public key.
pub fn update_authority(ctx: Context<''_, ''_, ''_, ''_, UpdateAuthority<''_>>, new_authority_address: Pubkey) -> Result<()> { /* ... */ }

Function reset_nonce
Resets the PDA nonce. Caller is authority stored in PDA.

Arguments:

ctx - The instruction context.
new_nonce - The new nonce.
pub fn reset_nonce(ctx: Context<''_, ''_, ''_, ''_, ResetNonce<''_>>, new_nonce: u64) -> Result<()> { /* ... */ }

Function whitelist_spl_mint
Whitelists a new SPL token. Caller is TSS.

Arguments:

ctx - The instruction context.
signature - The TSS signature.
recovery_id - The recovery ID for signature verification.
message_hash - Message hash for signature verification.
nonce - The current nonce value.
pub fn whitelist_spl_mint(ctx: Context<''_, ''_, ''_, ''_, Whitelist<''_>>, signature: [u8; 64], recovery_id: u8, message_hash: [u8; 32], nonce: u64) -> Result<()> { /* ... */ }

Function unwhitelist_spl_mint
Unwhitelists an SPL token. Caller is TSS.

Arguments:

ctx - The instruction context.
signature - The TSS signature.
recovery_id - The recovery ID for signature verification.
message_hash - Message hash for signature verification.
nonce - The current nonce value.
pub fn unwhitelist_spl_mint(ctx: Context<''_, ''_, ''_, ''_, Unwhitelist<''_>>, signature: [u8; 64], recovery_id: u8, message_hash: [u8; 32], nonce: u64) -> Result<()> { /* ... */ }

Function deposit
Deposits SOL into the program and credits the receiver on ZetaChain zEVM.

Arguments:

ctx - The instruction context.
amount - The amount of lamports to deposit.
receiver - The Ethereum address of the receiver on ZetaChain zEVM.
revert_options - The revert options created by the caller.
pub fn deposit(ctx: Context<''_, ''_, ''_, ''_, Deposit<''_>>, amount: u64, receiver: [u8; 20], revert_options: Option<RevertOptions>) -> Result<()> { /* ... */ }

Function deposit_and_call
Deposits SOL and calls a contract on ZetaChain zEVM.

Arguments:

ctx - The instruction context.
amount - The amount of lamports to deposit.
receiver - The Ethereum address of the receiver on ZetaChain zEVM.
message - The message passed to the contract.
revert_options - The revert options created by the caller.
pub fn deposit_and_call(ctx: Context<''_, ''_, ''_, ''_, Deposit<''_>>, amount: u64, receiver: [u8; 20], message: Vec<u8>, revert_options: Option<RevertOptions>) -> Result<()> { /* ... */ }

Function deposit_spl_token
Deposits SPL tokens and credits the receiver on ZetaChain zEVM.

Arguments:

ctx - The instruction context.
amount - The amount of SPL tokens to deposit.
receiver - The Ethereum address of the receiver on ZetaChain zEVM.
revert_options - The revert options created by the caller.
pub fn deposit_spl_token(ctx: Context<''_, ''_, ''_, ''_, DepositSplToken<''_>>, amount: u64, receiver: [u8; 20], revert_options: Option<RevertOptions>) -> Result<()> { /* ... */ }

Function deposit_spl_token_and_call
Deposits SPL tokens and calls a contract on ZetaChain zEVM.

Arguments:

ctx - The instruction context.
amount - The amount of SPL tokens to deposit.
receiver - The Ethereum address of the receiver on ZetaChain zEVM.
message - The message passed to the contract.
revert_options - The revert options created by the caller.
pub fn deposit_spl_token_and_call(ctx: Context<''_, ''_, ''_, ''_, DepositSplToken<''_>>, amount: u64, receiver: [u8; 20], message: Vec<u8>, revert_options: Option<RevertOptions>) -> Result<()> { /* ... */ }

Function call
Calls a contract on ZetaChain zEVM.

Arguments:

receiver - The Ethereum address of the receiver on ZetaChain zEVM.
message - The message passed to the contract.
revert_options - The revert options created by the caller.
pub fn call(ctx: Context<''_, ''_, ''_, ''_, Call<''_>>, receiver: [u8; 20], message: Vec<u8>, revert_options: Option<RevertOptions>) -> Result<()> { /* ... */ }

Function withdraw
Withdraws SOL. Caller is TSS.

Arguments:

ctx - The instruction context.
amount - The amount of SOL to withdraw.
signature - The TSS signature.
recovery_id - The recovery ID for signature verification.
message_hash - Message hash for signature verification.
nonce - The current nonce value.
pub fn withdraw(ctx: Context<''_, ''_, ''_, ''_, Withdraw<''_>>, amount: u64, signature: [u8; 64], recovery_id: u8, message_hash: [u8; 32], nonce: u64) -> Result<()> { /* ... */ }

Function withdraw_spl_token
Withdraws SPL tokens. Caller is TSS.

Arguments:

ctx - The instruction context.
decimals - Token decimals for precision.
amount - The amount of tokens to withdraw.
signature - The TSS signature.
recovery_id - The recovery ID for signature verification.
message_hash - Message hash for signature verification.
nonce - The current nonce value.
pub fn withdraw_spl_token(ctx: Context<''_, ''_, ''_, ''_, WithdrawSPLToken<''_>>, decimals: u8, amount: u64, signature: [u8; 64], recovery_id: u8, message_hash: [u8; 32], nonce: u64) -> Result<()> { /* ... */ }

Module instruction
An Anchor generated module containing the program's set of instructions, where each method handler in the #[program] mod is associated with a struct defining the input arguments to the method. These should be used directly, when one wants to serialize Anchor instruction data, for example, when speciying instructions on a client.

pub mod instruction { /* ... */ }

Types
Struct Initialize
Instruction.

pub struct Initialize {
    pub tss_address: [u8; 20],
    pub chain_id: u64,
}


Fields
Name	Type	Documentation
tss_address	[u8; 20]	
chain_id	u64	
Implementations
Trait Implementations
Borrow

fn borrow(self: &Self) -> &T { /* ... */ }

InstructionData

Freeze

UnwindSafe

RefUnwindSafe

Into

fn into(self: Self) -> U { /* ... */ }

Calls U::from(self).
TryInto

fn try_into(self: Self) -> Result<U, <U as TryFrom<T>>::Error> { /* ... */ }

Sync

TryFrom

fn try_from(value: U) -> Result<T, <T as TryFrom<U>>::Error> { /* ... */ }

VZip

fn vzip(self: Self) -> V { /* ... */ }

BorshSerialize

fn serialize<W: borsh::maybestd::io::Write>(self: &Self, writer: &mut W) -> ::core::result::Result<(), borsh::maybestd::io::Error> { /* ... */ }

Any

fn type_id(self: &Self) -> TypeId { /* ... */ }

IntoEither

BorshDeserialize

fn deserialize_reader<R: borsh::maybestd::io::Read>(reader: &mut R) -> ::core::result::Result<Self, borsh::maybestd::io::Error> { /* ... */ }

Discriminator

BorrowMut

fn borrow_mut(self: &mut Self) -> &mut T { /* ... */ }

Same

Owner

fn owner() -> Pubkey { /* ... */ }

Unpin

From

fn from(t: T) -> T { /* ... */ }

Returns the argument unchanged.
Send

Struct IncrementNonce
Instruction.

pub struct IncrementNonce {
    pub amount: u64,
    pub signature: [u8; 64],
    pub recovery_id: u8,
    pub message_hash: [u8; 32],
    pub nonce: u64,
}


Fields
Name	Type	Documentation
amount	u64	
signature	[u8; 64]	
recovery_id	u8	
message_hash	[u8; 32]	
nonce	u64	
Implementations
Trait Implementations
Borrow

fn borrow(self: &Self) -> &T { /* ... */ }

Same

Send

Unpin

RefUnwindSafe

BorrowMut

fn borrow_mut(self: &mut Self) -> &mut T { /* ... */ }

Freeze

From

fn from(t: T) -> T { /* ... */ }

Returns the argument unchanged.
IntoEither

BorshSerialize

fn serialize<W: borsh::maybestd::io::Write>(self: &Self, writer: &mut W) -> ::core::result::Result<(), borsh::maybestd::io::Error> { /* ... */ }

TryInto

fn try_into(self: Self) -> Result<U, <U as TryFrom<T>>::Error> { /* ... */ }

Discriminator

Any

fn type_id(self: &Self) -> TypeId { /* ... */ }

UnwindSafe

TryFrom

fn try_from(value: U) -> Result<T, <T as TryFrom<U>>::Error> { /* ... */ }

Sync

Into

fn into(self: Self) -> U { /* ... */ }

Calls U::from(self).
VZip

fn vzip(self: Self) -> V { /* ... */ }

InstructionData

BorshDeserialize

fn deserialize_reader<R: borsh::maybestd::io::Read>(reader: &mut R) -> ::core::result::Result<Self, borsh::maybestd::io::Error> { /* ... */ }

Owner

fn owner() -> Pubkey { /* ... */ }

Struct Execute
Instruction.

pub struct Execute {
    pub amount: u64,
    pub sender: [u8; 20],
    pub data: Vec<u8>,
    pub signature: [u8; 64],
    pub recovery_id: u8,
    pub message_hash: [u8; 32],
    pub nonce: u64,
}


Fields
Name	Type	Documentation
amount	u64	
sender	[u8; 20]	
data	Vec<u8>	
signature	[u8; 64]	
recovery_id	u8	
message_hash	[u8; 32]	
nonce	u64	
Implementations
Trait Implementations
Owner

fn owner() -> Pubkey { /* ... */ }

IntoEither

Same

TryFrom

fn try_from(value: U) -> Result<T, <T as TryFrom<U>>::Error> { /* ... */ }

Borrow

fn borrow(self: &Self) -> &T { /* ... */ }

Any

fn type_id(self: &Self) -> TypeId { /* ... */ }

BorshSerialize

fn serialize<W: borsh::maybestd::io::Write>(self: &Self, writer: &mut W) -> ::core::result::Result<(), borsh::maybestd::io::Error> { /* ... */ }

Discriminator

RefUnwindSafe

Freeze

From

fn from(t: T) -> T { /* ... */ }

Returns the argument unchanged.
Unpin

BorrowMut

fn borrow_mut(self: &mut Self) -> &mut T { /* ... */ }

UnwindSafe

Sync

Into

fn into(self: Self) -> U { /* ... */ }

Calls U::from(self).
TryInto

fn try_into(self: Self) -> Result<U, <U as TryFrom<T>>::Error> { /* ... */ }

VZip

fn vzip(self: Self) -> V { /* ... */ }

BorshDeserialize

fn deserialize_reader<R: borsh::maybestd::io::Read>(reader: &mut R) -> ::core::result::Result<Self, borsh::maybestd::io::Error> { /* ... */ }

Send

InstructionData

Struct ExecuteRevert
Instruction.

pub struct ExecuteRevert {
    pub amount: u64,
    pub sender: Pubkey,
    pub data: Vec<u8>,
    pub signature: [u8; 64],
    pub recovery_id: u8,
    pub message_hash: [u8; 32],
    pub nonce: u64,
}


Fields
Name	Type	Documentation
amount	u64	
sender	Pubkey	
data	Vec<u8>	
signature	[u8; 64]	
recovery_id	u8	
message_hash	[u8; 32]	
nonce	u64	
Implementations
Trait Implementations
Same

BorshSerialize

fn serialize<W: borsh::maybestd::io::Write>(self: &Self, writer: &mut W) -> ::core::result::Result<(), borsh::maybestd::io::Error> { /* ... */ }

BorshDeserialize

fn deserialize_reader<R: borsh::maybestd::io::Read>(reader: &mut R) -> ::core::result::Result<Self, borsh::maybestd::io::Error> { /* ... */ }

From

fn from(t: T) -> T { /* ... */ }

Returns the argument unchanged.
VZip

fn vzip(self: Self) -> V { /* ... */ }

Sync

InstructionData

UnwindSafe

Borrow

fn borrow(self: &Self) -> &T { /* ... */ }

Freeze

BorrowMut

fn borrow_mut(self: &mut Self) -> &mut T { /* ... */ }

TryFrom

fn try_from(value: U) -> Result<T, <T as TryFrom<U>>::Error> { /* ... */ }

Discriminator

Owner

fn owner() -> Pubkey { /* ... */ }

Unpin

TryInto

fn try_into(self: Self) -> Result<U, <U as TryFrom<T>>::Error> { /* ... */ }

RefUnwindSafe

Into

fn into(self: Self) -> U { /* ... */ }

Calls U::from(self).
Any

fn type_id(self: &Self) -> TypeId { /* ... */ }

IntoEither

Send

Struct ExecuteSplToken
Instruction.

pub struct ExecuteSplToken {
    pub decimals: u8,
    pub amount: u64,
    pub sender: [u8; 20],
    pub data: Vec<u8>,
    pub signature: [u8; 64],
    pub recovery_id: u8,
    pub message_hash: [u8; 32],
    pub nonce: u64,
}


Fields
Name	Type	Documentation
decimals	u8	
amount	u64	
sender	[u8; 20]	
data	Vec<u8>	
signature	[u8; 64]	
recovery_id	u8	
message_hash	[u8; 32]	
nonce	u64	
Implementations
Trait Implementations
TryInto

fn try_into(self: Self) -> Result<U, <U as TryFrom<T>>::Error> { /* ... */ }

Same

Send

Sync

TryFrom

fn try_from(value: U) -> Result<T, <T as TryFrom<U>>::Error> { /* ... */ }

BorrowMut

fn borrow_mut(self: &mut Self) -> &mut T { /* ... */ }

VZip

fn vzip(self: Self) -> V { /* ... */ }

IntoEither

Unpin

Freeze

Any

fn type_id(self: &Self) -> TypeId { /* ... */ }

Into

fn into(self: Self) -> U { /* ... */ }

Calls U::from(self).
InstructionData

RefUnwindSafe

BorshDeserialize

fn deserialize_reader<R: borsh::maybestd::io::Read>(reader: &mut R) -> ::core::result::Result<Self, borsh::maybestd::io::Error> { /* ... */ }

UnwindSafe

Borrow

fn borrow(self: &Self) -> &T { /* ... */ }

BorshSerialize

fn serialize<W: borsh::maybestd::io::Write>(self: &Self, writer: &mut W) -> ::core::result::Result<(), borsh::maybestd::io::Error> { /* ... */ }

Discriminator

Owner

fn owner() -> Pubkey { /* ... */ }

From

fn from(t: T) -> T { /* ... */ }

Returns the argument unchanged.
Struct ExecuteSplTokenRevert
Instruction.

pub struct ExecuteSplTokenRevert {
    pub decimals: u8,
    pub amount: u64,
    pub sender: Pubkey,
    pub data: Vec<u8>,
    pub signature: [u8; 64],
    pub recovery_id: u8,
    pub message_hash: [u8; 32],
    pub nonce: u64,
}


Fields
Name	Type	Documentation
decimals	u8	
amount	u64	
sender	Pubkey	
data	Vec<u8>	
signature	[u8; 64]	
recovery_id	u8	
message_hash	[u8; 32]	
nonce	u64	
Implementations
Trait Implementations
TryInto

fn try_into(self: Self) -> Result<U, <U as TryFrom<T>>::Error> { /* ... */ }

BorshSerialize

fn serialize<W: borsh::maybestd::io::Write>(self: &Self, writer: &mut W) -> ::core::result::Result<(), borsh::maybestd::io::Error> { /* ... */ }

BorshDeserialize

fn deserialize_reader<R: borsh::maybestd::io::Read>(reader: &mut R) -> ::core::result::Result<Self, borsh::maybestd::io::Error> { /* ... */ }

Borrow

fn borrow(self: &Self) -> &T { /* ... */ }

UnwindSafe

RefUnwindSafe

BorrowMut

fn borrow_mut(self: &mut Self) -> &mut T { /* ... */ }

From

fn from(t: T) -> T { /* ... */ }

Returns the argument unchanged.
Unpin

TryFrom

fn try_from(value: U) -> Result<T, <T as TryFrom<U>>::Error> { /* ... */ }

Same

Discriminator

Owner

fn owner() -> Pubkey { /* ... */ }

Any

fn type_id(self: &Self) -> TypeId { /* ... */ }

VZip

fn vzip(self: Self) -> V { /* ... */ }

Into

fn into(self: Self) -> U { /* ... */ }

Calls U::from(self).
InstructionData

Freeze

IntoEither

Send

Sync

Struct SetDepositPaused
Instruction.

pub struct SetDepositPaused {
    pub deposit_paused: bool,
}


Fields
Name	Type	Documentation
deposit_paused	bool	
Implementations
Trait Implementations
BorshSerialize

fn serialize<W: borsh::maybestd::io::Write>(self: &Self, writer: &mut W) -> ::core::result::Result<(), borsh::maybestd::io::Error> { /* ... */ }

Send

Freeze

Unpin

Into

fn into(self: Self) -> U { /* ... */ }

Calls U::from(self).
UnwindSafe

Any

fn type_id(self: &Self) -> TypeId { /* ... */ }

BorshDeserialize

fn deserialize_reader<R: borsh::maybestd::io::Read>(reader: &mut R) -> ::core::result::Result<Self, borsh::maybestd::io::Error> { /* ... */ }

Discriminator

TryInto

fn try_into(self: Self) -> Result<U, <U as TryFrom<T>>::Error> { /* ... */ }

TryFrom

fn try_from(value: U) -> Result<T, <T as TryFrom<U>>::Error> { /* ... */ }

Same

VZip

fn vzip(self: Self) -> V { /* ... */ }

Sync

IntoEither

Owner

fn owner() -> Pubkey { /* ... */ }

InstructionData

RefUnwindSafe

Borrow

fn borrow(self: &Self) -> &T { /* ... */ }

BorrowMut

fn borrow_mut(self: &mut Self) -> &mut T { /* ... */ }

From

fn from(t: T) -> T { /* ... */ }

Returns the argument unchanged.
Struct UpdateTss
Instruction.

pub struct UpdateTss {
    pub tss_address: [u8; 20],
}


Fields
Name	Type	Documentation
tss_address	[u8; 20]	
Implementations
Trait Implementations
Same

InstructionData

Unpin

TryInto

fn try_into(self: Self) -> Result<U, <U as TryFrom<T>>::Error> { /* ... */ }

Discriminator

Freeze

Into

fn into(self: Self) -> U { /* ... */ }

Calls U::from(self).
TryFrom

fn try_from(value: U) -> Result<T, <T as TryFrom<U>>::Error> { /* ... */ }

VZip

fn vzip(self: Self) -> V { /* ... */ }

Send

BorrowMut

fn borrow_mut(self: &mut Self) -> &mut T { /* ... */ }

Owner

fn owner() -> Pubkey { /* ... */ }

Any

fn type_id(self: &Self) -> TypeId { /* ... */ }

Borrow

fn borrow(self: &Self) -> &T { /* ... */ }

Sync

IntoEither

From

fn from(t: T) -> T { /* ... */ }

Returns the argument unchanged.
BorshSerialize

fn serialize<W: borsh::maybestd::io::Write>(self: &Self, writer: &mut W) -> ::core::result::Result<(), borsh::maybestd::io::Error> { /* ... */ }

UnwindSafe

RefUnwindSafe

BorshDeserialize

fn deserialize_reader<R: borsh::maybestd::io::Read>(reader: &mut R) -> ::core::result::Result<Self, borsh::maybestd::io::Error> { /* ... */ }

Struct UpdateAuthority
Instruction.

pub struct UpdateAuthority {
    pub new_authority_address: Pubkey,
}


Fields
Name	Type	Documentation
new_authority_address	Pubkey	
Implementations
Trait Implementations
Send

UnwindSafe

RefUnwindSafe

Borrow

fn borrow(self: &Self) -> &T { /* ... */ }

Any

fn type_id(self: &Self) -> TypeId { /* ... */ }

VZip

fn vzip(self: Self) -> V { /* ... */ }

Sync

TryFrom

fn try_from(value: U) -> Result<T, <T as TryFrom<U>>::Error> { /* ... */ }

Owner

fn owner() -> Pubkey { /* ... */ }

Into

fn into(self: Self) -> U { /* ... */ }

Calls U::from(self).
Same

Freeze

Unpin

BorrowMut

fn borrow_mut(self: &mut Self) -> &mut T { /* ... */ }

IntoEither

Discriminator

BorshDeserialize

fn deserialize_reader<R: borsh::maybestd::io::Read>(reader: &mut R) -> ::core::result::Result<Self, borsh::maybestd::io::Error> { /* ... */ }

TryInto

fn try_into(self: Self) -> Result<U, <U as TryFrom<T>>::Error> { /* ... */ }

InstructionData

BorshSerialize

fn serialize<W: borsh::maybestd::io::Write>(self: &Self, writer: &mut W) -> ::core::result::Result<(), borsh::maybestd::io::Error> { /* ... */ }

From

fn from(t: T) -> T { /* ... */ }

Returns the argument unchanged.
Struct ResetNonce
Instruction.

pub struct ResetNonce {
    pub new_nonce: u64,
}


Fields
Name	Type	Documentation
new_nonce	u64	
Implementations
Trait Implementations
Same

Borrow

fn borrow(self: &Self) -> &T { /* ... */ }

IntoEither

Freeze

Owner

fn owner() -> Pubkey { /* ... */ }

UnwindSafe

RefUnwindSafe

Any

fn type_id(self: &Self) -> TypeId { /* ... */ }

BorshDeserialize

fn deserialize_reader<R: borsh::maybestd::io::Read>(reader: &mut R) -> ::core::result::Result<Self, borsh::maybestd::io::Error> { /* ... */ }

InstructionData

Sync

BorrowMut

fn borrow_mut(self: &mut Self) -> &mut T { /* ... */ }

TryFrom

fn try_from(value: U) -> Result<T, <T as TryFrom<U>>::Error> { /* ... */ }

Unpin

VZip

fn vzip(self: Self) -> V { /* ... */ }

From

fn from(t: T) -> T { /* ... */ }

Returns the argument unchanged.
TryInto

fn try_into(self: Self) -> Result<U, <U as TryFrom<T>>::Error> { /* ... */ }

Send

Into

fn into(self: Self) -> U { /* ... */ }

Calls U::from(self).
BorshSerialize

fn serialize<W: borsh::maybestd::io::Write>(self: &Self, writer: &mut W) -> ::core::result::Result<(), borsh::maybestd::io::Error> { /* ... */ }

Discriminator

Struct WhitelistSplMint
Instruction.

pub struct WhitelistSplMint {
    pub signature: [u8; 64],
    pub recovery_id: u8,
    pub message_hash: [u8; 32],
    pub nonce: u64,
}


Fields
Name	Type	Documentation
signature	[u8; 64]	
recovery_id	u8	
message_hash	[u8; 32]	
nonce	u64	
Implementations
Trait Implementations
TryFrom

fn try_from(value: U) -> Result<T, <T as TryFrom<U>>::Error> { /* ... */ }

UnwindSafe

Discriminator

BorshDeserialize

fn deserialize_reader<R: borsh::maybestd::io::Read>(reader: &mut R) -> ::core::result::Result<Self, borsh::maybestd::io::Error> { /* ... */ }

Same

RefUnwindSafe

Borrow

fn borrow(self: &Self) -> &T { /* ... */ }

TryInto

fn try_into(self: Self) -> Result<U, <U as TryFrom<T>>::Error> { /* ... */ }

Send

InstructionData

BorrowMut

fn borrow_mut(self: &mut Self) -> &mut T { /* ... */ }

VZip

fn vzip(self: Self) -> V { /* ... */ }

Any

fn type_id(self: &Self) -> TypeId { /* ... */ }

BorshSerialize

fn serialize<W: borsh::maybestd::io::Write>(self: &Self, writer: &mut W) -> ::core::result::Result<(), borsh::maybestd::io::Error> { /* ... */ }

Owner

fn owner() -> Pubkey { /* ... */ }

Freeze

Unpin

IntoEither

Into

fn into(self: Self) -> U { /* ... */ }

Calls U::from(self).
From

fn from(t: T) -> T { /* ... */ }

Returns the argument unchanged.
Sync

Struct UnwhitelistSplMint
Instruction.

pub struct UnwhitelistSplMint {
    pub signature: [u8; 64],
    pub recovery_id: u8,
    pub message_hash: [u8; 32],
    pub nonce: u64,
}


Fields
Name	Type	Documentation
signature	[u8; 64]	
recovery_id	u8	
message_hash	[u8; 32]	
nonce	u64	
Implementations
Trait Implementations
BorrowMut

fn borrow_mut(self: &mut Self) -> &mut T { /* ... */ }

TryFrom

fn try_from(value: U) -> Result<T, <T as TryFrom<U>>::Error> { /* ... */ }

Owner

fn owner() -> Pubkey { /* ... */ }

Send

Any

fn type_id(self: &Self) -> TypeId { /* ... */ }

Unpin

Same

Discriminator

Borrow

fn borrow(self: &Self) -> &T { /* ... */ }

IntoEither

Freeze

Sync

TryInto

fn try_into(self: Self) -> Result<U, <U as TryFrom<T>>::Error> { /* ... */ }

VZip

fn vzip(self: Self) -> V { /* ... */ }

InstructionData

Into

fn into(self: Self) -> U { /* ... */ }

Calls U::from(self).
From

fn from(t: T) -> T { /* ... */ }

Returns the argument unchanged.
BorshSerialize

fn serialize<W: borsh::maybestd::io::Write>(self: &Self, writer: &mut W) -> ::core::result::Result<(), borsh::maybestd::io::Error> { /* ... */ }

BorshDeserialize

fn deserialize_reader<R: borsh::maybestd::io::Read>(reader: &mut R) -> ::core::result::Result<Self, borsh::maybestd::io::Error> { /* ... */ }

RefUnwindSafe

UnwindSafe

Struct Deposit
Instruction.

pub struct Deposit {
    pub amount: u64,
    pub receiver: [u8; 20],
    pub revert_options: Option<RevertOptions>,
}


Fields
Name	Type	Documentation
amount	u64	
receiver	[u8; 20]	
revert_options	Option<RevertOptions>	
Implementations
Trait Implementations
Into

fn into(self: Self) -> U { /* ... */ }

Calls U::from(self).
BorshSerialize

fn serialize<W: borsh::maybestd::io::Write>(self: &Self, writer: &mut W) -> ::core::result::Result<(), borsh::maybestd::io::Error> { /* ... */ }

Owner

fn owner() -> Pubkey { /* ... */ }

RefUnwindSafe

Unpin

BorshDeserialize

fn deserialize_reader<R: borsh::maybestd::io::Read>(reader: &mut R) -> ::core::result::Result<Self, borsh::maybestd::io::Error> { /* ... */ }

VZip

fn vzip(self: Self) -> V { /* ... */ }

TryFrom

fn try_from(value: U) -> Result<T, <T as TryFrom<U>>::Error> { /* ... */ }

Borrow

fn borrow(self: &Self) -> &T { /* ... */ }

Discriminator

InstructionData

Freeze

BorrowMut

fn borrow_mut(self: &mut Self) -> &mut T { /* ... */ }

Any

fn type_id(self: &Self) -> TypeId { /* ... */ }

UnwindSafe

Sync

Send

TryInto

fn try_into(self: Self) -> Result<U, <U as TryFrom<T>>::Error> { /* ... */ }

IntoEither

From

fn from(t: T) -> T { /* ... */ }

Returns the argument unchanged.
Same

Struct DepositAndCall
Instruction.

pub struct DepositAndCall {
    pub amount: u64,
    pub receiver: [u8; 20],
    pub message: Vec<u8>,
    pub revert_options: Option<RevertOptions>,
}


Fields
Name	Type	Documentation
amount	u64	
receiver	[u8; 20]	
message	Vec<u8>	
revert_options	Option<RevertOptions>	
Implementations
Trait Implementations
From

fn from(t: T) -> T { /* ... */ }

Returns the argument unchanged.
Sync

UnwindSafe

BorrowMut

fn borrow_mut(self: &mut Self) -> &mut T { /* ... */ }

Into

fn into(self: Self) -> U { /* ... */ }

Calls U::from(self).
BorshDeserialize

fn deserialize_reader<R: borsh::maybestd::io::Read>(reader: &mut R) -> ::core::result::Result<Self, borsh::maybestd::io::Error> { /* ... */ }

TryFrom

fn try_from(value: U) -> Result<T, <T as TryFrom<U>>::Error> { /* ... */ }

Any

fn type_id(self: &Self) -> TypeId { /* ... */ }

Discriminator

Freeze

Same

VZip

fn vzip(self: Self) -> V { /* ... */ }

IntoEither

Owner

fn owner() -> Pubkey { /* ... */ }

Borrow

fn borrow(self: &Self) -> &T { /* ... */ }

BorshSerialize

fn serialize<W: borsh::maybestd::io::Write>(self: &Self, writer: &mut W) -> ::core::result::Result<(), borsh::maybestd::io::Error> { /* ... */ }

InstructionData

RefUnwindSafe

Send

Unpin

TryInto

fn try_into(self: Self) -> Result<U, <U as TryFrom<T>>::Error> { /* ... */ }

Struct DepositSplToken
Instruction.

pub struct DepositSplToken {
    pub amount: u64,
    pub receiver: [u8; 20],
    pub revert_options: Option<RevertOptions>,
}


Fields
Name	Type	Documentation
amount	u64	
receiver	[u8; 20]	
revert_options	Option<RevertOptions>	
Implementations
Trait Implementations
Borrow

fn borrow(self: &Self) -> &T { /* ... */ }

BorshDeserialize

fn deserialize_reader<R: borsh::maybestd::io::Read>(reader: &mut R) -> ::core::result::Result<Self, borsh::maybestd::io::Error> { /* ... */ }

BorshSerialize

fn serialize<W: borsh::maybestd::io::Write>(self: &Self, writer: &mut W) -> ::core::result::Result<(), borsh::maybestd::io::Error> { /* ... */ }

TryInto

fn try_into(self: Self) -> Result<U, <U as TryFrom<T>>::Error> { /* ... */ }

BorrowMut

fn borrow_mut(self: &mut Self) -> &mut T { /* ... */ }

Sync

Discriminator

Freeze

IntoEither

Owner

fn owner() -> Pubkey { /* ... */ }

RefUnwindSafe

Into

fn into(self: Self) -> U { /* ... */ }

Calls U::from(self).
From

fn from(t: T) -> T { /* ... */ }

Returns the argument unchanged.
Same

VZip

fn vzip(self: Self) -> V { /* ... */ }

Send

InstructionData

TryFrom

fn try_from(value: U) -> Result<T, <T as TryFrom<U>>::Error> { /* ... */ }

Any

fn type_id(self: &Self) -> TypeId { /* ... */ }

UnwindSafe

Unpin

Struct DepositSplTokenAndCall
Instruction.

pub struct DepositSplTokenAndCall {
    pub amount: u64,
    pub receiver: [u8; 20],
    pub message: Vec<u8>,
    pub revert_options: Option<RevertOptions>,
}


Fields
Name	Type	Documentation
amount	u64	
receiver	[u8; 20]	
message	Vec<u8>	
revert_options	Option<RevertOptions>	
Implementations
Trait Implementations
Freeze

Discriminator

Sync

Unpin

From

fn from(t: T) -> T { /* ... */ }

Returns the argument unchanged.
RefUnwindSafe

VZip

fn vzip(self: Self) -> V { /* ... */ }

BorshSerialize

fn serialize<W: borsh::maybestd::io::Write>(self: &Self, writer: &mut W) -> ::core::result::Result<(), borsh::maybestd::io::Error> { /* ... */ }

UnwindSafe

BorshDeserialize

fn deserialize_reader<R: borsh::maybestd::io::Read>(reader: &mut R) -> ::core::result::Result<Self, borsh::maybestd::io::Error> { /* ... */ }

TryFrom

fn try_from(value: U) -> Result<T, <T as TryFrom<U>>::Error> { /* ... */ }

Borrow

fn borrow(self: &Self) -> &T { /* ... */ }

InstructionData

Owner

fn owner() -> Pubkey { /* ... */ }

Any

fn type_id(self: &Self) -> TypeId { /* ... */ }

Send

Into

fn into(self: Self) -> U { /* ... */ }

Calls U::from(self).
IntoEither

BorrowMut

fn borrow_mut(self: &mut Self) -> &mut T { /* ... */ }

Same

TryInto

fn try_into(self: Self) -> Result<U, <U as TryFrom<T>>::Error> { /* ... */ }

Struct Call
Instruction.

pub struct Call {
    pub receiver: [u8; 20],
    pub message: Vec<u8>,
    pub revert_options: Option<RevertOptions>,
}


Fields
Name	Type	Documentation
receiver	[u8; 20]	
message	Vec<u8>	
revert_options	Option<RevertOptions>	
Implementations
Trait Implementations
BorshDeserialize

fn deserialize_reader<R: borsh::maybestd::io::Read>(reader: &mut R) -> ::core::result::Result<Self, borsh::maybestd::io::Error> { /* ... */ }

Freeze

Any

fn type_id(self: &Self) -> TypeId { /* ... */ }

Send

Into

fn into(self: Self) -> U { /* ... */ }

Calls U::from(self).
TryFrom

fn try_from(value: U) -> Result<T, <T as TryFrom<U>>::Error> { /* ... */ }

Sync

VZip

fn vzip(self: Self) -> V { /* ... */ }

IntoEither

BorshSerialize

fn serialize<W: borsh::maybestd::io::Write>(self: &Self, writer: &mut W) -> ::core::result::Result<(), borsh::maybestd::io::Error> { /* ... */ }

Discriminator

InstructionData

Owner

fn owner() -> Pubkey { /* ... */ }

Same

Unpin

From

fn from(t: T) -> T { /* ... */ }

Returns the argument unchanged.
TryInto

fn try_into(self: Self) -> Result<U, <U as TryFrom<T>>::Error> { /* ... */ }

BorrowMut

fn borrow_mut(self: &mut Self) -> &mut T { /* ... */ }

RefUnwindSafe

Borrow

fn borrow(self: &Self) -> &T { /* ... */ }

UnwindSafe

Struct Withdraw
Instruction.

pub struct Withdraw {
    pub amount: u64,
    pub signature: [u8; 64],
    pub recovery_id: u8,
    pub message_hash: [u8; 32],
    pub nonce: u64,
}


Fields
Name	Type	Documentation
amount	u64	
signature	[u8; 64]	
recovery_id	u8	
message_hash	[u8; 32]	
nonce	u64	
Implementations
Trait Implementations
Into

fn into(self: Self) -> U { /* ... */ }

Calls U::from(self).
Same

Unpin

Send

TryInto

fn try_into(self: Self) -> Result<U, <U as TryFrom<T>>::Error> { /* ... */ }

UnwindSafe

Any

fn type_id(self: &Self) -> TypeId { /* ... */ }

IntoEither

BorshSerialize

fn serialize<W: borsh::maybestd::io::Write>(self: &Self, writer: &mut W) -> ::core::result::Result<(), borsh::maybestd::io::Error> { /* ... */ }

TryFrom

fn try_from(value: U) -> Result<T, <T as TryFrom<U>>::Error> { /* ... */ }

BorrowMut

fn borrow_mut(self: &mut Self) -> &mut T { /* ... */ }

Borrow

fn borrow(self: &Self) -> &T { /* ... */ }

InstructionData

Owner

fn owner() -> Pubkey { /* ... */ }

Freeze

Sync

RefUnwindSafe

VZip

fn vzip(self: Self) -> V { /* ... */ }

BorshDeserialize

fn deserialize_reader<R: borsh::maybestd::io::Read>(reader: &mut R) -> ::core::result::Result<Self, borsh::maybestd::io::Error> { /* ... */ }

Discriminator

From

fn from(t: T) -> T { /* ... */ }

Returns the argument unchanged.
Struct WithdrawSplToken
Instruction.

pub struct WithdrawSplToken {
    pub decimals: u8,
    pub amount: u64,
    pub signature: [u8; 64],
    pub recovery_id: u8,
    pub message_hash: [u8; 32],
    pub nonce: u64,
}


Fields
Name	Type	Documentation
decimals	u8	
amount	u64	
signature	[u8; 64]	
recovery_id	u8	
message_hash	[u8; 32]	
nonce	u64	
Implementations
Trait Implementations
Any

fn type_id(self: &Self) -> TypeId { /* ... */ }

IntoEither

BorshSerialize

fn serialize<W: borsh::maybestd::io::Write>(self: &Self, writer: &mut W) -> ::core::result::Result<(), borsh::maybestd::io::Error> { /* ... */ }

Unpin

From

fn from(t: T) -> T { /* ... */ }

Returns the argument unchanged.
Borrow

fn borrow(self: &Self) -> &T { /* ... */ }

Discriminator

InstructionData

Owner

fn owner() -> Pubkey { /* ... */ }

VZip

fn vzip(self: Self) -> V { /* ... */ }

Send

RefUnwindSafe

Same

Freeze

BorshDeserialize

fn deserialize_reader<R: borsh::maybestd::io::Read>(reader: &mut R) -> ::core::result::Result<Self, borsh::maybestd::io::Error> { /* ... */ }

Into

fn into(self: Self) -> U { /* ... */ }

Calls U::from(self).
Sync

BorrowMut

fn borrow_mut(self: &mut Self) -> &mut T { /* ... */ }

TryInto

fn try_into(self: Self) -> Result<U, <U as TryFrom<T>>::Error> { /* ... */ }

UnwindSafe

TryFrom

fn try_from(value: U) -> Result<T, <T as TryFrom<U>>::Error> { /* ... */ }

Module accounts
An Anchor generated module, providing a set of structs mirroring the structs deriving Accounts, where each field is a Pubkey. This is useful for specifying accounts for a client.

pub mod accounts { /* ... */ }

Re-exports
Re-export crate::__client_accounts_deposit_spl_token::*
pub use crate::__client_accounts_deposit_spl_token::*;

Re-export crate::__client_accounts_call::*
pub use crate::__client_accounts_call::*;

Re-export crate::__client_accounts_initialize::*
pub use crate::__client_accounts_initialize::*;

Re-export crate::__client_accounts_whitelist::*
pub use crate::__client_accounts_whitelist::*;

Re-export crate::__client_accounts_update_authority::*
pub use crate::__client_accounts_update_authority::*;

Re-export crate::__client_accounts_unwhitelist::*
pub use crate::__client_accounts_unwhitelist::*;

Re-export crate::__client_accounts_execute::*
pub use crate::__client_accounts_execute::*;

Re-export crate::__client_accounts_withdraw_spl_token::*
pub use crate::__client_accounts_withdraw_spl_token::*;

Re-export crate::__client_accounts_withdraw::*
pub use crate::__client_accounts_withdraw::*;

Re-export crate::__client_accounts_update_tss::*
pub use crate::__client_accounts_update_tss::*;

Re-export crate::__client_accounts_deposit::*
pub use crate::__client_accounts_deposit::*;

Re-export crate::__client_accounts_update_paused::*
pub use crate::__client_accounts_update_paused::*;

Re-export crate::__client_accounts_execute_spl_token::*
pub use crate::__client_accounts_execute_spl_token::*;

Re-export crate::__client_accounts_increment_nonce::*
pub use crate::__client_accounts_increment_nonce::*;

Re-export crate::__client_accounts_reset_nonce::*
pub use crate::__client_accounts_reset_nonce::*;

Functions
Function check_id
Confirms that a given pubkey is equivalent to the program ID

pub fn check_id(id: &anchor_lang::solana_program::pubkey::Pubkey) -> bool { /* ... */ }

Function id
Returns the program ID

pub fn id() -> anchor_lang::solana_program::pubkey::Pubkey { /* ... */ }

Function id_const
Const version of ID

pub const fn id_const() -> anchor_lang::solana_program::pubkey::Pubkey { /* ... */ }

Function entrypoint
Attributes:

#[no_mangle]
Safety
pub unsafe extern "C" fn entrypoint(input: *mut u8) -> u64 { /* ... */ }

Function entry
The Anchor codegen exposes a programming model where a user defines a set of methods inside of a #[program] module in a way similar to writing RPC request handlers. The macro then generates a bunch of code wrapping these user defined methods into something that can be executed on Solana.

These methods fall into one category for now.

Global methods - regular methods inside of the #[program].

Care must be taken by the codegen to prevent collisions between methods in these different namespaces. For this reason, Anchor uses a variant of sighash to perform method dispatch, rather than something like a simple enum variant discriminator.

The execution flow of the generated code can be roughly outlined:

Start program via the entrypoint.
Check whether the declared program id matches the input program id. If it's not, return an error.
Find and invoke the method based on whether the instruction data starts with the method's discriminator.
Run the method handler wrapper. This wraps the code the user actually wrote, deserializing the accounts, constructing the context, invoking the user's code, and finally running the exit routine, which typically persists account changes.
The entry function here, defines the standard entry to a Solana program, where execution begins.

pub fn entry<''info>(program_id: &Pubkey, accounts: &''info [AccountInfo<''info>], data: &[u8]) -> anchor_lang::solana_program::entrypoint::ProgramResult { /* ... */ }

Constants and Statics
Static ID
The static program ID

pub static ID: anchor_lang::solana_program::pubkey::Pubkey = _;

Constant ID_CONST
Const version of ID

pub const ID_CONST: anchor_lang::solana_program::pubkey::Pubkey = _;

Re-exports
Re-export DEPOSIT_FEE
pub use utils::DEPOSIT_FEE;

Re-export contexts::*
pub use contexts::*;

Re-export errors::*
pub use errors::*;

Re-export state::*
pub use state::*;

Architecture
Overview of the architecture of ZetaChain
Overview
At a high level, ZetaChain is a Proof of Stake (PoS) blockchain built on the Cosmos SDK and Comet BFT consensus engine. As a result, ZetaChain enjoys fast block time (~5s) and instant finality (no confirmation needed, no re-organization allowed). The Comet BFT consensus engine has shown to scale to ~300 nodes in production. With future upgrades with BLS threshold signatures the number can potentially increase to 1000+. The throughput of transactions on ZetaChain can potentially reach 100 transactions per second TPS due to the efficiency of the consensus protocol.

The ZetaChain architecture consists of a distributed network of nodes, often referred to as validators. Validators act as decentralized observers that reach consensus on relevant connected chain state and events, and can also update connected chain state via distributed key signing. ZetaChain accomplishes these functions in a decentralized (without a single point of failure, trustless, permissionless), transparent, and efficient way.

Contained within each validator is the ZetaCore and ZetaClient. ZetaCore is responsible for producing the blockchain and maintaining the replicated state machine. ZetaClient is responsible for observing events on connected chains and signing outbound transactions.

ZetaCore and ZetaClient are bundled together and run by node operators. Anyone can become a node operator to participate in validation provided that enough bonds are staked.



Validators
Validators are comprised of 2 different roles: Core Validators and Observer-Signer Validators. Fees from transactions and rewards are distributed to validators in return for their service of processing transactions and keeping the network secure.

Core Validators
ZetaChain uses the Comet BFT consensus protocol which is a partially synchronous Byzantine Fault Tolerant (BFT) consensus algorithm. Each validator node can vote on block proposals with voting power proportional to the staking coins (ZETA), bonded/delegated. Each validator is identified by its consensus public key. Validators need to be online all the time, ready to participate in the constantly growing block production. In exchange for their service, validators will receive block rewards and transaction fees.

Observer-Signer Validators
Another set of important participants for ZetaChain consensus are the observer-signer validators who reach consensus on connected chain events and states. The observer-signers watch connected chains for certain relevant transactions/events/states at particular addresses via their full nodes of connected chains.

ZetaChain collectively holds standard ECDSA/EdDSA keys for authenticated interaction with connected chains. The keys are distributed among multiple observer-signers in such a way that only a super majority of them can sign on behalf of the ZetaChain. The ZetaChain system uses bonded stakes and positive/negative incentives to ensure economic safety.

# 🏗 Scaffold-Alchemy by UMainLove

## THIS FORK CONTAINS EIP-7702 SUPPORT WITH METAMASK WALLETS

Scaffold-Alchemy is a fork of the popular starter project [Scaffold-Eth 2](https://scaffoldeth.io/). It is everything you need to build dApps on Ethereum. You can get started immediately NextJS, TypeScript, Hardhat, AccountKit, Enhanced APIs and Subgraphs 🤩

The beauty of Scaffold Alchemy is that you can have lightning fast iteration between your smart contracts and web application code. Make changes to your contracts and immediately you'll have hooks, components and types that recognize these changes.

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v22.0)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart

To get started with Scaffold-Alchemy, follow the steps below:

Install the latest version of Scaffold-Alchemy

```bash
npx create-web3-dapp
```

In a terminal, deploy the test contract:

```bash
yarn deploy
```

This command deploys a test smart contract to a testnet. You can see the default testnet in `packages/hardhat/hardhat/config.ts`

In a second terminal, start your NextJS app:

```bash
yarn start
```

Visit your app on: `http://localhost:56900`. You can interact with your smart contract using the `Debug Contracts` page. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.

## Additional Features

- Added deployment button for Modular Smart Contract Accounts (erc4337 + erc6900)
- Added eip-7702 upgrade button for connected EOA (Tested with: Metamask Wallets on Ethereum Sepolia testnet, private key required)
- Smart Wallets (EOA + eip7702 + erc4337) interactions fully supported

## Documentation

Visit [docs](https://docs.alchemy.com/docs/scaffold-alchemy) to learn all the technical details and guides of Scaffold-Alchemy.

Visit [EIP-7702](https://eips.ethereum.org/EIPS/eip-7702) to learn more about this Ethereum Improvement Proposal.

Visit [Implementation](https://www.alchemy.com/docs/wallets/react/using-7702) to learn how eip-7702 could be implemented using Alchemy.

## Contributing to Scaffold-Alchemy

Please see [CONTRIBUTING.MD](https://github.com/alchemyplatform/scaffold-alchemy/blob/main/CONTRIBUTING.md) for more information and guidelines for contributing to Scaffold-Alchemy.

/* eslint-disable prettier/prettier */

import { alchemyEnhancedApiActions } from "@account-kit/infra";
import { UseSmartAccountClientProps, useSmartAccountClient } from "@account-kit/react";
import { Alchemy, Network } from "alchemy-sdk";
import scaffoldConfig from "~~/scaffold.config";
import { RPC_CHAIN_NAMES } from "~~/utils/scaffold-alchemy";
import { useSmartWalletClient } from "./useSmartWalletClient"; // feature_1_part_3

export const useClient = (
  config: UseSmartAccountClientProps = {
    type: "MultiOwnerModularAccount",
  },
) => {

  /*
  const { client, address } = useSmartAccountClient(config);
  const alchemy = new Alchemy({
    url: client?.transport.alchemyRpcUrl,
    network: RPC_CHAIN_NAMES[scaffoldConfig.targetNetworks[0].id] as Network,
  });
  const enhancedApiDecorator = alchemyEnhancedApiActions(alchemy);
  return { client: client?.extend(enhancedApiDecorator as any), origClient: client, address };
};
*/
  // Get Smart Account client (for social login users)
  const { client: smartAccountClient, address: smartAccountAddress } = useSmartAccountClient(config);

  // Get Smart Wallet client (for EIP-7702 upgraded EOAs)
  const { client: smartWalletClient, address: smartWalletAddress, isSmartWallet } = useSmartWalletClient();

  // Determine which client to use
  // Priority: Smart Wallet client (if available) > Smart Account client
  const client = smartWalletClient || smartAccountClient;
  const address = smartWalletClient ? smartWalletAddress : smartAccountAddress;

  // Set up Alchemy enhanced API
  let enhancedClient = null;
  if (client) {
    const alchemy = new Alchemy({
      url: client.transport.alchemyRpcUrl,
      network: RPC_CHAIN_NAMES[scaffoldConfig.targetNetworks[0].id] as Network,
    });
    const enhancedApiDecorator = alchemyEnhancedApiActions(alchemy);
    enhancedClient = client.extend(enhancedApiDecorator as any);
  }

  return {
    client: enhancedClient,
    origClient: client,
    address,
    // Export isSmartWallet so useAccountType can use it without circular dependency
    isSmartWallet,
  };
};
  

export type Client = ReturnType<typeof useClient>["client"];

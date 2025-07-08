/* eslint-disable prettier/prettier */

// feature_1_part_3: Smart Wallet Client for EIP-7702 upgraded EOAs

import { useState, useEffect } from "react";
import { createAlchemySmartAccountClient } from "@account-kit/infra";
import { createModularAccountV2 } from "@account-kit/smart-contracts";
import { WalletClientSigner } from "@aa-sdk/core";
import { alchemy, sepolia, mainnet } from "@account-kit/infra";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { ALCHEMY_CONFIG } from "@scaffold-alchemy/shared";
import { useTargetNetwork } from "./useTargetNetwork";
import { createWalletClient, custom, type Hex } from "viem";
import { EIP7702_CONFIG } from "~~/utils/scaffold-alchemy/eip7702.config";

export const useSmartWalletClient = () => {
    const [client, setClient] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasCode, setHasCode] = useState(false);

    const { address, connector } = useAccount();
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    const { targetNetwork } = useTargetNetwork();

    const isMetaMaskConnected = connector?.name?.toLowerCase().includes("metamask") || connector?.id === "injected";
    const isEIP7702Supported = EIP7702_CONFIG.supportedChains.includes(targetNetwork.id as (1 | 11155111));

    // Check for bytecode at address (indicates upgraded Smart Wallet)
    useEffect(() => {
        const checkBytecode = async () => {
            if (!address || !publicClient) {
                setHasCode(false);
                return;
            }

            try {
                const code = await publicClient.getCode({
                    address: address as `0x${string}`,
                    blockTag: 'latest'
                });
                const codeExists = code !== undefined && code !== "0x";
                setHasCode(codeExists);
                console.log("[Smart Wallet Client] Bytecode check:", { address, hasCode: codeExists });
            } catch (error) {
                console.error("[Smart Wallet Client] Error checking bytecode:", error);
                setHasCode(false);
            }
        };

        checkBytecode();
    }, [address, publicClient]);

    // Determine if this is a Smart Wallet (EOA with bytecode)
    const isSmartWallet = hasCode && isMetaMaskConnected;

    useEffect(() => {
        const initializeSmartWalletClient = async () => {
            // Reset state
            setIsLoading(true);
            setError(null);

            // Check if we should create a Smart Wallet client
            if (!isSmartWallet || !walletClient || !address || !isEIP7702Supported) {
                console.log("[Smart Wallet Client] Conditions not met:", {
                    isSmartWallet,
                    hasWalletClient: !!walletClient,
                    hasAddress: !!address,
                    isEIP7702Supported,
                    hasCode,
                });
                setClient(null);
                setIsLoading(false);
                return;
            }

            try {
                console.log("[Smart Wallet Client] Initializing client for upgraded Smart Wallet...");

                // Create a custom wallet client for MetaMask
                const customWalletClient = createWalletClient({
                    account: address as Hex,
                    chain: targetNetwork.id === 1 ? mainnet : sepolia,
                    transport: custom(window.ethereum!),
                });

                // Create the signer
                const signer = new WalletClientSigner(customWalletClient, "metamask");

                // Use the correct chain from @account-kit/infra
                const alchemyChain = targetNetwork.id === 1 ? mainnet : sepolia;

                // Get the API key and policy ID from the shared config
                const apiKey = ALCHEMY_CONFIG.ALCHEMY_API_KEY;
                const policyId = ALCHEMY_CONFIG.ALCHEMY_GAS_POLICY_ID;

                // Create the transport
                const transport = alchemy({
                    apiKey,
                });

                // Create the Modular Account V2 in 7702 mode
                const account = await createModularAccountV2({
                    signer,
                    chain: alchemyChain,
                    transport,
                    mode: "7702", // Key parameter for EIP-7702
                    accountAddress: address as Hex, // Use existing address since it's already upgraded
                });

                // Create the Alchemy Smart Account Client
                const smartWalletClient = createAlchemySmartAccountClient({
                    account,
                    chain: alchemyChain,
                    transport,
                    policyId,
                });

                setClient(smartWalletClient);
                console.log("[Smart Wallet Client] Client initialized successfully for address:", address);
            } catch (err: any) {
                console.error("[Smart Wallet Client] Failed to initialize client:", err);
                setError(err.message || "Failed to initialize Smart Wallet client");
                setClient(null);
            } finally {
                setIsLoading(false);
            }
        };

        initializeSmartWalletClient();
    }, [walletClient, address, targetNetwork.id, isSmartWallet, isEIP7702Supported, hasCode]);

    return {
        client,
        isLoading,
        error,
        isSmartWallet,
        address,
    };
};
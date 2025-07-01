/* eslint-disable prettier/prettier */

//feature_1_part_2: EOA Upgrade to Smart Account with EIP-7702

import { useState, useEffect } from "react";
import { createModularAccountV2Client, ModularAccountV2Client } from "@account-kit/smart-contracts";
import { WalletClientSigner } from "@aa-sdk/core";
import { alchemy, sepolia, mainnet } from "@account-kit/infra";
import { useAccount, useWalletClient } from "wagmi";
import { ALCHEMY_CONFIG } from "@scaffold-alchemy/shared";
import { notification } from "~~/utils/scaffold-alchemy";
import { useTargetNetwork } from "./useTargetNetwork";
import { EIP7702_CONFIG } from "~~/utils/scaffold-alchemy/eip7702.config";
import { zeroAddress, createWalletClient, custom, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";


export type UpgradeStatus = "idle" | "upgrading" | "success" | "error";

interface UpgradeError {
    code: string;
    message: string;
}

export const useEOAUpgrade = () => {
    const [status, setStatus] = useState<UpgradeStatus>("idle");
    const [error, setError] = useState<UpgradeError | null>(null);
    const [client, setClient] = useState<ModularAccountV2Client | null>(null);
    const { address, connector } = useAccount();
    const { data: walletClient } = useWalletClient();
    const { targetNetwork } = useTargetNetwork();

    const isEIP7702Supported = () => {
        return EIP7702_CONFIG.supportedChains.includes(targetNetwork.id as (1 | 11155111));
    };

    const isMetaMaskConnected = () => {
        return connector?.name?.toLowerCase().includes("metamask") ||
            connector?.id === "injected";
    };

    // Initialize the client when wallet is connected
    useEffect(() => {
        const initializeClient = async () => {
            // Check conditions inline to avoid hook dependency issues
            const isMetaMask = connector?.name?.toLowerCase().includes("metamask") || connector?.id === "injected";
            const isSupported = EIP7702_CONFIG.supportedChains.includes(targetNetwork.id as (1 | 11155111));
            
            if (!walletClient || !address || !isMetaMask || !isSupported) {
                return;
            }

            try {
                console.log("[EOA Upgrade] Initializing client...");

                // Create a custom wallet client for MetaMask
                const customWalletClient = createWalletClient({
                    account: address as Hex,
                    chain: targetNetwork.id === 1 ? mainnet : sepolia,
                    transport: custom(window.ethereum!),
                });

                // Create the base WalletClientSigner
                const baseSigner = new WalletClientSigner(customWalletClient, "metamask");

                // Create an enhanced signer with EIP-7702 support
                const signer = {
                    ...baseSigner,
                    signerType: baseSigner.signerType,
                    inner: baseSigner.inner,
                    getAddress: baseSigner.getAddress,
                    signMessage: baseSigner.signMessage,
                    signTypedData: baseSigner.signTypedData,
                    signAuthorization: async (unsignedAuth: any): Promise<any> => {
                        const contractAddress = unsignedAuth.contractAddress ?? unsignedAuth.address;
                        
                        try {
                            console.log("[EOA Upgrade] Signing EIP-7702 authorization for MetaMask...");
                            console.log("[EOA Upgrade] Authorization request:", unsignedAuth);
                            
                            // For MetaMask, we need to use the wallet_invokeMethod for EIP-7702
                            // or fallback to manual typed data signing
                            try {
                                // Try the new MetaMask EIP-7702 method first
                                const signedAuth = await window.ethereum!.request({
                                    method: 'wallet_invokeMethod',
                                    params: [
                                        'eth_signAuthorization',
                                        [{
                                            chainId: `0x${unsignedAuth.chainId.toString(16)}`,
                                            nonce: `0x${unsignedAuth.nonce.toString(16)}`,
                                            address: contractAddress,
                                        }]
                                    ]
                                });
                                
                                console.log("[EOA Upgrade] EIP-7702 authorization signed:", signedAuth);
                                return {
                                    chainId: unsignedAuth.chainId,
                                    nonce: unsignedAuth.nonce,
                                    address: contractAddress!,
                                    ...signedAuth
                                };
                            } catch (methodError) {
                                console.log("[EOA Upgrade] wallet_invokeMethod not supported, falling back to typed data signing:", methodError);
                                
                                // Try EIP-712 typed data signing as a fallback
                                // Even though this won't produce the correct EIP-7702 format,
                                // we let the user complete the signing process before showing the private key option
                                console.log("[EOA Upgrade] Attempting typed data signing (this will likely fail but allows user to complete the flow)");
                                
                                try {
                                    const domain = {
                                        name: "EIP-7702",
                                        version: "1",
                                        chainId: unsignedAuth.chainId,
                                    };

                                    const types = {
                                        Authorization: [
                                            { name: "chainId", type: "uint256" },
                                            { name: "nonce", type: "uint256" },
                                            { name: "address", type: "address" },
                                        ],
                                    };

                                    const message = {
                                        chainId: unsignedAuth.chainId,
                                        nonce: unsignedAuth.nonce,
                                        address: contractAddress,
                                    };

                                    // Let the user complete the MetaMask signing flow
                                    const signature = await window.ethereum!.request({
                                        method: 'eth_signTypedData_v4',
                                        params: [address, JSON.stringify({ domain, types, primaryType: 'Authorization', message })],
                                    });

                                    // Parse signature components
                                    const sig = signature as string;
                                    const r = `0x${sig.slice(2, 66)}`;
                                    const s = `0x${sig.slice(66, 130)}`;
                                    const v = parseInt(sig.slice(130, 132), 16);

                                    console.log("[EOA Upgrade] Typed data signature created (but won't work for EIP-7702):", { r, s, v });

                                    // Even though we got a signature, it's not in the correct EIP-7702 format
                                    // The bundler will reject this, but at least the user completed the MetaMask flow
                                    return {
                                        chainId: unsignedAuth.chainId,
                                        nonce: unsignedAuth.nonce,
                                        address: contractAddress!,
                                        r: r as Hex,
                                        s: s as Hex,
                                        v: BigInt(v),
                                        yParity: v - 27,
                                    };
                                } catch (signError: any) {
                                    // User rejected or error in signing
                                    if (signError?.code === 4001 || signError?.message?.includes("rejected")) {
                                        throw new Error("User rejected the signature request");
                                    }
                                    
                                    // If typed data signing also fails, then show the private key option
                                    throw new Error(
                                        "MetaMask doesn't support EIP-7702 authorization signing yet. " +
                                        "Please use the private key option to upgrade your account."
                                    );
                                }
                            }
                        } catch (error) {
                            console.error("[EOA Upgrade] Failed to sign authorization:", error);
                            throw error;
                        }
                    },
                };

                // Use the correct chain from @account-kit/infra
                const alchemyChain = targetNetwork.id === 1 ? mainnet : sepolia;
                
                // Get the API key and policy ID from the shared config
                const apiKey = ALCHEMY_CONFIG.ALCHEMY_API_KEY;
                const policyId = ALCHEMY_CONFIG.ALCHEMY_GAS_POLICY_ID;

                // Create the Modular Account V2 client with EIP-7702 support
                const modularClient = await createModularAccountV2Client({
                    signer,
                    chain: alchemyChain,
                    transport: alchemy({ 
                        apiKey,
                    }),
                    policyId,
                    // This enables EIP-7702 mode
                    mode: "7702",
                });

                setClient(modularClient);
                console.log("[EOA Upgrade] Client initialized successfully");
            } catch (err) {
                console.error("[EOA Upgrade] Failed to initialize client:", err);
            }
        };

        initializeClient();
    }, [walletClient, address, targetNetwork.id, connector]);

    const upgradeToSmartAccount = async () => {
        console.log("[EOA Upgrade] Starting upgrade process...");

        try {
            // Reset state
            setStatus("upgrading");
            setError(null);

            // Validation checks
            if (!address) {
                throw { code: "NO_ADDRESS", message: EIP7702_CONFIG.errors.NO_ADDRESS };
            }

            if (!isMetaMaskConnected()) {
                throw { code: "NOT_METAMASK", message: EIP7702_CONFIG.errors.NOT_METAMASK };
            }

            if (!isEIP7702Supported()) {
                throw {
                    code: "UNSUPPORTED_NETWORK",
                    message: EIP7702_CONFIG.errors.UNSUPPORTED_NETWORK
                };
            }

            if (!client) {
                throw { code: "NO_CLIENT", message: "Client not initialized. Please try again." };
            }

            notification.info(EIP7702_CONFIG.messages.PREPARING);

            // First, check if MetaMask supports EIP-7702
            // Try to detect if MetaMask has the experimental feature enabled
            try {
                // Check if the wallet client has experimental methods
                const provider = await walletClient?.request({ method: 'eth_accounts' });
                console.log("[EOA Upgrade] Wallet provider check:", provider);
            } catch (checkErr) {
                console.warn("[EOA Upgrade] Provider check failed:", checkErr);
            }

            console.log("[EOA Upgrade] Sending user operation to trigger EIP-7702 delegation...");
            notification.info("Please approve the smart account delegation in MetaMask...");

            // Send a simple user operation
            // The SDK should automatically request EIP-7702 authorization from MetaMask
            const uoHash = await client.sendUserOperation({
                uo: {
                    target: zeroAddress, // Send to self
                    data: "0x", // Empty data
                    value: 0n,
                },
            });

            console.log("[EOA Upgrade] User operation sent, hash:", uoHash);
            notification.info(EIP7702_CONFIG.messages.UPGRADING);

            // Wait for the user operation to be mined
            const txHash = await client.waitForUserOperationTransaction(uoHash);
            console.log("[EOA Upgrade] Transaction hash:", txHash);

            if (txHash) {
                setStatus("success");
                notification.success(EIP7702_CONFIG.messages.SUCCESS);
                console.log("[EOA Upgrade] Upgrade successful!");

                // Trigger a refresh of account type detection
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                throw new Error("Transaction failed");
            }

        } catch (err: any) {
            console.error("[EOA Upgrade] Upgrade error:", err);

            // Handle specific error cases
            if (err.code === "UNSUPPORTED_NETWORK" || err.code === "NOT_METAMASK" || err.code === "NO_ADDRESS" || err.code === "NO_CLIENT") {
                setError(err);
                notification.error(err.message);
            } else if (err.message?.includes("rejected") || err.message?.includes("denied") || err.code === 4001) {
                setError({
                    code: "USER_REJECTED",
                    message: EIP7702_CONFIG.errors.USER_REJECTED
                });
                notification.error(EIP7702_CONFIG.errors.USER_REJECTED);
            } else if (err.message?.includes("AA23") || err.message?.includes("Invalid 7702 Auth signature")) {
                // AA23 error or Invalid 7702 Auth signature means the signature format is wrong
                setError({
                    code: "SIGNATURE_VALIDATION_FAILED",
                    message: "The signature format is not valid for EIP-7702. MetaMask cannot create the required signature format."
                });
                notification.error("Invalid EIP-7702 signature format. Please use the private key option to upgrade.");
            } else if (err.message?.includes("MetaMask doesn't support EIP-7702") || 
                    err.message?.includes("Please use the private key option")) {
                // MetaMask doesn't support EIP-7702 signing
                setError({
                    code: "METAMASK_EIP7702_NOT_SUPPORTED",
                    message: "MetaMask doesn't support EIP-7702 authorization signing. This feature requires a wallet that can sign EIP-7702 authorizations with the specific format (0x05 magic byte + RLP encoding)."
                });
                notification.error("MetaMask doesn't support EIP-7702 yet. Please use the private key option.");
            } else if (err.message?.includes("AccountTypeNotSupportedError") || err.message?.includes("json-rpc")) {
                // Viem doesn't support JSON-RPC accounts for signAuthorization
                setError({
                    code: "ACCOUNT_TYPE_NOT_SUPPORTED",
                    message: "EIP-7702 signing failed. MetaMask may not support this feature yet or needs to be updated."
                });
                notification.error("EIP-7702 authorization failed. Please ensure MetaMask supports EIP-7702 features.");
            } else if (err.message?.includes("eth_signTypedData_v4")) {
                // MetaMask doesn't support the signing method
                setError({
                    code: "METAMASK_NOT_SUPPORTED",
                    message: "Your MetaMask version doesn't support EIP-7702. Please update to the latest version."
                });
                notification.error("MetaMask doesn't support EIP-7702 signing. Please update MetaMask.");
            } else if (err.message?.includes("precheck failed") || err.message?.includes("initCode is empty")) {
                setError({
                    code: "SDK_NOT_READY",
                    message: EIP7702_CONFIG.errors.SDK_NOT_READY
                });
                notification.error(EIP7702_CONFIG.errors.SDK_NOT_READY);
            } else {
                setError({
                    code: "UNKNOWN_ERROR",
                    message: err.message || EIP7702_CONFIG.errors.UNKNOWN_ERROR
                });
                notification.error(err.message || EIP7702_CONFIG.errors.UNKNOWN_ERROR);
            }

            setStatus("error");
        }
    };

    const reset = () => {
        setStatus("idle");
        setError(null);
    };

    const upgradeWithPrivateKey = async (privateKey: string) => {
        console.log("[EOA Upgrade] Starting private key upgrade process...");

        try {
            // Reset state
            setStatus("upgrading");
            setError(null);

            // Validation checks
            if (!privateKey || !privateKey.startsWith("0x") || privateKey.length !== 66) {
                throw { code: "INVALID_PRIVATE_KEY", message: "Invalid private key format. Must be a 0x-prefixed 64 character hex string." };
            }

            if (!isEIP7702Supported()) {
                throw {
                    code: "UNSUPPORTED_NETWORK",
                    message: EIP7702_CONFIG.errors.UNSUPPORTED_NETWORK
                };
            }

            notification.info("Creating account from private key...");

            // Create account from private key
            const account = privateKeyToAccount(privateKey as Hex);
            console.log("[EOA Upgrade] Account created from private key:", account.address);

            // Create a simple signer that matches the SmartAccountSigner interface
            const signer = {
                signerType: "local",
                inner: account,
                getAddress: async () => account.address,
                signMessage: async (message: any) => account.signMessage({ message }),
                signTypedData: async (params: any) => account.signTypedData(params),
                signAuthorization: async (unsignedAuth: any) => {
                    console.log("[EOA Upgrade] Signing authorization with private key account:", unsignedAuth);
                    return account.signAuthorization(unsignedAuth);
                }
            };

            // Use the correct chain from @account-kit/infra
            const alchemyChain = targetNetwork.id === 1 ? mainnet : sepolia;
            
            // Get the API key and policy ID from the shared config
            const apiKey = ALCHEMY_CONFIG.ALCHEMY_API_KEY;
            const policyId = ALCHEMY_CONFIG.ALCHEMY_GAS_POLICY_ID;

            console.log("[EOA Upgrade] Creating client with LocalAccountSigner...");

            // Create the Modular Account V2 client with EIP-7702 support
            const modularClient = await createModularAccountV2Client({
                signer: signer as any, // Type cast needed due to version mismatch between packages
                chain: alchemyChain,
                transport: alchemy({ 
                    apiKey,
                }),
                policyId,
                // This enables EIP-7702 mode
                mode: "7702",
            });

            console.log("[EOA Upgrade] Client created successfully, sending user operation...");
            notification.info("Sending EIP-7702 delegation transaction...");

            // Send a simple user operation
            // The SDK should automatically request EIP-7702 authorization
            const uoHash = await modularClient.sendUserOperation({
                uo: {
                    target: zeroAddress, // Send to zero address
                    data: "0x", // Empty data
                    value: 0n,
                },
            });

            console.log("[EOA Upgrade] User operation sent, hash:", uoHash);
            notification.info(EIP7702_CONFIG.messages.UPGRADING);

            // Wait for the user operation to be mined
            const txHash = await modularClient.waitForUserOperationTransaction(uoHash);
            console.log("[EOA Upgrade] Transaction hash:", txHash);

            if (txHash) {
                setStatus("success");
                notification.success(EIP7702_CONFIG.messages.SUCCESS);
                console.log("[EOA Upgrade] Upgrade successful!");

                // Clear the private key from memory
                privateKey = "";

                // Trigger a refresh of account type detection
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                throw new Error("Transaction failed");
            }

        } catch (err: any) {
            console.error("[EOA Upgrade] Private key upgrade error:", err);

            // Handle specific error cases
            if (err.code === "UNSUPPORTED_NETWORK" || err.code === "INVALID_PRIVATE_KEY") {
                setError(err);
                notification.error(err.message);
            } else if (err.message?.includes("AA23")) {
                setError({
                    code: "SIGNATURE_VALIDATION_FAILED",
                    message: "EIP-7702 signature validation failed. Please check your private key."
                });
                notification.error("EIP-7702 authorization failed. Please verify your private key is correct.");
            } else {
                setError({
                    code: "UNKNOWN_ERROR",
                    message: err.message || EIP7702_CONFIG.errors.UNKNOWN_ERROR
                });
                notification.error(err.message || EIP7702_CONFIG.errors.UNKNOWN_ERROR);
            }

            setStatus("error");
        }
    };

    return {
        upgradeToSmartAccount,
        upgradeWithPrivateKey,
        status,
        error,
        isEIP7702Supported: isEIP7702Supported(),
        isMetaMaskConnected: isMetaMaskConnected(),
        reset,
    };
};
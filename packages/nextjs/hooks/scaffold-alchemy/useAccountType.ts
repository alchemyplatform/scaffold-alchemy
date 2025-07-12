/* eslint-disable prettier/prettier */

// This code is part of feature_1: "Account Type Detection"
import { useEffect, useState } from "react";
import { useAccount, usePublicClient } from "wagmi"; //usePublicClient is part of feature_1_part_2
import { useClient } from "./useClient";
import { useTargetNetwork } from "./useTargetNetwork"; //useTargetNetwork is part of feature_1_part_2

export type AccountType = "EOA" | "EOA_7702" | "SCA_4337" | "SCA_4337_UNDEPLOYED" | "UNKNOWN"; // "SCA_4337_UNDEPLOYED" is part of feature_2

export const useAccountType = () => {
    const [accountType, setAccountType] = useState<AccountType>("UNKNOWN");
    const [isLoading, setIsLoading] = useState(true);
    const { isConnected, connector } = useAccount();
    const { client, address, isSmartWallet } = useClient(); // isSmartWallet is part of feature_1_part_3
    const publicClient = usePublicClient(); // usePublicClient is part of feature_1_part_2
    const { targetNetwork } = useTargetNetwork(); //useTargetNetwork is part of feature_1_part_2


    useEffect(() => {
        const detectAccountType = async () => {

            try {
                // Debug logging
                console.log("[useAccountType] Detection state:", {
                    isConnected,
                    hasClient: !!client,
                    hasAddress: !!address,
                    isSmartWallet, // From useClient (feature_1_part_3)
                    connectorType: connector?.type,
                    connectorName: connector?.name,
                });
                // If useClient already detected a Smart Wallet, use that
                if (isSmartWallet) {
                    setAccountType("EOA_7702");
                    return;
                }

                // If we have a client and address, check if it's from external wallet or not
                if (client && address) {
                    // Check if connected via external wallet
                    const isExternalWallet =
                        connector?.type === "injected" ||
                        connector?.type === "walletConnect" ||
                        connector?.name?.toLowerCase().includes("wallet") ||
                        connector?.name?.toLowerCase().includes("metamask");

                    if (!isExternalWallet) {
                        // Has SCA and no external wallet = email/social login
                        // feature_2: Check if the smart account is deployed
                        if (publicClient) {
                            try {
                                const code = await publicClient.getCode({
                                    address: address as `0x${string}`,
                                    blockTag: 'latest'
                                });
                                const isDeployed = code !== undefined && code !== "0x";
                                setAccountType(isDeployed ? "SCA_4337" : "SCA_4337_UNDEPLOYED");
                            } catch (error) {
                                console.error("[useAccountType] Error checking deployment:", error);
                                setAccountType("SCA_4337_UNDEPLOYED");
                            }
                        } else {
                            setAccountType("SCA_4337_UNDEPLOYED");
                        }
                    } else {
                        // This shouldn't happen if isSmartWallet detection works
                        // But keeping as fallback
                        setAccountType("EOA");
                    }
                } else if (isConnected && !client) {
                    // Connected with external wallet but no client = regular EOA
                    setAccountType("EOA");
                } else if (!isConnected && address) {
                    // Has address but not connected via wagmi = likely email/social
                    // Check deployment status
                    if (publicClient && address) {
                        try {
                            const code = await publicClient.getCode({
                                address: address as `0x${string}`,
                                blockTag: 'latest'
                            });
                            const isDeployed = code !== undefined && code !== "0x";
                            setAccountType(isDeployed ? "SCA_4337" : "SCA_4337_UNDEPLOYED");
                        } catch (error) {
                            console.error("[useAccountType] Error checking deployment:", error);
                            setAccountType("SCA_4337_UNDEPLOYED");
                        }
                    } else {
                        setAccountType("SCA_4337_UNDEPLOYED");
                    }
                } else {
                    setAccountType("UNKNOWN");
                }
            } catch (error) {
                console.error("Error detecting account type:", error);
                setAccountType("UNKNOWN");
            } finally {
                setIsLoading(false);
            }
        };

        detectAccountType();
    }, [isConnected, connector, client, address, isSmartWallet, publicClient, targetNetwork]);



    return { accountType, isLoading };
};

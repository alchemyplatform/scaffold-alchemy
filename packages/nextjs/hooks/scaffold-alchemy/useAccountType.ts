/* eslint-disable prettier/prettier */

// This code is part of feature_1: "Account Type Detection"
import { useEffect, useState } from "react";
import { useAccount, usePublicClient } from "wagmi"; //usePublicClient is part of feature_1_part_2
import { useClient } from "./useClient";
import { useTargetNetwork } from "./useTargetNetwork"; //useTargetNetwork is part of feature_1_part_2

export type AccountType = "EOA" | "EOA_7702" | "SCA_4337" | "UNKNOWN";

export const useAccountType = () => {
    const [accountType, setAccountType] = useState<AccountType>("UNKNOWN");
    const [isLoading, setIsLoading] = useState(true);
    const { isConnected, connector } = useAccount();
    const { client, address } = useClient();
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
                    connectorType: connector?.type,
                    connectorName: connector?.name,
                });

                // Check if there's bytecode at the address (indicates smart account) - feature_1_part_2
                let hasCode = false;
                if (address && publicClient) {
                    try {
                        const code = await publicClient.getBytecode({
                            address: address as `0x${string}`,
                            blockTag: 'latest'
                        });
                        hasCode = code !== undefined && code !== "0x";
                        console.log("[useAccountType] Bytecode check:", { address, hasCode });
                    } catch (error) {
                        console.error("[useAccountType] Error checking bytecode:", error);
                    }
                }
            
                // If we have a client and address, check if it's from external wallet or not
                if (client && address) {
                    // Check if connected via external wallet
                    const isExternalWallet =
                        connector?.type === "injected" ||
                        connector?.type === "walletConnect" ||
                        connector?.name?.toLowerCase().includes("wallet") ||
                        connector?.name?.toLowerCase().includes("metamask");
                    
                    //added extended logic for feature_1_part_2
                    if (isExternalWallet && hasCode) {
                        // External wallet with code at address = likely 7702 upgraded
                        setAccountType("EOA_7702");
                    } else if (isExternalWallet) {
                        // External wallet without code = regular EOA
                        setAccountType("EOA");
                    } else {
                        // Has SCA but no external wallet = email/social login
                        setAccountType("SCA_4337");
                    }
                } else if (isConnected && !client) {
                    // Connected with external wallet but no SCA client
                    if (hasCode) {
                        // Has code but no SCA client = 7702 upgraded EOA
                        setAccountType("EOA_7702");
                    } else {
                        setAccountType("EOA");
                    }
                } else if (!isConnected && address) {
                    // Has address but not connected via wagmi = likely email/social
                    setAccountType("SCA_4337");
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
    }, [isConnected, connector, client, address, publicClient, targetNetwork]);


    return { accountType, isLoading };
};

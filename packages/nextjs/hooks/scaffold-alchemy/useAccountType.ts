/* eslint-disable prettier/prettier */

// This code is part of feature_1: "Account Type Detection"
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useClient } from "./useClient";

export type AccountType = "EOA" | "EOA_7702" | "SCA_4337" | "UNKNOWN";

export const useAccountType = () => {
    const [accountType, setAccountType] = useState<AccountType>("UNKNOWN");
    const [isLoading, setIsLoading] = useState(true);
    const { isConnected, connector } = useAccount();
    const { client, address } = useClient();


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
            
                // If we have a client and address, check if it's from external wallet or not
                if (client && address) {
                    // Check if connected via external wallet
                    const isExternalWallet =
                        connector?.type === "injected" ||
                        connector?.type === "walletConnect" ||
                        connector?.name?.toLowerCase().includes("wallet") ||
                        connector?.name?.toLowerCase().includes("metamask");

                    if (isExternalWallet) {
                        // External wallet with SCA (future: detect 7702)
                        setAccountType("EOA");
                    } else {
                        // Has SCA but no external wallet = email/social login
                        setAccountType("SCA_4337");
                    }
                } else if (isConnected && !client) {
                    // Connected with external wallet but no SCA client
                    setAccountType("EOA");
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
    }, [isConnected, connector, client, address]);

    return { accountType, isLoading };
};

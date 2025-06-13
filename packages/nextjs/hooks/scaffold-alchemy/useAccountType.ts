/* eslint-disable prettier/prettier */
import { useEffect, useState } from "react";
import { useAuthContext } from "@account-kit/react";
import { useAccount } from "wagmi";
import { useClient } from "./useClient";

export type AccountType = "EOA" | "EOA_7702" | "SCA_4337" | "UNKNOWN";

export const useAccountType = () => {
    const [accountType, setAccountType] = useState<AccountType>("UNKNOWN");
    const [isLoading, setIsLoading] = useState(true);
    const { isConnected, connector } = useAccount();
    const { client, address } = useClient();
    const authContext = useAuthContext();

    // Extract userType for useEffect dependency
    const userType = (authContext && 'user' in authContext) ? (authContext as any).user?.type : undefined;

    useEffect(() => {
        const detectAccountType = async () => {
            if (!isConnected && !address) {
                setAccountType("UNKNOWN");
                setIsLoading(false);
                return;
            }

            try {
                // Check if user authenticated with external wallet
                const authMethod = (authContext as any)?.user?.type;

                // Check if connected via external wallet (EOA)
                const isExternalWallet = authMethod === "external_wallet" ||
                    connector?.type === "injected" ||
                    connector?.type === "walletConnect" ||
                    connector?.name?.toLowerCase().includes("wallet") ||
                    connector?.name?.toLowerCase().includes("metamask");

                if (isExternalWallet && !client) {
                    // If external wallet is connected but no SCA client exists, it's a regular EOA
                    // The console message "EOA is connected, will not return an SCA client..." indicates this state
                    setAccountType("EOA");
                } else if (isExternalWallet && client && address) {
                    // If external wallet is connected AND we have an SCA client, it might be EIP-7702
                    // TODO: Implement actual EIP-7702 detection logic here
                    // For now, we'll assume it's a regular EOA
                    setAccountType("EOA");
                } else if (client && address && (authMethod === "email" || authMethod === "social")) {
                    // If authenticated via email or social login, it's a 4337 SCA
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
    }, [
        isConnected,
        connector,
        client,
        address,
        userType,
        authContext
    ]);

    return { accountType, isLoading };
};
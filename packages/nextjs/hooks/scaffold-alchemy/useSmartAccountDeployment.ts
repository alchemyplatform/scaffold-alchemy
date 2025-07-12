/* eslint-disable prettier/prettier */

// feature_2: Manual deployment of smart accounts authenticated via social login

import { useState, useCallback, useEffect } from "react";
import { useClient } from "./useClient";
import { usePublicClient } from "wagmi";
import { notification } from "~~/utils/scaffold-alchemy";
import { zeroAddress } from "viem";

export type DeploymentStatus = "undeployed" | "deploying" | "deployed" | "error";

interface DeploymentError {
    code: string;
    message: string;
}

export const useSmartAccountDeployment = () => {
    const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus>("undeployed");
    const [error, setError] = useState<DeploymentError | null>(null);
    const [isChecking, setIsChecking] = useState(true);

    const { client, address } = useClient();
    const publicClient = usePublicClient();

    // Check if the smart account is deployed by looking for bytecode
    const checkDeploymentStatus = useCallback(async () => {
        if (!address || !publicClient) {
            setIsChecking(false);
            return;
        }

        try {
            const code = await publicClient.getCode({
                address: address as `0x${string}`,
                blockTag: 'latest'
            });

            const isDeployed = code !== undefined && code !== "0x";
            setDeploymentStatus(isDeployed ? "deployed" : "undeployed");

            console.log("[Smart Account Deployment] Deployment check:", {
                address,
                hasCode: isDeployed,
                codeLength: code?.length
            });
        } catch (error) {
            console.error("[Smart Account Deployment] Error checking deployment:", error);
            setDeploymentStatus("undeployed");
        } finally {
            setIsChecking(false);
        }
    }, [address, publicClient]);

    // Check deployment status on mount and when address changes
    useEffect(() => {
        checkDeploymentStatus();
    }, [checkDeploymentStatus]);

    // Deploy the smart account
    const deploySmartAccount = useCallback(async () => {
        console.log("[Smart Account Deployment] Starting deployment process...");

        try {
            setDeploymentStatus("deploying");
            setError(null);

            if (!client) {
                throw {
                    code: "NO_CLIENT",
                    message: "Smart account client not initialized. Please try again."
                };
            }

            if (!address) {
                throw {
                    code: "NO_ADDRESS",
                    message: "No account address found. Please log in first."
                };
            }

            notification.info("Preparing to deploy your smart account...");

            // Send an empty user operation to trigger deployment
            console.log("[Smart Account Deployment] Sending deployment UserOp...");

            const uoHash = await client.sendUserOperation({
                uo: {
                    target: zeroAddress, // Send to zero address
                    data: "0x", // Empty data
                    value: 0n,
                },
            });

            console.log("[Smart Account Deployment] UserOp sent, hash:", uoHash);
            notification.info("Deploying your smart account onchain...");

            // Wait for the user operation to be mined
            const txHash = await client.waitForUserOperationTransaction(uoHash);
            console.log("[Smart Account Deployment] Transaction hash:", txHash);

            if (txHash) {
                setDeploymentStatus("deployed");
                notification.success("Smart account deployed successfully!");

                // Re-check deployment status to confirm
                setTimeout(() => {
                    checkDeploymentStatus();
                }, 1000);

                return txHash;
            } else {
                throw new Error("Deployment transaction failed");
            }

        } catch (err: any) {
            console.error("[Smart Account Deployment] Deployment error:", err);

            // Handle specific error cases
            if (err.code === "NO_CLIENT" || err.code === "NO_ADDRESS") {
                setError(err);
                notification.error(err.message);
            } else if (err.message?.includes("rejected") || err.code === 4001) {
                setError({
                    code: "USER_REJECTED",
                    message: "Deployment cancelled by user"
                });
                notification.error("Deployment cancelled");
            } else if (err.message?.includes("insufficient funds")) {
                setError({
                    code: "INSUFFICIENT_FUNDS",
                    message: "Insufficient funds for deployment. Please add funds to your account."
                });
                notification.error("Insufficient funds for deployment");
            } else {
                setError({
                    code: "UNKNOWN_ERROR",
                    message: err.message || "Failed to deploy smart account. Please try again."
                });
                notification.error(err.message || "Deployment failed");
            }

            setDeploymentStatus("error");

            // Re-check deployment status in case it was actually deployed
            setTimeout(() => {
                checkDeploymentStatus();
            }, 2000);
        }
    }, [client, address, checkDeploymentStatus]);

    const reset = useCallback(() => {
        setDeploymentStatus("undeployed");
        setError(null);
    }, []);

    return {
        deploymentStatus,
        isDeployed: deploymentStatus === "deployed",
        isDeploying: deploymentStatus === "deploying",
        isChecking,
        error,
        deploySmartAccount,
        checkDeploymentStatus,
        reset,
    };
};
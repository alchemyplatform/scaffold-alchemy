/* eslint-disable prettier/prettier */

import { useEffect, useState } from "react";
import { useClient } from "./useClient";
import { useSendUserOperation } from "@account-kit/react";
import { ExtractAbiFunctionNames } from "abitype";
import { Abi, EncodeFunctionDataParameters, WriteContractReturnType, encodeFunctionData, Hex } from "viem"; // Hex is part of feature_1_part_3
import { UseWriteContractParameters, useWriteContract } from "wagmi";
import { useSelectedNetwork } from "~~/hooks/scaffold-alchemy";
import { useDeployedContractInfo, useTransactor } from "~~/hooks/scaffold-alchemy";
import { AllowedChainIds, notification } from "~~/utils/scaffold-alchemy";
import {
  ContractAbi,
  ContractName,
  ScaffoldWriteContractOptions,
  ScaffoldWriteContractVariables,
  UseScaffoldWriteConfig,
} from "~~/utils/scaffold-alchemy/contract";

type ScaffoldWriteContractReturnType<TContractName extends ContractName> = Omit<
  ReturnType<typeof useWriteContract>,
  "writeContract" | "writeContractAsync"
> & {
  isMining: boolean;
  writeContractAsync: <
    TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, "nonpayable" | "payable">,
  >(
    variables: ScaffoldWriteContractVariables<TContractName, TFunctionName>,
    options?: ScaffoldWriteContractOptions,
  ) => Promise<WriteContractReturnType | undefined>;
  writeContract: <TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, "nonpayable" | "payable">>(
    variables: ScaffoldWriteContractVariables<TContractName, TFunctionName>,
    options?: Omit<ScaffoldWriteContractOptions, "onBlockConfirmation" | "blockConfirmations">,
  ) => void;
};

export function useScaffoldWriteContract<TContractName extends ContractName>(
  config: UseScaffoldWriteConfig<TContractName>,
): ScaffoldWriteContractReturnType<TContractName>;
/**
 * @deprecated Use object parameter version instead: useScaffoldWriteContract({ contractName: "YourContract" })
 */
export function useScaffoldWriteContract<TContractName extends ContractName>(
  contractName: TContractName,
  writeContractParams?: UseWriteContractParameters,
): ScaffoldWriteContractReturnType<TContractName>;

/**
 * Wrapper around wagmi's useWriteContract hook which automatically loads (by name) the contract ABI and address from
 * the contracts present in deployedContracts.ts & externalContracts.ts corresponding to targetNetworks configured in scaffold.config.ts
 * @param contractName - name of the contract to be written to
 * @param config.chainId - optional chainId that is configured with the scaffold project to make use for multi-chain interactions.
 * @param writeContractParams - wagmi's useWriteContract parameters
 */
export function useScaffoldWriteContract<TContractName extends ContractName>(
  configOrName: UseScaffoldWriteConfig<TContractName> | TContractName,
  writeContractParams?: UseWriteContractParameters,
): ScaffoldWriteContractReturnType<TContractName> {
  const finalConfig =
    typeof configOrName === "string"
      ? { contractName: configOrName, writeContractParams, chainId: undefined }
      : (configOrName as UseScaffoldWriteConfig<TContractName>);
  const { contractName, chainId, writeContractParams: finalWriteContractParams } = finalConfig;

  useEffect(() => {
    if (typeof configOrName === "string") {
      console.warn(
        "Using `useScaffoldWriteContract` with a string parameter is deprecated. Please use the object parameter version instead.",
      );
    }
  }, [configOrName]);

  const writeTx = useTransactor();
  const [isMining, setIsMining] = useState(false);
  const [isSmartWalletMining, setIsSmartWalletMining] = useState(false); //feature_1_part_3

  const wagmiContractWrite = useWriteContract(finalWriteContractParams);

  const selectedNetwork = useSelectedNetwork(chainId);

  const { data: deployedContractData } = useDeployedContractInfo({
    contractName,
    chainId: selectedNetwork.id as AllowedChainIds,
  });

  const { client, isSmartWallet } = useClient(); // isSmartWallet is part of feature_1_part_3

  // Only use useSendUserOperation for Smart Accounts cases
  // For Smart Wallets, we'll use the client directly to avoid the EOA fallback
  const { sendUserOperationAsync, sendUserOperation } = useSendUserOperation({
    client: !isSmartWallet ? client : undefined, // feature_1_part_3: client is undefined for Smart Wallets otherwise it falls back to EOA
    waitForTxn: true,
  });

  const sendContractWriteAsyncTx = async <
    TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, "nonpayable" | "payable">,
  >(
    variables: ScaffoldWriteContractVariables<TContractName, TFunctionName>,
    options?: ScaffoldWriteContractOptions,
  ) => {
    if (!deployedContractData) {
      notification.error("Target Contract is not deployed, did you forget to run `yarn deploy`?");
      return;
    }

    if (!client) {
      notification.error(`You must first login before making an onchain action`);
      return;
    }

// feature_1_part_3: useScaffoldWriteContract now supports Smart Wallets (EIP-7702) userOps block start ------
    try {
      setIsMining(true);
      if (isSmartWallet) {
        setIsSmartWalletMining(true);
      }

      const { blockConfirmations, onBlockConfirmation } = options || {};

      const makeWriteWithParams = async (): Promise<Hex> => {
        const encodedData = encodeFunctionData({
          abi: deployedContractData.abi,
          functionName: variables.functionName,
          args: variables.args || [],
        } as EncodeFunctionDataParameters<Abi, string>);

        // For Smart Wallets (EIP-7702), use the client directly
        if (isSmartWallet && client) {
          console.log("[ScaffoldWrite] Using Smart Wallet client for UserOp");
          console.log("[ScaffoldWrite] Target:", deployedContractData.address);
          console.log("[ScaffoldWrite] Function:", variables.functionName);
          console.log("[ScaffoldWrite] Value:", variables.value || 0n);

          try {
            const result = await client.sendUserOperation({
              uo: {
                target: deployedContractData.address,
                data: encodedData,
                value: variables.value || 0n,
              },
            });

            console.log("[ScaffoldWrite] UserOp sent, result:", result);

            // Wait for the transaction if we have a hash
            if ('hash' in result && result.hash) {
              console.log("[ScaffoldWrite] Waiting for UserOp transaction:", result.hash);
              const txHash = await client.waitForUserOperationTransaction({
                hash: result.hash,
              });
              console.log("[ScaffoldWrite] Transaction confirmed:", txHash);
              return txHash as Hex;
            }

            throw new Error("Failed to get transaction hash from Smart Wallet operation");
          } catch (error) {
            console.error("[ScaffoldWrite] Smart Wallet operation failed:", error);
            throw error;
          }
        } else if (sendUserOperationAsync) {
          // Use the SDK's sendUserOperationAsync for regular smart accounts
          const { hash } = await sendUserOperationAsync({
            uo: {
              target: deployedContractData.address,
              data: encodedData,
              value: variables.value,
            },
          });
          return hash as Hex;
        } else {
          throw new Error("No method available to send transaction");
        }
      };

      const writeTxResult = await writeTx(makeWriteWithParams, { blockConfirmations, onBlockConfirmation });

      return writeTxResult;
    } catch (e: any) {
      throw e;
    } finally {
      setIsMining(false);
      setIsSmartWalletMining(false);
    }
  };
// feature_1_part_3: useScaffoldWriteContract now supports Smart Wallets (EIP-7702) userOps block end ------
  
  const sendContractWriteTx = <
    TContractName extends ContractName,
    TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, "nonpayable" | "payable">,
  >(
    variables: ScaffoldWriteContractVariables<TContractName, TFunctionName>,
  ) => {
    if (!deployedContractData) {
      notification.error("Target Contract is not deployed, did you forget to run `yarn deploy`?");
      return;
    }

// feature_1_part_3: useScaffoldWriteContract now supports Smart Wallets (EIP-7702) userOps block start ------
    if (!client && !isSmartWallet) {
      notification.error(`You must first login before making an onchain action`);
      return;
    }

    const encodedData = encodeFunctionData({
      abi: deployedContractData.abi,
      functionName: variables.functionName,
      args: variables.args || [],
    } as EncodeFunctionDataParameters<Abi, string>);

    // For Smart Wallets (EIP-7702), use the client directly
    if (isSmartWallet && client) {
      console.log("[ScaffoldWrite] Using Smart Wallet client for UserOp (sync)");
      setIsSmartWalletMining(true);
      client.sendUserOperation({
        uo: {
          target: deployedContractData.address,
          data: encodedData,
          value: variables.value || 0n,
        },
      }).then(() => {
        setIsSmartWalletMining(false);
      }).catch((error: any) => {
        console.error("Smart Wallet operation failed:", error);
        setIsSmartWalletMining(false);
      });
    } else if (sendUserOperation) {
      // Use the SDK's sendUserOperation for regular smart accounts
      sendUserOperation({
        uo: {
          target: deployedContractData.address,
          data: encodedData,
          value: variables.value,
        },
      });
    }
  };

  return {
    ...wagmiContractWrite,
    isMining: isMining || isSmartWalletMining,
    // Overwrite wagmi's writeContactAsync
    writeContractAsync: sendContractWriteAsyncTx,
    // Overwrite wagmi's writeContract
    writeContract: sendContractWriteTx,
  };
}
// feature_1_part_3: useScaffoldWriteContract now supports Smart Wallets (EIP-7702) userOps block end ------
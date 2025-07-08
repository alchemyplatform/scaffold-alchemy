/* eslint-disable prettier/prettier */

"use client";

import { useEffect, useState } from "react";
import { InheritanceTooltip } from "./InheritanceTooltip";
import { useChain, useSendUserOperation } from "@account-kit/react";
import { Abi, AbiFunction } from "abitype";
import { Address, Hex, TransactionReceipt, encodeFunctionData } from "viem";
import { useWaitForTransactionReceipt } from "wagmi";
import {
  ContractInput,
  TxReceipt,
  getFunctionInputKey,
  getInitialFormState,
  getParsedContractFunctionArgs,
  transformAbiFunction,
} from "~~/app/debug/_components/contract";
import { IntegerInput } from "~~/components/scaffold-alchemy";
import { useTransactor } from "~~/hooks/scaffold-alchemy";
import { useClient } from "~~/hooks/scaffold-alchemy/useClient";
import { useTargetNetwork } from "~~/hooks/scaffold-alchemy/useTargetNetwork";

type WriteOnlyFunctionFormProps = {
  abi: Abi;
  abiFunction: AbiFunction;
  onChange: () => void;
  contractAddress: Address;
  inheritedFrom?: string;
};

export const WriteOnlyFunctionForm = ({
  abi,
  abiFunction,
  onChange,
  contractAddress,
  inheritedFrom,
}: WriteOnlyFunctionFormProps) => {
  const { client, isSmartWallet } = useClient(); // isSmartWallet is part of feature_1_part_3

  // Only use useSendUserOperation for Smart Accounts cases
  const { sendUserOperationAsync, isSendingUserOperation } = useSendUserOperation({
    client: !isSmartWallet ? client : undefined, // client is not needed for Smart Wallets, 'client: client' is used for Smart Accounts
    waitForTxn: true,
  });
  const [hash, setHash] = useState<Hex | undefined>();
  const [form, setForm] = useState<Record<string, any>>(() => getInitialFormState(abiFunction));
  const [txValue, setTxValue] = useState<string>("");
  const [isSmartWalletSending, setIsSmartWalletSending] = useState(false); // feature_1_part_3: Track Smart Wallet sending state
  const { chain } = useChain();
  const writeTxn = useTransactor();
  const { targetNetwork } = useTargetNetwork();
  const writeDisabled = !chain || chain?.id !== targetNetwork.id;
  const isSending = isSendingUserOperation || isSmartWalletSending; // feature_1_part_3: Track sending state

  const handleWrite = async () => {
    
// feature_1_part_3: Handle Smart Wallet sending block start -----
    if (!client && !sendUserOperationAsync) {
      console.error("No client available for transaction");
      return;
    }

    try {
      if (isSmartWallet) {
        setIsSmartWalletSending(true);
      }

      const makeWriteWithParams = async (): Promise<Hex> => {
        const encodedData = encodeFunctionData({
          functionName: abiFunction.name,
          abi: abi,
          args: getParsedContractFunctionArgs(form),
        });

        let txHash: Hex;

        // For Smart Wallets (EIP-7702), use the client directly
        if (isSmartWallet && client) {
          console.log("[WriteOnlyForm] Using Smart Wallet client for UserOp");
          console.log("[WriteOnlyForm] Target:", contractAddress);
          console.log("[WriteOnlyForm] Function:", abiFunction.name);
          console.log("[WriteOnlyForm] Value:", BigInt(txValue || "0"));

          try {
            const result = await client.sendUserOperation({
              uo: {
                target: contractAddress,
                data: encodedData,
                value: BigInt(txValue || "0"),
              },
            });

            console.log("[WriteOnlyForm] UserOp sent, result:", result);

            // Wait for the transaction if we have a hash
            if ('hash' in result && result.hash) {
              console.log("[WriteOnlyForm] Waiting for UserOp transaction:", result.hash);
              const confirmedHash = await client.waitForUserOperationTransaction({
                hash: result.hash,
              });
              txHash = confirmedHash as Hex;
              console.log("[WriteOnlyForm] Transaction confirmed:", txHash);
            } else {
              throw new Error("Failed to get transaction hash from Smart Wallet operation");
            }
          } catch (error) {
            console.error("[WriteOnlyForm] Smart Wallet operation failed:", error);
            throw error;
          }
        } else if (sendUserOperationAsync) {
          // Use the SDK's sendUserOperationAsync for regular smart accounts
          const { hash } = await sendUserOperationAsync({
            uo: {
              target: contractAddress,
              data: encodedData,
              value: BigInt(txValue || "0"),
            },
          });
          txHash = hash as Hex;
        } else {
          throw Error("No method available to send transaction");
        }

        setHash(txHash);
        return txHash;
      };

      await writeTxn(makeWriteWithParams);
      onChange();
    } catch (e: any) {
      console.error("⚡️ ~ file: WriteOnlyFunctionForm.tsx:handleWrite ~ error", e);
    } finally {
      if (isSmartWallet) {
        setIsSmartWalletSending(false);
      }
    }
  };

  const [displayedTxResult, setDisplayedTxResult] = useState<TransactionReceipt>();
  const { data: txResult } = useWaitForTransactionReceipt({
    hash,
  });
  useEffect(() => {
    setDisplayedTxResult(txResult);
  }, [txResult]);
// feature_1_part_3: Handle Smart Wallet sending block end -----

  // TODO use `useMemo` to optimize also update in ReadOnlyFunctionForm
  const transformedFunction = transformAbiFunction(abiFunction);
  const inputs = transformedFunction.inputs.map((input, inputIndex) => {
    const key = getFunctionInputKey(abiFunction.name, input, inputIndex);
    return (
      <ContractInput
        key={key}
        setForm={updatedFormValue => {
          setDisplayedTxResult(undefined);
          setForm(updatedFormValue);
        }}
        form={form}
        stateObjectKey={key}
        paramType={input}
      />
    );
  });
  const zeroInputs = inputs.length === 0 && abiFunction.stateMutability !== "payable";

  return (
    <div className="py-5 space-y-3 first:pt-0 last:pb-1">
      <div className={`flex gap-3 ${zeroInputs ? "flex-row justify-between items-center" : "flex-col"}`}>
        <p className="font-medium my-0 break-words">
          {abiFunction.name}
          <InheritanceTooltip inheritedFrom={inheritedFrom} />
        </p>
        {inputs}
        {abiFunction.stateMutability === "payable" ? (
          <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-center ml-2">
              <span className="text-xs font-medium mr-2 leading-none">payable value</span>
              <span className="block text-xs font-extralight leading-none">wei</span>
            </div>
            <IntegerInput
              value={txValue}
              onChange={updatedTxValue => {
                setDisplayedTxResult(undefined);
                setTxValue(updatedTxValue);
              }}
              placeholder="value (wei)"
            />
          </div>
        ) : null}
        <div className="flex justify-between gap-2">
          {!zeroInputs && (
            <div className="flex-grow basis-0">
              {displayedTxResult ? <TxReceipt txResult={displayedTxResult} /> : null}
            </div>
          )}
          <div
            className={`flex ${
              writeDisabled &&
              "tooltip before:content-[attr(data-tip)] before:right-[-10px] before:left-auto before:transform-none"
            }`}
            data-tip={`${writeDisabled && "Wallet not connected or in the wrong network"}`}
          >
            <button
              className="btn btn-secondary btn-sm"
              disabled={writeDisabled || isSending || (!client && !sendUserOperationAsync)}
              onClick={handleWrite}
            >
              {isSending && <span className="loading loading-spinner loading-xs"></span>}
              Send 💸
            </button>
          </div>
        </div>
      </div>
      {zeroInputs && txResult ? (
        <div className="flex-grow basis-0">
          <TxReceipt txResult={txResult} />
        </div>
      ) : null}
    </div>
  );
};

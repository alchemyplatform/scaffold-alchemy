import { calculateCreate2Address } from "./calculateCreate2Address";
import { getChainById } from "./chainUtils";
import { getAccountKitClient } from "./getAccountKitClient";
import { randomBytes } from "crypto";

export async function deployWithAA(chainId: string | number, bytecode: string) {
  const chain = getChainById(chainId);
  const client = await getAccountKitClient(chain);

  // A CREATE2 Deployer
  // https://github.com/Arachnid/deterministic-deployment-proxy
  const target = "0x4e59b44847b379578588920ca78fbf26c0b4956c";
  // CREATE2 (salt + bytecode + sender)
  // lets just make the salt random so it deploys a new contract each time
  const salt = randomBytes(32).toString("hex");
  const data = ("0x" + salt + bytecode.slice(2)) as `0x${string}`;

  const deployedAddress = calculateCreate2Address(target, "0x" + salt, bytecode);

  console.log("Sending user operation...");
  const userOpResponse = await client.sendUserOperation({
    uo: {
      target,
      data,
      value: 0n,
    },
  });

  console.log("User operation response:", userOpResponse);

  if (!userOpResponse?.hash) {
    throw new Error(`Failed to get userOpHash. Response: ${JSON.stringify(userOpResponse)}`);
  }

  const userOpHash = userOpResponse.hash;
  console.log("User operation hash:", userOpHash);

  const transactionHash = await client.waitForUserOperationTransaction({ hash: userOpHash });
  console.log("Transaction hash:", transactionHash);

  return deployedAddress;
}

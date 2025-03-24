import { calculateCreate2Address } from "./calculateCreate2Address";
import { getChainById } from "./chainUtils";
import { getAccountKitClient } from "./getAccountKitClient";
import { randomBytes } from "crypto";
import { ethers } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export async function deployWithAA(
  factory: ethers.ContractFactory,
  contractName: string,
  hre: HardhatRuntimeEnvironment,
  constructorArgs: any[] = [],
) {
  const provider = hre.ethers.provider;
  const chainId = (await provider.getNetwork()).chainId.toString();
  const chain = getChainById(chainId);
  const client = await getAccountKitClient(chain);

  // A CREATE2 Deployer
  // https://github.com/Arachnid/deterministic-deployment-proxy
  const target = "0x4e59b44847b379578588920ca78fbf26c0b4956c";
  // CREATE2 (salt + bytecode + sender)
  // lets just make the salt random so it deploys a new contract each time
  const salt = randomBytes(32).toString("hex");
  // Encode constructor arguments and append them to the bytecode
  const encodedArgs = factory.interface.encodeDeploy(constructorArgs);
  const bytecodeWithArgs = factory.bytecode + encodedArgs.slice(2);
  const data = ("0x" + salt + bytecodeWithArgs.slice(2)) as `0x${string}`;

  const deployedAddress = calculateCreate2Address(target, "0x" + salt, bytecodeWithArgs);

  console.log("Deploying your contract in a user operation...");
  const userOpResponse = await client.sendUserOperation({
    uo: {
      target,
      data,
      value: 0n,
    },
  });

  if (!userOpResponse?.hash) {
    throw new Error(`Failed to get userOpHash. Response: ${JSON.stringify(userOpResponse)}`);
  }

  const userOpHash = userOpResponse.hash;
  console.log("User operation:", userOpHash);

  const transactionHash = await client.waitForUserOperationTransaction({
    hash: userOpHash,
    retries: {
      intervalMs: 1000,
      multiplier: 1.5,
      maxRetries: 10,
    },
  });
  console.log("Transaction:", transactionHash);

  await hre.deployments.save(contractName, {
    abi: factory.interface.fragments.map(fragment => {
      if (fragment.type === "constructor") {
        const f = fragment as ethers.ConstructorFragment;
        return {
          type: f.type,
          stateMutability: f.payable ? "payable" : "nonpayable",
          inputs: f.inputs || [],
        };
      }
      const f = fragment as ethers.FunctionFragment;
      return {
        type: f.type,
        name: f.name,
        stateMutability: f.stateMutability,
        inputs: f.inputs || [],
        outputs: f.outputs || [],
      };
    }),
    address: deployedAddress,
    bytecode: factory.bytecode,
    deployedBytecode: await provider.getCode(deployedAddress),
  });

  return deployedAddress;
}

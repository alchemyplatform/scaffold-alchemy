import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deployWithAA } from "../utils/deployWithAA";
/**
 * Deploys a contract named "Counter" using a smart account associated to SIGNING_KEY, if provided,
 * or else a random signing key will be used
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const CONTRACT_NAME = "Counter";
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const factory = await hre.ethers.getContractFactory(CONTRACT_NAME);
  const provider = hre.ethers.provider;
  const chainId = (await provider.getNetwork()).chainId.toString();
  const counterAddress = await deployWithAA(chainId, factory.bytecode);
  console.log("👋 Counter deployed to:", counterAddress);

  // Save the deployment to Hardhat's deployment system
  await hre.deployments.save(CONTRACT_NAME, {
    abi: factory.interface.format(),
    address: counterAddress,
    bytecode: factory.bytecode,
    deployedBytecode: await provider.getCode(counterAddress),
  });

  const counter = await hre.ethers.getContractAt(CONTRACT_NAME, counterAddress);
  console.log("👋 Initial value of x:", await counter.x());
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags Counter
deployYourContract.tags = ["Counter"];

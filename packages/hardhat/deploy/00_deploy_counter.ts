import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deployWithAA } from "../utils/deployWithAA";

/**
 * Deploys a contract named "Counter" using a smart account associated to SIGNING_KEY, if provided,
 * or else a random signing key will be used
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
export const CONTRACT_NAME = "Counter";
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const factory = await hre.ethers.getContractFactory(CONTRACT_NAME);

  // use account abstraction to deploy the contract, with the gas sponsored for us!
  const counterAddress = await deployWithAA(factory, CONTRACT_NAME, hre);
  console.log("👋 Counter deployed to:", counterAddress);

  const counter = await hre.ethers.getContractAt(CONTRACT_NAME, counterAddress);
  console.log("👋 Initial value of x:", await counter.x());
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags Counter
deployYourContract.tags = ["Counter"];

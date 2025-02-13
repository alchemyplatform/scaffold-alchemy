import { keccak256 } from "ethereum-cryptography/keccak";

export function calculateCreate2Address(deployer: string, salt: string, initCode: string) {
  const initCodeHash = keccak256(Buffer.from(initCode.slice(2), "hex"));

  const addressBytes = Buffer.concat([
    Buffer.from("ff", "hex"),
    Buffer.from(deployer.slice(2), "hex"),
    Buffer.from(salt.slice(2), "hex"),
    initCodeHash,
  ]);

  const address = "0x" + Buffer.from(keccak256(addressBytes)).toString("hex").slice(-40);

  return address;
}

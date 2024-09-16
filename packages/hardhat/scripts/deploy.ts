import { ethers } from "hardhat";

async function main() {
  const chamaPay = await ethers.deployContract("ChamaPay");

  await chamaPay.waitForDeployment();

  console.log("ChamaPay address - " + (await chamaPay.getAddress()));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

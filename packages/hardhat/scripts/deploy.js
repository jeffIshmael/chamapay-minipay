const { ethers } = require("hardhat");

async function main() {

  // Deploying contract with constructor arguments
  const chamaPay = await ethers.deployContract("ChamaPay");

  await chamaPay.waitForDeployment();

  console.log("ChamaPay contract address - " + (await chamaPay.getAddress()));
}

// Error handling
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


//0x7aAa436c48359939cD06841c11DA55434Cf7762f
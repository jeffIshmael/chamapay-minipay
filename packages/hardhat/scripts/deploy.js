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


//0x284240b2B7A9Fa5dCA3a5a2fDcf5b4257B8583db - testnet
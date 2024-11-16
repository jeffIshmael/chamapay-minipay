import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@openzeppelin/hardhat-upgrades";

require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY as string;
const celoScanApiKey = process.env.CELOSCAN_API_KEY;
const defenderApi = process.env.DEFENDER as string;
const defenderSecret = process.env.DEFENDER_SEC as string;

if ( !defenderApi || !defenderSecret) {
  throw new Error("PRIVATE_KEY is not set");
}
if (!celoScanApiKey) {
  throw new Error("CELOSCAN_API_KEY is not set");
}

const config: any = {
  solidity: "0.8.20",
  defender:{
    apiKey: defenderApi,
    apiSecret: defenderSecret,
  },
  networks: {
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: [PRIVATE_KEY],
    },
    celo: {
      url: "https://forno.celo.org",
      chainId: 42220,
      accounts: [PRIVATE_KEY],
  },
  sepolia:{
    url:"https://sepolia-optimism.etherscan.io/",
    chainId:11155420,
  }
  },
  etherscan: {
    apiKey: {
        alfajores: celoScanApiKey,
        celo: celoScanApiKey,
    },
    customChains: [
        {
            network: "alfajores",
            chainId: 44787,
            urls: {
                apiURL: "https://api-alfajores.celoscan.io/api",
                browserURL: "https://alfajores.celoscan.io",
            },
        },
        {
            network: "celo",
            chainId: 42220,
            urls: {
                apiURL: "https://api.celoscan.io/api",
                browserURL: "https://celoscan.io/",
            },
        },
    ],
},
};

export default config;


//0x03b3db48466747e3C52c9291C2CcEA0d472429fB
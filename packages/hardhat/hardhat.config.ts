import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY as string;
const celoScanApiKey = process.env.CELOSCAN_API_KEY;

if (!PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY is not set");
}
if (!celoScanApiKey) {
  throw new Error("CELOSCAN_API_KEY is not set");
}

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: [PRIVATE_KEY],
    },
    celo: {
      url: "https://forno.celo.org",
      accounts: [PRIVATE_KEY],
  },
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

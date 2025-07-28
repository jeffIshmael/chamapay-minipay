"use client";

import {
  RainbowKitProvider,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import { injectedWallet } from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { celo, celoAlfajores } from "wagmi/chains";
import { farcasterFrame as miniAppConnector } from "@farcaster/frame-wagmi-connector";
import { PermissionlessProvider } from "@permissionless/wagmi";
// import dotenv from "dotenv";
// dotenv.config();

// if (!process.env.PIMLICO_API) {
//   throw new Error("PIMLICO_API not found in .env");
// }

// const pimlicoApiKey = process.env.PIMLICO_API;

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [injectedWallet],
    },
  ],
  {
    appName: "ChamaPay",
    projectId: "96d07018513129235d7af00f1cc9fcdb",
  }
);

const capabilities = {
  paymasterService: {
    [celo.id]: {
      url: "/api/pimlico",
    },
  },
};

export const config = createConfig({
  // chains: [celoAlfajores],
  chains: [celo],
  transports: {
    // [celoAlfajores.id]: http(),
    [celo.id]: http(),
  },
  connectors: [...connectors, miniAppConnector()],
});

// const capabilities = {
//   paymasterService: {
//     [celo.id]: {
//       url: `https://api.pimlico.io/v2/${celo.id}/rpc?apikey=${pimlicoApiKey}`,
//     },
//   },
// };

export function BlockchainProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <PermissionlessProvider capabilities={capabilities}>
          <RainbowKitProvider>{children}</RainbowKitProvider>
        </PermissionlessProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

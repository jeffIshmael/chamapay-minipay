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

// const miniApp = miniAppConnector();

export const config = createConfig({
  // chains: [celoAlfajores],
  chains: [celo],
  transports: {
    // [celoAlfajores.id]: http(),
    [celo.id]: http(),
  },
  connectors: [...connectors, miniAppConnector()],
});

export function BlockchainProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

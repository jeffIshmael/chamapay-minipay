import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { BlockchainProviders } from "@/Providers/BlockchainProviders";
import { Toaster } from "sonner";
import { fcEmbed } from "@/lib/fcMetadata";
import { IsFarcasterProvider } from "./context/isFarcasterContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChamaPay",
  description: "Digital rotary group chama",
  other: {
    "fc:frame": JSON.stringify(fcEmbed),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`bg-gypsum  border-gray shadow-lg shadow-stone-400 border-rounded-lg max-w-sm mx-auto  min-h-screen ${inter.className}`}
      >
        <BlockchainProviders>
          <IsFarcasterProvider>
            <Toaster /> {children}
          </IsFarcasterProvider>
        </BlockchainProviders>
      </body>
    </html>
  );
}

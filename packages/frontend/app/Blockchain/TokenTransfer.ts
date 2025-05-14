import { createPublicClient, createWalletClient, custom, http } from "viem";
import { celo } from "viem/chains";
import { toast } from "sonner";
import { cUSDContractAddress } from "../ChamaPayABI/ChamaPayContract";
import ERC20Abi from "@/app/ChamaPayABI/ERC20.json";
import { sdk } from "@farcaster/frame-sdk";

export const processCheckout = async (
  recepient: `0x${string}`,
  amount: bigint,
  currentConnector: string
) => {
  let provider;
  console.log("current connector", currentConnector);
  if (currentConnector === "farcaster") {
    if (sdk.wallet?.ethProvider) {
      provider = sdk.wallet.ethProvider;
    } else {
      toast("Farcaster wallet provider not available.");
      return false;
    }
  } else if (typeof window !== "undefined" && window.ethereum) {
    provider = window.ethereum;
  } else {
    toast("Ethereum provider not found.");
    return false;
  }

  // Switch chain if needed
  try {
    const currentChainId = await provider.request({ method: "eth_chainId" });
    if (parseInt(currentChainId, 16) !== celo.id) {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xa4ec" }], // 42220 in hex for Celo mainnet
      });
    }
  } catch (err: any) {
    // If Celo mainnet isn't added to the wallet, add it
    if (err.code === 4902) {
      try {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0xa4ec",
              chainName: "Celo",
              nativeCurrency: {
                name: "CELO",
                symbol: "CELO",
                decimals: 18,
              },
              rpcUrls: ["https://forno.celo.org"],
              blockExplorerUrls: ["https://explorer.celo.org"],
            },
          ],
        });
      } catch (addError) {
        console.error("Failed to add Celo mainnet:", addError);
        toast("Please add the Celo network to your wallet.");
        return false;
      }
    } else {
      console.error("Failed to switch chain:", err);
      toast("Please switch to the Celo network.");
      return false;
    }
  }

  const transport = custom(provider);

  const privateClient = createWalletClient({
    chain: celo,
    transport,
  });

  const publicClient = createPublicClient({
    chain: celo,
    transport,
  });

  const [address] = await privateClient.getAddresses();

  try {
    const checkoutTxnHash = await privateClient.writeContract({
      account: address,
      address: cUSDContractAddress,
      abi: ERC20Abi,
      functionName: "transfer",
      args: [recepient, amount],
    });

    const checkoutTxnReceipt = await publicClient.waitForTransactionReceipt({
      hash: checkoutTxnHash,
    });

    if (checkoutTxnReceipt.status === "success") {
      return checkoutTxnReceipt.transactionHash;
    }

    return false;
  } catch (error) {
    console.error(error);
    toast("Transaction failed, make sure you have enough balance");
    return false;
  }
};

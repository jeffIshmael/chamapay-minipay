import { createPublicClient, createWalletClient, custom, http } from "viem";
import { celoAlfajores } from "viem/chains";
import { toast } from "sonner";
import ERC20Abi from "@/app/ChamaPayABI/ERC20.json";
import { sdk } from "@farcaster/frame-sdk";

export const processCheckout = async (
  recepient: `0x${string}`,
  amount: bigint,
  currentConnector: string
) => {
  let provider;
  console.log("current conecter", currentConnector);
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

  // 🟡 Step 1: Switch chain if needed
  try {
    const currentChainId = await provider.request({ method: "eth_chainId" });
    if (parseInt(currentChainId, 16) !== celoAlfajores.id) {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaef3" }], // 44787 in hex
      });
    }
  } catch (err: any) {
    // If Alfajores isn't added to the wallet, add it
    if (err.code === 4902) {
      try {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0xaef3",
              chainName: "Celo Alfajores",
              nativeCurrency: {
                name: "CELO",
                symbol: "CELO",
                decimals: 18,
              },
              rpcUrls: ["https://alfajores-forno.celo-testnet.org"],
              blockExplorerUrls: ["https://celo-alfajores.blockscout.com"],
            },
          ],
        });
      } catch (addError) {
        console.error("Failed to add Alfajores chain:", addError);
        toast("Please add the Alfajores network to your wallet.");
        return false;
      }
    } else {
      console.error("Failed to switch chain:", err);
      toast("Please switch to the Celo Alfajores network.");
      return false;
    }
  }

  const transport = custom(provider);

  const privateClient = createWalletClient({
    chain: celoAlfajores,
    transport,
  });

  const publicClient = createPublicClient({
    chain: celoAlfajores,
    transport,
  });

  const [address] = await privateClient.getAddresses();

  try {
    const checkoutTxnHash = await privateClient.writeContract({
      account: address,
      address: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
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

import { createPublicClient, createWalletClient, custom, http } from "viem";
import { celoAlfajores } from "viem/chains";
import { toast } from "sonner";
import ERC20Abi from "@/app/ChamaPayABI/ERC20.json";

// Ensure that 'sdk' is available in the Farcaster Frame environment
declare const sdk: any;

export const processCheckout = async (
  recepient: `0x${string}`,
  amount: bigint,
  currentConnector: string
) => {
  let transport;

  if (currentConnector === "farcaster") {
    if (typeof sdk !== "undefined" && sdk.wallet?.ethProvider) {
      transport = custom(sdk.wallet.ethProvider);
    } else {
      toast("Farcaster wallet provider not available.");
      return false;
    }
  } else if (typeof window !== "undefined" && window.ethereum) {
    transport = custom(window.ethereum);
  } else {
    toast("Ethereum provider not found.");
    return false;
  }

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

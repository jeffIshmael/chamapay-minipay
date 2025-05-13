import { createPublicClient, createWalletClient, custom, http } from "viem";
import { celoAlfajores, celo } from "viem/chains";
import { toast } from "sonner";
import ERC20Abi from "@/app/ChamaPayABI/ERC20.json";
import { farcasterFrame as miniAppConnector } from "@farcaster/frame-wagmi-connector";

//transfer function
export const processCheckout = async (
  recepient: `0x${string}`,
  amount: bigint
) => {
  const privateClient = createWalletClient({
    chain: celoAlfajores,
    transport: custom(window.ethereum  ? window.ethereum : miniAppConnector()),
  });

  const publicClient = createPublicClient({
    chain: celoAlfajores,
    transport: custom(window.ethereum ? window.ethereum : miniAppConnector()),
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

    if (checkoutTxnReceipt.status == "success") {
      return checkoutTxnReceipt.transactionHash;
    }

    return false;
  } catch (error) {
    console.log(error);
    toast("Transaction failed, make sure you have enough balance");
    return false;
  }
};

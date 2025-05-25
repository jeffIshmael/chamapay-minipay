import { createPublicClient, createWalletClient, custom, http } from "viem";
import { celo } from "viem/chains";
import { toast } from "sonner";
import { cUSDContractAddress } from "../ChamaPayABI/ChamaPayContract";
import ERC20Abi from "@/app/ChamaPayABI/ERC20.json";

export const approveViemTx = async (
  recepient: `0x${string}`,
  amount: bigint
) => {
  if (window.ethereum) {
    const privateClient = createWalletClient({
      chain: celo,
      transport: custom(window.ethereum),
    });

    const publicClients = createPublicClient({
      chain: celo,
      transport: custom(window.ethereum),
    });

    const [address] = await privateClient.getAddresses();

    try {
      const checkoutTxnHash = await privateClient.writeContract({
        account: address,
        address: cUSDContractAddress,
        abi: ERC20Abi,
        functionName: "approve",
        args: [recepient, amount],
      });

      const checkoutTxnReceipt = await publicClients.waitForTransactionReceipt({
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
  }
  return false;
};

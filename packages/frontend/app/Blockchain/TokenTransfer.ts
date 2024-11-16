import { createPublicClient, createWalletClient, custom } from "viem";
import { celoAlfajores, celo} from "viem/chains";
// import {
//   tokencUSDAbi,
//   tokencUSDContractAddress,
// } from "./cUSDToken"
import { contractAddress } from "../ChamaPayABI/ChamaPayContract";
import { toast } from "sonner";
import ERC20Abi from "@/app/ChamaPayABI/ERC20.json"

//transfer function
export const processCheckout = async ( amount: number ) => {
    if (window.ethereum) {
      const privateClient = createWalletClient({
        chain: celo,
        transport: custom(window.ethereum),
      });

      const publicClient = createPublicClient({
        chain: celo,
        transport: custom(window.ethereum),
      });

      const [address] = await privateClient.getAddresses();

      try {
        const checkoutTxnHash = await privateClient.writeContract({
          account: address,
          address: "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
          abi: ERC20Abi,
          functionName: "transfer",
          args: [contractAddress, BigInt(amount)],
        });

        const checkoutTxnReceipt = await publicClient.waitForTransactionReceipt(
          {
            hash: checkoutTxnHash,
          }
        );

        if (checkoutTxnReceipt.status == "success") {
          // console.log(checkoutTxnHash);
          // console.log(checkoutTxnReceipt.transactionHash);
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
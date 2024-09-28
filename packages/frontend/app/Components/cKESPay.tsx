import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useReadContract, useAccount, useWriteContract } from "wagmi";
import { celo } from "viem/chains";
import erc20Abi from "@/app/ChamaPayABI/ERC20.json";
import { processCheckout } from "../Blockchain/TokenTransfer";
import { contractAddress, contractAbi } from "../ChamaPayABI/ChamaPayContract";
import { makePayment } from "../api/chama";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { revalidatePath } from "next/cache";

const CKESPay = ({ id , name }: { id: number , name:string}) => {
  const { isConnected, address } = useAccount();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { writeContractAsync } = useWriteContract();

  const { data } = useReadContract({
    chainId: celo.id,
    address: "0x456a3d042c0dbd3db53d5489e98dfb038553b0d0",
    functionName: "balanceOf",
    abi: erc20Abi,
    args: [address],
  });

  useEffect(() => {
    if (isConnected && address) {
      console.log(address);
      // console.log(id-6);
    }
  }, []);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      toast.error("Please connect wallet");
      return;
    }
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    // Convert the input amount (as a string) to a float
    const amount = parseFloat(data.amount as string);
    console.log(amount);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid amount");
      return;
    }
    // Convert to smallest unit (multiply by 10^18)
    const amountInWei = Number(amount * 10 ** 18);
    console.log(amountInWei);
    if (address && isConnected) {
      try {
        setLoading(true);
        const paid = await processCheckout(amountInWei);
        console.log(paid);

        if (paid) {
          await makePayment(amount, paid,  id, address);
          console.log("done");
          console.log(id);
          try {
            const hash = await writeContractAsync({
              address: contractAddress,
              abi: contractAbi,
              functionName: "depositCash",
              args: [id-1, (amount * 10**18)],
            });

            if (hash) {
              toast.success(`${amount} cKES paid to ${name}`);
              setLoading(false);
              // revalidatePath(`/Chama/${slug}`)
            } else {
              toast.error("unable to make payment, please try again");
            }
          } catch (error) {
            console.log(error);
            toast.error("A problem occured. Ensure wallet is connected.");
          }
        } else {
          toast.error(
            "Unable to make payment, please ensure you have enough cKES."
          );
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      toast.error("Please connect wallet.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-sm mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <Image
          src={"/static/images/cKES.png"}
          alt="cKES logo"
          width={50}
          height={50}
        />
        <h3 className="text-xl font-semibold">cKES Pay</h3>
      </div>
      <div>
        <form onSubmit={handlePayment} className="space-y-4">
          <div className="flex flex-col">
            <label
              htmlFor="amount"
              className="text-sm font-medium text-gray-600"
            >
              Amount (cKES)
            </label>
            <input
              type="text"
              id="amount"
              name="amount"
              placeholder="Input amount"
              className="mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
            />
          </div>
          <p className="text-right text-sm text-gray-500">
            Available balance:{Number(data) / 10 ** 18} cKES
          </p>
          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition duration-300"
            disabled={loading}
          >
            {loading ? "Processing..." : "Pay"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CKESPay;

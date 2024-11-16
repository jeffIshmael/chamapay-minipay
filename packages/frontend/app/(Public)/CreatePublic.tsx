import React, { useState } from "react";
import { checkChama, createChama } from "../../lib/chama";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAccount, useWriteContract } from "wagmi";
import { contractAbi, contractAddress } from "../ChamaPayABI/ChamaPayContract";
import { processCheckout } from "../Blockchain/TokenTransfer";

interface Form {
  amount: string;
  cycleTime: string;
  maxNumber: string;
  name: string;
  startDate: string;
}

const CreatePublic = () => {
  const [groupName, setGroupName] = useState("");
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("");
  const [startDate, setStartDate] = useState("");
  const [maxPeople, setMaxPeople] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openingModal, setOpeningModal] = useState(false);
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const [filledData, setFilledData] = useState<Form>({
    amount: "",
    cycleTime: "",
    maxNumber: "",
    name: "",
    startDate: "",
  });

  const openModal = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    console.log(data);

    // Set the form data and open the modal directly
    if (data) {
      try {
        setOpeningModal(true);
        const exists = await checkChama(data.name as string);
        if (exists) {
          toast.error("Choose another name.");
          return;
        } else {
          setFilledData(data as unknown as Form); // Save form data
          setShowModal(true); // Open modal
        }
      } catch (error) {
        console.log(error);
      } finally {
        setOpeningModal(false);
      }
    } else {
      console.log("unable");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      toast.error("Please connect wallet");
      return;
    }

    console.log(filledData);
    const amount = parseFloat(filledData.amount as string);
    console.log(amount);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid amount");
      return;
    }
    const amountInWei = Number(amount * 10 ** 18);

    if (address && isConnected) {
      //function to send the lock amount
      try {
        setProcessing(true);
        const paid = await processCheckout(amountInWei);
        if (paid) {
          try {
            setProcessing(false);
            setLoading(true);
            const dateObject = new Date(filledData.startDate as string);
            const dateInMilliseconds = dateObject.getTime();

            const hash = await writeContractAsync({
              address: contractAddress,
              abi: contractAbi,
              functionName: "registerChama",
              args: [
                BigInt(amountInWei),
                BigInt(Number(filledData.cycleTime)),
                BigInt(dateInMilliseconds),
                BigInt(Number(filledData.maxNumber)),
                true,
              ],
            });

            if (hash) {
              try {
                const formData = new FormData();
                formData.append("name", filledData.name);
                formData.append("amount", filledData.amount);
                formData.append("cycleTime", filledData.cycleTime);
                formData.append("maxNumber", filledData.maxNumber);
                formData.append("startDate", filledData.startDate);

                await createChama(formData, "Public", address);

                console.log("done");
                toast.success(`${filledData.name} created successfully.`);
                setLoading(false);
                router.push("/MyChamas");
              } catch (error) {
                console.log(error);
                toast.error("Unable, Try using another group name");
                setLoading(false);
              } finally {
                setProcessing(false);
                setLoading(false);
              }
            } else {
              toast.error("unable to create, please try again");
            }
          } catch (error) {
            console.log(error);
          } finally {
            setLoading(false);
            setProcessing(false);
          }
        } else {
          toast.error(`make sure you have ${amount} cKES in your wallet.`);
        }
      } catch (error) {
        toast.error("Oops!!something happened.");
        console.log(error);
      } finally {
        setProcessing(false);
        setLoading(false);
      }
    } else {
      toast.error("Please connect wallet.");
    }
  };

  return (
    <div className="relative w-full mx-auto">
      {/* Adjusted "drop" effect for Public */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Lock Amount
            </h2>
            <p className="text-gray-600 mb-6">
              You need to lock the required amount before proceeding to create
              the public chama.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={
                  loading || processing ? undefined : () => setShowModal(false)
                }
                disabled={loading || processing}
                className={`px-4 py-2 bg-gray-300 text-gray-700 rounded-md  ${
                  loading || processing ? "hover:cursor-not-allowed":"hover:bg-gray-400"}`}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || processing}
                className={`px-4 py-2  text-white rounded-md  ${
                  processing || loading
                    ? "opacity-50 cursor-not-allowed"
                    : "bg-downy-500 hover:bg-downy-600"
                }`}
              >
                {loading
                  ? "creating..."
                  : processing
                  ? "Processing..."
                  : "Proceed"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* <div className="absolute w-0 h-0 border-b-[16px] border-b-transparent  border-r-[2px] border-r-white border-t-[16px] border-t-transparent left-[75%] transform -translate-x-1/2 -translate-y-[65%]"></div> */}
      <div className="absolute w-0 h-0 border-b-[16px] border-b-transparent  border-r-[34px] border-r-white border-t-[20px] border-t-transparent left-[74%] transform -translate-x-1/2 -translate-y-[45%]"></div>

      <form
        onSubmit={openModal}
        className="space-y-4 bg-white p-6 rounded-3xl shadow-md w-full mt-3 transform origin-top animate-fadeIn"
      >
        <div className=" flex flex-column-2 space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-10 h-10 text-downy-400"
          >
            <path
              fillRule="evenodd"
              d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38Z"
              clipRule="evenodd"
            />
            <path d="M5.082 14.254a8.287 8.287 0 0 0-1.308 5.135 9.687 9.687 0 0 1-1.764-.44l-.115-.04a.563.563 0 0 1-.373-.487l-.01-.121a3.75 3.75 0 0 1 3.57-4.047ZM20.226 19.389a8.287 8.287 0 0 0-1.308-5.135 3.75 3.75 0 0 1 3.57 4.047l-.01.121a.563.563 0 0 1-.373.486l-.115.04c-.567.2-1.156.349-1.764.441Z" />
          </svg>

          <input
            type="text"
            id="groupName"
            name="name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
            placeholder="Enter Group Name"
            className="mt-1 block w-full rounded-md border-downy-200 shadow-sm focus:border-downy-500 focus:ring-downy-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700"
          >
            Max No. of people
          </label>
          <input
            type="number"
            id="maxPeople"
            name="maxNumber"
            value={maxPeople}
            onChange={(e) => setMaxPeople(e.target.value)}
            required
            placeholder="Enter Max No. of people"
            className="mt-1 block w-full rounded-md border-downy-200 shadow-sm focus:border-downy-500 focus:ring-downy-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700"
          >
            Amount(in cKes)
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            placeholder="Contribution Amount(cKes)"
            className="mt-1 block w-full rounded-md border-downy-200 shadow-sm focus:border-downy-500 focus:ring-downy-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700"
          >
            Start Date
          </label>
          <input
            type="datetime-local"
            id="startDate"
            name="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="mt-1 block w-full text-gray-500 rounded-md border-downy-200 shadow-sm focus:border-downy-500 focus:ring-downy-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="duration"
            className="block text-sm font-medium text-gray-700"
          >
            Cycle Time (in days)
          </label>
          <input
            type="number"
            id="duration"
            name="cycleTime"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
            placeholder="Enter Cycle Time (in days)"
            className="mt-1 block w-full rounded-md border-downy-200 shadow-sm focus:border-downy-500 focus:ring-downy-500 sm:text-sm"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={openingModal}
            className={`flex items-center justify-center font-semibold py-2 px-4 rounded-md ${
              openingModal
                ? "bg-gray-300 text-gray-400 hover:bg-gray-300 cursor-not-allowed"
                : "bg-downy-500 hover:bg-downy-600 text-white"
            }`}
          >
            {openingModal ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C6.477 0 2 4.477 2 10h2zm2 5.292A7.962 7.962 0 014 12H2c0 2.042.784 3.897 2.05 5.292l1.95-1.95z"
                  ></path>
                </svg>
                ...
              </>
              
            ) : (
              "Create Chama"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePublic;

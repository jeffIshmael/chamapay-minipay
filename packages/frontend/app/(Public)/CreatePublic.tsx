import React, { useEffect, useState } from "react";
import { checkChama, createChama } from "../../lib/chama";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useAccount,
  useSwitchChain,
  useChainId,
  useWriteContract,
} from "wagmi";
import {
  contractAbi,
  contractAddress,
  cUSDContractAddress,
} from "../ChamaPayABI/ChamaPayContract";
import ERC2OAbi from "@/app/ChamaPayABI/ERC20.json";
import { processCheckout } from "../Blockchain/TokenTransfer";
import { FiAlertTriangle, FiGlobe } from "react-icons/fi";
import { parseEther } from "viem";
import { getLatestChamaId } from "@/lib/readFunctions";
import { showToast } from "../Components/Toast";
import { getDataSuffix, submitReferral } from "@divvi/referral-sdk";
import { useIsFarcaster } from "../context/isFarcasterContext";
import { registrationTx } from "@/lib/divviRegistration";
import { config } from "@/Providers/BlockchainProviders";
import { waitForTransactionReceipt } from "@wagmi/core";

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
  const [errorText, setErrorText] = useState("");
  const [startDateDate, setStartDateDate] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { isFarcaster, setIsFarcaster } = useIsFarcaster();
  const { writeContractAsync } = useWriteContract();
  const [filledData, setFilledData] = useState<Form>({
    amount: "",
    cycleTime: "",
    maxNumber: "",
    name: "",
    startDate: "",
  });

  const openModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    const startingDate = `${startDateDate}T${startDateTime}`;
    setStartDate(startingDate);

    if (isNaN(Number(data.amount)) || Number(data.amount) <= 0) {
      setErrorText("Amount must be greater than 0");
      return;
    }
    if (isNaN(Number(data.maxNumber)) || Number(data.maxNumber) <= 1) {
      setErrorText("Max number must be greater than 1");
      return;
    }
    if (isNaN(Number(data.maxNumber)) || Number(data.maxNumber) > 15) {
      setErrorText("Max number of members is 15");
      return;
    }
    if (isNaN(Number(data.cycleTime)) || Number(data.cycleTime) <= 0) {
      setErrorText("Cycle time must be greater than 0");
      return;
    }
    if (!data.name || (data.name as string).length < 3 || data.name === "") {
      setErrorText("Name must be at least 3 characters long");
      return;
    }
    if (startingDate < new Date().toISOString()) {
      setErrorText("Start date must be in the future");
      return;
    }

    try {
      setOpeningModal(true);
      const exists = await checkChama(data.name as string);
      if (exists) {
        setErrorText("chama with the name already exists");
        return;
      }
      setFilledData(data as unknown as Form); // Save form data
      setShowModal(true); // Open modal
    } catch (error) {
      console.log(error);
    } finally {
      setOpeningModal(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");
    if (!isConnected || !address) {
      toast.error("Please connect wallet");
      return;
    }

    const amount = parseFloat(filledData.amount as string);
    const amountInWei = parseEther(amount.toString());
    const blockchainId = await getLatestChamaId();

    //function to send the lock amount
    try {
      setProcessing(true);
      const approveHash = await writeContractAsync({
        address: cUSDContractAddress,
        abi: ERC2OAbi,
        functionName: "approve",
        args: [contractAddress, amountInWei],
      });
      const txHash = await waitForTransactionReceipt(config, {
        hash: approveHash,
      });
      if (txHash) {
        setProcessing(false);
        setLoading(true);
        const dateObject = new Date(startDate);
        const dateInMilliseconds = dateObject.getTime();

        const chamaArgs = [
          amountInWei,
          BigInt(Number(filledData.cycleTime)),
          BigInt(dateInMilliseconds),
          BigInt(Number(filledData.maxNumber)),
          true,
        ];
        const hash = await registrationTx("registerChama", chamaArgs);
        // const hash = await writeContractAsync({
        //   address: contractAddress,
        //   abi: contractAbi,
        //   functionName: "registerChama",
        //   args: chamaArgs,
        //   value: amountInWei
        // });
        if (hash) {
          const formData = new FormData();
          const localDateTime = new Date(startDate);
          const startDateUTC = localDateTime.toISOString();
          formData.append("name", filledData.name);
          formData.append("amount", filledData.amount);
          formData.append("cycleTime", filledData.cycleTime);
          formData.append("maxNumber", filledData.maxNumber);
          formData.append("startDate", startDateUTC);

          await createChama(
            formData,
            startDateUTC,
            "Public",
            address,
            blockchainId,
            hash
          );
          showToast(`${filledData.name} created successfully.`, "success");
          setLoading(false);
          router.push("/MyChamas");
        } else {
          showToast("unable to create, please try again.", "error");
          setErrorText("unable to create, please try again");
        }
      } else {
        setErrorText(`Ensure you have ${amount} cUSD in your wallet.`);
      }
    } catch (error) {
      showToast("Oops!!something happened.", "error");
      setErrorText("Oops!!something happened.");
      console.log(error);
    } finally {
      setProcessing(false);
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full mx-auto">
      {/* Adjusted "drop" effect for Public */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            {errorText && (
              <div className="text-red-500 p-2 flex items-center border border-red-500 rounded-md relative mb-2">
                <FiAlertTriangle className="text-red-500 text-sm mr-2" />
                <span className="block sm:inline text-sm">{errorText}</span>
              </div>
            )}
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Lock Amount
            </h2>
            <p className="text-gray-600 mb-6">
              You need to lock {amount} cUSD before proceeding to create
              {filledData.name} chama.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={
                  loading || processing ? undefined : () => setShowModal(false)
                }
                disabled={loading || processing}
                className={`px-4 py-2 bg-gray-300 text-gray-700 rounded-md  ${
                  loading || processing
                    ? "hover:cursor-not-allowed hover:bg-gray-300"
                    : "hover:bg-gray-400"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || processing}
                className={`px-4 py-2  text-white rounded-md  ${
                  processing || loading
                    ? "opacity-50 cursor-not-allowed :"
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
        {errorText && (
          <div
            className="text-red-500 p-2 flex items-center border border-red-500 rounded-md relative mb-2"
            role="alert"
          >
            <FiAlertTriangle className="text-red-500 text-sm mr-2" />
            <span className="block sm:inline text-sm">{errorText}</span>
          </div>
        )}
        <div className=" flex flex-column-2 items-center space-x-2">
          <FiGlobe className="text-downy-500 text-3xl" />

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
            Max No. of people(2 - 15 pple)
          </label>
          <input
            type="number"
            id="maxPeople"
            name="maxNumber"
            value={maxPeople}
            min={2}
            step={1}
            max={15}
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
            Amount(in cUSD)
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            placeholder="Enter Contribution Amount(cUSD)"
            className="mt-1 block w-full rounded-md border-downy-200 shadow-sm focus:border-downy-500 focus:ring-downy-500 sm:text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700"
            >
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={startDateDate}
              onChange={(e) => setStartDateDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
              className="mt-1 block w-full text-gray-500 rounded-md border-downy-200 shadow-sm focus:border-downy-500 focus:ring-downy-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="startTime"
              className="block text-sm font-medium text-gray-700"
            >
              Time
            </label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              value={startDateTime}
              onChange={(e) => setStartDateTime(e.target.value)}
              required
              className="mt-1 block w-full text-gray-500 rounded-md border-downy-200 shadow-sm focus:border-downy-500 focus:ring-downy-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="duration"
            className="block text-sm font-medium text-gray-700"
          >
            Cycle Time (in days) (min 1)
          </label>
          <input
            type="number"
            id="duration"
            name="cycleTime"
            value={duration}
            min={1}
            step={1}
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

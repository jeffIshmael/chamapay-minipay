"use client";

import React, { useEffect, useState } from "react";
import { createChama, checkChama } from "../../lib/chama";
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { toast } from "sonner";
import { contractAddress, contractAbi } from "../ChamaPayABI/ChamaPayContract";
import { useRouter } from "next/navigation";
import { getLatestChamaId } from "@/lib/readFunctions";
import { parseEther } from "viem";
import { FiAlertTriangle } from "react-icons/fi";
import { showToast } from "../Components/Toast";
import { registrationTx } from "@/lib/divviRegistration";
import { registerOnEarnbase } from "@/lib/Helpers/Register";

const CreateFamily = () => {
  const [groupName, setGroupName] = useState("");
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [errorText, setErrorText] = useState("");
  const { writeContractAsync } = useWriteContract();
  const [startDateDate, setStartDateDate] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [coupon, setCoupon] = useState("");
  const { isConnected, address } = useAccount();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setErrorText("");
    if (!isConnected) {
      showToast("Please connect wallet", "warning");
      setIsPending(false);
      return;
    }
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    const amount = parseFloat(data.amount as string);
    const startDate = `${startDateDate}T${startDateTime}`;

    if (isNaN(amount) || amount <= 0) {
      setErrorText("Amount must be greater than 0");
      setIsPending(false);
      return;
    }
    if (isNaN(Number(data.cycleTime)) || Number(data.cycleTime) <= 0) {
      setErrorText("Cycle time must be greater than 0");
      setIsPending(false);
      return;
    }
    if (!data.name || (data.name as string).length < 3 || data.name === "") {
      setErrorText("Name must be at least 3 characters long");
      setIsPending(false);
      return;
    }
    if (new Date(startDate) < new Date()) {
      setErrorText("Start date must be in the future");
      setIsPending(false);
      return;
    }

    try {
      const exists = await checkChama(data.name as string);
      if (exists) {
        setErrorText("Chama with this name already exists");
        return;
      }
      if (address && isConnected) {
        const dateObject = new Date(startDate as string);

        const dateInSeconds = Math.floor(dateObject.getTime() / 1000);
        // get the current blockchain id from the blockchain
        const chamaIdToUse = await getLatestChamaId();
        const localDateTime = new Date(`${startDateDate}T${startDateTime}`);
        const startDateUTC = localDateTime.toISOString();
        console.log("the localDateTime is", localDateTime);
        console.log("the startDateUTCTime is", startDateUTC);

        const chamaArgs = [
          parseEther(data.amount as string),
          BigInt(Number(data.cycleTime)),
          BigInt(dateInSeconds),
          BigInt(Number(0)), //no max members
          false,
        ];

        const hash = await registrationTx("registerChama", chamaArgs);

        if (hash) {
          // check if creator used the right promo code
          const promo = coupon.toLowerCase() === "cpbs001" ? "CPBS001" : null;
          await createChama(
            formData,
            startDateUTC,
            "Private",
            address,
            chamaIdToUse,
            hash,
            promo
          );

          // If user used the promo code, make sure they are registered on earnbase
          if(promo){
           const isRegistered = await registerOnEarnbase(address as string);
           if (!isRegistered){
            toast("Done:Head to earnbase to receive promo rewards.");
           }

         }
          showToast(`${data.name} created successfully.`, "success");
          router.push("/MyChamas");
        } else {
          toast.error("unable to write on bc, make sure you have enough funds");
        }
      } else {
        setErrorText("Please connect wallet.");
      }
    } catch (error) {
      setErrorText("A problem occured, try again.");
      setIsPending(false);
      console.log(error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="relative w-full mx-auto">
      {/* Adjusted "drop" effect */}
      <div className="absolute w-0 h-0 border-b-[16px] border-b-transparent border-l-[24px]  border-l-white border-t-[16px] border-t-transparent left-1/4 transform -translate-x-1/2 -translate-y-[56%]"></div>

      {/* <div className="absolute w-0 h-0 border-b-[16px] border-b-white border-l-[24px]  border-l-white border-t-[1px] border-t-transparent left-1/2 transform -translate-x-1/2 -translate-y-[55%]"></div> */}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-3xl shadow-md w-full mt-3 transform origin-top animate-fadeIn"
      >
        {errorText && (
          <div className="text-red-500 p-2 flex items-center border border-red-500 rounded-md relative mb-2">
            <FiAlertTriangle className="text-red-500 text-sm mr-2" />
            <span className="block sm:inline text-sm">{errorText}</span>
          </div>
        )}
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
            Amount(in cUSD)
          </label>
          <input
            type="text"
            id="amount"
            name="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter Contribution Amount(cUSD)"
            required
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
              className="mt-1 block w-full text-gray-700 rounded-md border-downy-200 shadow-sm focus:border-downy-500 focus:ring-downy-500 sm:text-sm"
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
              className="mt-1 block w-full text-gray-700 rounded-md border-downy-200 shadow-sm focus:border-downy-500 focus:ring-downy-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="duration"
            className="block text-sm font-medium text-gray-700"
          >
            Cycle Time (in days) (min 1 day)
          </label>
          <input
            type="number"
            id="duration"
            name="cycleTime"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Enter Cycle Time"
            required
            className="mt-1 block w-full rounded-md border-downy-200 shadow-sm focus:border-downy-500 focus:ring-downy-500 sm:text-sm"
          />
        </div>
        <div className="mt-2">
          <label
            htmlFor="coupon"
            className="block text-sm font-semibold text-downy-600 mb-1"
          >
            Got a Promo Code? (optional)
          </label>
          <div className="relative">
            <input
              type="text"
              id="coupon"
              name="coupon"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="e.g. CPBS001"
              className="pl-12 pr-4 py-2 w-full text-sm rounded-full bg-downy-50 text-downy-600 placeholder-downy-300 border border-downy-200 shadow-inner focus:outline-none focus:ring-2 focus:ring-downy-300 focus:border-downy-400 transition duration-200 ease-in-out"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-downy-400 text-base">
              💌
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className={`  font-semibold py-2 px-4 rounded-md ${
              isPending
                ? "bg-gray-300 text-gray-400 hover:bg-gray-300 cursor-not-allowed"
                : "bg-downy-500  hover:bg-downy-600 text-white"
            }`}
          >
            {isPending ? "Creating..." : "Create Chama"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateFamily;

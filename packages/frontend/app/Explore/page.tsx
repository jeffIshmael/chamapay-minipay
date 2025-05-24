"use client";

import React, { useEffect, useState } from "react";
import { getPublicChamas, getPublicNotMember } from "../../lib/chama";
import Link from "next/link";
import Image from "next/image";
import {
  duration as getDuration,
  getPicture,
  utcToLocalTime,
} from "@/utils/duration";
import BottomNavbar from "../Components/BottomNavbar";
import { formatEther } from "viem";
import { IoMdCash, IoMdPeople, IoMdTime } from "react-icons/io";
import { useAccount } from "wagmi";

interface Chama {
  adminId: number;
  amount: bigint;
  createdAt: Date;
  cycleTime: number;
  id: number;
  maxNo: number;
  members: {
    id: number;
    userId: number;
    chamaId: number;
    payDate: Date;
  }[];
  name: string;
  payDate: Date;
  slug: string;
  startDate: Date;
  started: boolean;
  type: string;
}

const ChamaCard = ({ chama }: { chama: Chama }) => {
  const [chamaDuration, setChamaDuration] = useState<string | null>(null);

  useEffect(() => {
    const fetchDuration = async () => {
      const durationValue = await getDuration(chama.cycleTime);
      setChamaDuration(durationValue);
    };

    fetchDuration();
  }, [chama.cycleTime]);

  return (
    <Link href={`/Chama/${chama.slug}`} className="block h-full">
      <div className="border p-4 rounded-2xl shadow-sm hover:shadow-lg transition-all bg-white flex flex-col h-full group relative">
        {/* Status - Updated to show Full status */}
        <div className="flex justify-end">
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              chama.members.length >= chama.maxNo
                ? "bg-purple-100 text-purple-600" // Full style
                : chama.started
                ? "bg-green-100 text-green-600" // Started style
                : "bg-red-100 text-red-600" // Not started style
            }`}
          >
            {chama.members.length >= chama.maxNo
              ? "Full"
              : chama.started
              ? "Started"
              : "Not Started"}
          </span>
        </div>

        {/*Full banner overlay */}
        {/* {chama.members.length >= chama.maxNo && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
            <span className="bg-purple-600 text-white px-3 py-1 rounded-full font-medium text-sm">
              Group Full
            </span>
          </div>
        )} */}

        {/* Profile and Name */}
        <div className="flex flex-col mt-2">
          <Image
            src={`https://ipfs.io/ipfs/Qmd1VFua3zc65LT93Sv81VVu6BGa2QEuAakAFJexmRDGtX/${getPicture(
              Number(chama.id)
            )}.jpg`}
            alt="Chama Profile"
            width={100}
            height={100}
            className={`rounded-full border-2 ${
              chama.members.length >= chama.maxNo
                ? "border-purple-200 opacity-80"
                : "border-gray-200"
            }`}
            priority={false}
            loading="lazy"
          />
          <h1
            className={`text-lg font-semibold truncate ${
              chama.members.length >= chama.maxNo
                ? "text-gray-500"
                : "text-gray-800"
            }`}
          >
            {chama.name}
          </h1>
        </div>

        {/* Details */}
        <div
          className={`mt-2 space-y-2 text-sm ${
            chama.members.length >= chama.maxNo
              ? "text-gray-400"
              : "text-gray-600"
          }`}
        >
          <div className="flex items-center gap-2">
            <IoMdPeople className="text-downy-600" />
            <span>
              {chama.members.length} / {chama.maxNo} Members
              {chama.members.length >= chama.maxNo && " (Full)"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <IoMdCash className="text-downy-600" />
            <span>{formatEther(chama.amount)} cUSD</span>
          </div>

          <div className="flex items-center gap-2">
            <IoMdTime className="text-downy-600" />
            {chamaDuration && <span>{chamaDuration}</span>}
          </div>

          <div className="text-sm">
            {chama.started
              ? `Next Pay: ${utcToLocalTime(chama.payDate)}`
              : `Starts on: ${utcToLocalTime(chama.startDate)}`}
          </div>
        </div>
      </div>
    </Link>
  );
};

const Page = () => {
  const [chamas, setChamas] = useState<Chama[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // New loading state
  const { address, isConnected } = useAccount();

  useEffect(() => {
    const fetchChamas = async () => {
      try {
        setLoading(true); // Start loading
        if (!isConnected || !address) {
          const AllPublic = await getPublicChamas();
          setChamas(AllPublic);
          return;
        }
        const data = await getPublicNotMember(address as string);
        setChamas(data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching chamas:", error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchChamas();
  }, [address]);

  const publicChamas = chamas.filter((chama) => chama.type === "Public");

  return (
    <div>
      <div className="w-full px-2 py-6 bg-downy-100 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Explore Public Chamas
          </h1>
          {loading ? ( // Display loading indicator
            <p className="text-center text-gray-500">Loading chamas...</p>
          ) : publicChamas.length === 0 ? ( // Show message if no chamas exist
            <p className="text-center text-gray-500">
              No public chamas available.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {publicChamas.map((chama) => (
                <ChamaCard key={chama.id} chama={chama} />
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomNavbar activeSection="" setActiveSection={() => {}} />
    </div>
  );
};

export default Page;

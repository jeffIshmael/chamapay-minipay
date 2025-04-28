"use client";

import React, { useEffect, useState } from "react";
import { getChamas } from "../../lib/chama";
import Link from "next/link";
import Image from "next/image";
import { duration as getDuration } from "@/utils/duration";
import BottomNavbar from "../Components/BottomNavbar";
import { formatEther } from "viem";

interface User {
  chamaId: number;
  id: number;
  payDate: Date;
  user: {
    id: number;
    address: string;
    name: string | null;
    role: string;
  };
  userId: number;
}

interface Chama {
  adminId: number;
  amount: bigint;
  createdAt: Date;
  cycleTime: number;
  id: number;
  maxNo: number;
  members: User[];
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
    <Link href={`/Chama/${chama.slug}`} className="block">
      <div className="border p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow bg-white flex flex-col justify-between min-h-[300px] h-full ">
        {/* Status and Arrow */}
        <div className="flex justify-end items-center mb-4">
          <p
            className={`text-sm ${
              chama.started ? "text-green-500" : "text-red-500"
            }`}
          >
            {chama.started ? "Started" : "Not Started"}
          </p>
        </div>

        {/* Profile Image and Name */}
        <div className="flex items-center mb-4">
          <Image
            src={`https://ipfs.io/ipfs/Qmd1VFua3zc65LT93Sv81VVu6BGa2QEuAakAFJexmRDGtX/${chama.id}.jpg`}
            alt="Chama Profile"
            width={50}
            height={50}
            className="rounded-full "
            priority={false}
            loading="lazy"
          />
        </div>
        <h1 className="ml-2 text-xl font-bold text-gray-800 truncate">
          {chama.name}
        </h1>

        {/* Chama Details */}
        <div className="mb-4">
          <h2 className="text-gray-700">
            Members: {chama.members.length} /{" "}
            {chama.maxNo}
          </h2>
          <h3 className="text-gray-700 mt-1">
            {formatEther(chama.amount)} cUSD / {chamaDuration ? chamaDuration : ""}
          </h3>
          <h3 className="text-gray-700 text-sm mt-1">
            {chama.started
              ? `Next Pay: ${new Date(chama.payDate).toLocaleDateString()}`
              : `Start Date: ${new Date(chama.startDate).toLocaleDateString()}`}
          </h3>
        </div>

        {/* Arrow Icon at the Bottom */}
        <div className="flex justify-end">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 text-gray-400"
          >
            <path
              fillRule="evenodd"
              d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
};

const Page = () => {
  const [chamas, setChamas] = useState<Chama[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // New loading state

  useEffect(() => {
    const fetchChamas = async () => {
      try {
        setLoading(true); // Start loading
        const data = await getChamas();
        setChamas(data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching chamas:", error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchChamas();
  }, []);

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
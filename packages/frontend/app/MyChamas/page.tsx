"use client";

import React, { useEffect, useState } from "react";
import BottomNavbar from "../Components/BottomNavbar";
import Image from "next/image";
import Link from "next/link";
import { useAccount } from "wagmi";
import { handler, getChamasByUser, getUser } from "../../lib/chama";

interface Chama {
  adminId: number;
  amount: number;
  createdAt: Date;
  cycleTime: number;
  id: number;
  maxNo: number;
  name: string;
  payDate: Date;
  slug: string;
  startDate: Date;
  started: boolean;
  type: string;
}

interface User {
  id: number;
  address: string;
  role: string;
  name: string;
}

const Page = () => {
  const [activeSection, setActiveSection] = useState("Chamas");
  const [chamas, setChamas] = useState<Chama[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const { isConnected, address } = useAccount();
  const [user, setUser] = useState(0);

  const friendsChama = chamas.filter((chama) => chama.type === "Private");
  const publicChama = chamas.filter((chama) => chama.type === "Public");
  // console.log(friendsChama);

  const duration = (cycleTime: number) => {
    const daysInYear = 365;
    const daysInMonth = 30; // Approximate month duration
    const daysInWeek = 7;

    // Calculate time units and their remainders
    const years = Math.floor(cycleTime / daysInYear);
    const months = Math.floor(cycleTime / daysInMonth);
    const weeks = Math.floor(cycleTime / daysInWeek);

    const remainderYears = cycleTime % daysInYear;
    const remainderMonths = cycleTime % daysInMonth;
    const remainderWeeks = cycleTime % daysInWeek;

    let result = "";

    // Display the highest unit if there is no remainder, otherwise display in days
    if (years > 0 && remainderYears === 0) {
      result = years === 1 ? "year" : `${years} yrs`;
    } else if (months > 0 && remainderMonths === 0) {
      result = months === 1 ? "month" : `${months} months`;
    } else if (weeks > 0 && remainderWeeks === 0) {
      result = weeks === 1 ? "week" : `${weeks} wks`;
    } else {
      result = cycleTime === 1 ? "day" : `${cycleTime} dys`;
    }

    return result;
  };

  useEffect(() => {
    const fetchMyChamas = async () => {
      if (!address) return; // Ensure address is available
      setLoading(true); // Start loading
      try {
        const userData = await getUser(address as string);

        if (userData) {
          const data = await getChamasByUser(userData.id);
          console.log(data); // Check what is being returned

          if (data && Array.isArray(data)) {
            // Ensure data is an array
            setChamas(data as Chama[]); // Set Chamas with the fetched data
          } else {
            setChamas([]); // Set an empty array if data is not an array
          }
        }
      } catch (error) {
        console.error("Error fetching my chamas:", error);
        setChamas([]); // Handle errors and set an empty array
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchMyChamas();
  }, [address]); // Ensure the useEffect triggers on address change

  console.log(chamas);

  return (
    <div className="bg-downy-100 min-h-screen  justify-between">
      <div className="p-4 rounded-md">
        <h1
          className="text-4xl font-bold text-bigFont mt-2 ml-2"
          style={{ fontFamily: "Lobster, cursive" }}
        >
          ChamaPay
        </h1>
        <h2 className="text-black text-xl  mt-4">My Chamas</h2>

        <div className="mt-4">
          <h3 className="text-gray-500 text-sm">Family & Friends</h3>

          <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg mt-2 space-y-2 divide-y divide-gray-200">
            {loading ? (
              <div className="text-center mt-4">
                <p className="text-gray-500">Loading chamas...</p>
              </div>
            ) : friendsChama.length === 0 ? (
              <div className="text-center mt-4">
                <h2 className="text-gray-700">You have no friends chama.</h2>
              </div>
            ) : (
              friendsChama.map((chama) => (
                <Link href={`/Chama/${chama.slug}`} key={chama.id}>
                  <div className="flex items-center justify-between mt-2 mb-2">
                    <div className="flex items-center space-x-4">
                      <Image
                        src={`https://ipfs.io/ipfs/Qmd1VFua3zc65LT93Sv81VVu6BGa2QEuAakAFJexmRDGtX/${chama.id}.jpg`}
                        alt="profile pic"
                        width={50}
                        height={50}
                        className="rounded-lg object-cover"
                        priority={false}
                        loading="lazy"
                      />
                      <div>
                        <h4 className="text-gray-900 font-medium">
                          {chama.name}
                        </h4>
                        <p className="text-gray-500 text-sm">
                          {chama.started
                            ? `PayDate: ${new Date(
                                chama.payDate
                              ).toLocaleString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour12: false,
                                hour: "numeric",
                                minute: "numeric",
                              })}`
                            : `StartDate: ${new Date(
                                chama.startDate
                              ).toLocaleString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour12: false,
                                hour: "numeric",
                                minute: "numeric",
                              })}`}
                        </p>
                      </div>
                    </div>
                    <h4 className="text-gray-900 font-normal">
                      {chama.amount} cKES/{duration(chama.cycleTime)}
                    </h4>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-6"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-gray-500 text-sm">Public</h3>
          <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg mt-2 space-y-2 divide-y divide-gray-400">
            {loading ? (
              <div className="text-center mt-4">
                <p className="text-gray-500">Loading chamas...</p>
              </div>
            ) : publicChama.length === 0 ? (
              <div className="text-center mt-4">
                <h2 className="text-gray-700">You have no public chama.</h2>
                <Link href="/Explore">
                  <button className="p-2 rounded-md mt-2 items-center bg-downy-400 text-gray-700 hover:bg-downy-600 hover:text-white">
                    Explore Available
                  </button>
                </Link>
              </div>
            ) : (
              publicChama.map((chama) => (
                <Link href={`/Chama/${chama.slug}`} key={chama.id}>
                  <div className="flex items-center justify-between mt-2 mb-2">
                    <div className="flex items-center space-x-4">
                      <Image
                        src={`https://ipfs.io/ipfs/Qmd1VFua3zc65LT93Sv81VVu6BGa2QEuAakAFJexmRDGtX/${chama.id}.jpg`}
                        alt="profile pic"
                        width={50}
                        height={50}
                        className="rounded-lg object-cover"
                        priority={false}
                        loading="lazy"
                      />
                      <div>
                        <h4 className="text-gray-900 font-medium">
                          {chama.name}
                        </h4>
                        <p className="text-gray-500 text-sm">
                          {chama.started
                            ? `PayDate: ${new Date(
                                chama.payDate
                              ).toLocaleString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour12: false,
                                hour: "numeric",
                                minute: "numeric",
                              })}`
                            : `StartDate: ${new Date(
                                chama.startDate
                              ).toLocaleString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour12: false,
                                hour: "numeric",
                                minute: "numeric",
                              })}`}
                        </p>
                      </div>
                    </div>
                    <h4 className="text-gray-900 font-normal">
                      {chama.amount} cKES/{duration(chama.cycleTime)}{" "}
                    </h4>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-6"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
      <BottomNavbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
    </div>
  );
};

export default Page;

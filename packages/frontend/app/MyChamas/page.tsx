"use client";

import React, { useEffect, useState } from "react";
import BottomNavbar from "../Components/BottomNavbar";
import Image from "next/image";
import Link from "next/link";
import { useAccount } from "wagmi";
import { getChamasByUser, getUser } from "../../lib/chama";
import ChamaLinkSearch from "../Components/SearchModal";
import { motion } from "framer-motion";
import {
  FiUsers,
  FiGlobe,
  FiArrowRight,
  FiClock,
  FiCalendar,
  FiDollarSign,
  FiSearch,
} from "react-icons/fi";
import { formatEther } from "viem";
import { utcToLocalTime } from "@/utils/duration";

interface User {
  id: number;
  chamaId: number;
  payDate: Date;
}

interface Chama {
  adminId: number;
  amount: bigint;
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
  members: User[];
}

const Page = () => {
  const [activeSection, setActiveSection] = useState("Chamas");
  const [chamas, setChamas] = useState<Chama[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"friends" | "public">("friends");
  const [showLinkSearch, setShowLinkSearch] = useState(false);

  const { isConnected, address } = useAccount();

  const friendsChama = chamas.filter((chama) => chama.type === "Private");
  const publicChama = chamas.filter((chama) => chama.type === "Public");

  const duration = (cycleTime: number) => {
    const daysInYear = 365;
    const daysInMonth = 30;
    const daysInWeek = 7;

    const years = Math.floor(cycleTime / daysInYear);
    const months = Math.floor(cycleTime / daysInMonth);
    const weeks = Math.floor(cycleTime / daysInWeek);

    const remainderYears = cycleTime % daysInYear;
    const remainderMonths = cycleTime % daysInMonth;
    const remainderWeeks = cycleTime % daysInWeek;

    if (years > 0 && remainderYears === 0) {
      return years === 1 ? "year" : `${years} yrs`;
    } else if (months > 0 && remainderMonths === 0) {
      return months === 1 ? "month" : `${months} months`;
    } else if (weeks > 0 && remainderWeeks === 0) {
      return weeks === 1 ? "week" : `${weeks} wks`;
    }
    return cycleTime === 1 ? "day" : `${cycleTime} dys`;
  };

  useEffect(() => {
    const fetchMyChamas = async () => {
      if (!address) return;
      setLoading(true);
      try {
        const userData = await getUser(address as string);
        if (userData) {
          const data = await getChamasByUser(userData.id);
          setChamas(data);
        }
      } catch (error) {
        console.error("Error fetching chamas:", error);
        setChamas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyChamas();
  }, [address]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-downy-100 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white rounded-b-lg shadow-sm px-4 pt-4 pb-2">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-downy-800">ChamaPay</h1>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className=" text-white p-2 rounded-full bg-downy-500"
            onClick={() => setShowLinkSearch(true)}
          >
            <FiSearch className="text-lg" />
          </motion.button>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mt-2">My Chamas</h2>

        {/* Tabs */}
        <div className="flex mt-4  ">
          <button
            onClick={() => setActiveTab("friends")}
            className={`flex-1 py-2 font-medium text-sm flex items-center justify-center gap-1  rounded-lg bg-transparent ${
              activeTab === "friends"
                ? "text-downy-600 border-b-2 border-downy-500"
                : "text-gray-500 border border-gray-200"
            }`}
          >
            <FiUsers /> Friends & Family
          </button>
          <button
            onClick={() => setActiveTab("public")}
            className={`flex-1 py-2 font-medium text-sm flex items-center justify-center gap-1 rounded-lg bg-transparent ${
              activeTab === "public"
                ? "text-downy-600 border-b-2 border-downy-500"
                : "text-gray-500 border border-gray-200"
            }`}
          >
            <FiGlobe /> Public
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-2 pb-6">
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-600">
              Connect your wallet to view your chamas
            </p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-downy-500 mb-4"></div>
            <p className="text-gray-600">Loading your chamas...</p>
          </div>
        ) : activeTab === "friends" ? (
          friendsChama.length === 0 ? (
            <EmptyState
              icon={<FiUsers className="text-4xl text-downy-400" />}
              title="No Friends Chamas"
              description="You haven't joined any private chamas yet"
              buttonText="Create Friends Chama"
              buttonLink="/Create"
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {friendsChama.map((chama) => (
                <ChamaCard
                  key={chama.id}
                  chama={chama}
                  duration={duration(chama.cycleTime)}
                  formatDate={formatDate}
                />
              ))}
            </motion.div>
          )
        ) : publicChama.length === 0 ? (
          <EmptyState
            icon={<FiGlobe className="text-4xl text-downy-400" />}
            title="No Public Chamas"
            description="You haven't joined any public chamas yet"
            buttonText="Explore Public Chamas"
            buttonLink="/Explore"
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {publicChama.map((chama) => (
              <ChamaCard
                key={chama.id}
                chama={chama}
                duration={duration(chama.cycleTime)}
                formatDate={formatDate}
              />
            ))}
          </motion.div>
        )}
      </div>

      <BottomNavbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      {showLinkSearch && (
        <ChamaLinkSearch onClose={() => setShowLinkSearch(false)} />
      )}
    </div>
  );
};

// Reusable Chama Card Component
const ChamaCard = ({
  chama,
  duration,
  formatDate,
}: {
  chama: Chama;
  duration: string;
  formatDate: (date: Date) => string;
}) => (
  <Link href={`/Chama/${chama.slug}`}>
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden  mb-2"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="relative">
            <Image
              src={`https://ipfs.io/ipfs/Qmd1VFua3zc65LT93Sv81VVu6BGa2QEuAakAFJexmRDGtX/${getPicture(
                Number(chama.id)
              )}.jpg`}
              alt={chama.name}
              width={48}
              height={48}
              className="rounded-lg object-cover aspect-square"
              priority={false}
              loading="lazy"
            />
            <div className="absolute -bottom-1 -right-1 bg-downy-100 p-1 rounded-full">
              {chama.type === "Private" ? (
                <FiUsers className="text-downy-600 text-xs" />
              ) : (
                <FiGlobe className="text-downy-600 text-xs" />
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-gray-800">{chama.name}</h3>
              <div className="flex items-center bg-downy-50 px-2 py-1 rounded-full">
                <FiDollarSign className="text-downy-600 mr-1 text-sm" />
                <span className="text-xs font-medium text-downy-700">
                  {formatEther(chama.amount)} cUSD/{duration}
                </span>
              </div>
            </div>

            <div className="flex items-center text-gray-500 text-sm mt-2">
              <FiCalendar className="mr-1" />
              <span>
                {chama.started
                  ? `Pay date: ${utcToLocalTime(chama.payDate)}`
                  : `Start date: ${utcToLocalTime(chama.startDate)}`}
              </span>
            </div>

            <div className="flex items-center justify-between gap-1 mt-2">
              <div className="flex items-center gap-1">
                <FiUsers className="text-gray-500" />
                <span className="text-xs font-medium text-gray-500">
                  {chama.members.length}{" "}
                  {chama.type === "Public" ? `of ${chama.maxNo}` : ""}{" "}
                  {chama.members.length == 1 && chama.type !== "Public"
                    ? "member"
                    : "members"}
                </span>
              </div>
              <div className="flex items-center  text-gray-500 text-sm">
                <FiClock
                  className={`${
                    chama.started ? "text-green-500" : "text-gray-500"
                  } mr-1`}
                />
                <span className={`${chama.started && "text-green-500"}`}>
                  {chama.started ? "active" : "Pending"}
                </span>
              </div>
            </div>
          </div>

          <FiArrowRight className="text-gray-400 mt-2" />
        </div>
      </div>
    </motion.div>
  </Link>
);

// Reusable Empty State Component
const EmptyState = ({
  icon,
  title,
  description,
  buttonText,
  buttonLink,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center py-12 px-4 text-center"
  >
    <div className="bg-downy-50 p-4 rounded-full mb-4">{icon}</div>
    <h3 className="text-lg font-bold text-gray-800 mb-1">{title}</h3>
    <p className="text-gray-500 mb-6 max-w-xs">{description}</p>
    <Link href={buttonLink}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-downy-500 text-white font-medium py-2 px-6 rounded-full shadow-md"
      >
        {buttonText}
      </motion.button>
    </Link>
  </motion.div>
);

export default Page;

"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import ChamaNavbar from "@/app/Components/ChamaNav";
import Members from "@/app/Components/Members";
import Chat from "@/app/Components/Chat";
import Schedule from "@/app/Components/Schedule";
import Wallet from "@/app/Components/Wallet";
import { getChama, requestToJoinChama, getUser, createUser } from "@/lib/chama";
import { duration } from "@/utils/duration";
import Pay from "@/app/Components/Pay";
import { useReadContract, useAccount, useConnect } from "wagmi";
import { celo } from "viem/chains";
import erc20Abi from "@/app/ChamaPayABI/ERC20.json";
import {
  contractAbi,
  contractAddress,
} from "@/app/ChamaPayABI/ChamaPayContract";
import { injected } from "wagmi/connectors";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { toast } from "sonner";

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

type ChamaDetailsTuple = [
  bigint,
  bigint,
  bigint,
  bigint,
  bigint,
  bigint,
  string,
  string[]
];

const ChamaDetails = ({ params }: { params: { slug: string } }) => {
  const [activeSection, setActiveSection] = useState("Details");
  const [chama, setChama] = useState<Chama | null>();
  const [cycle, setCycle] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const { isConnected, address } = useAccount();
  const [members, setMembers] = useState<string[]>([]);
  const [userId, setUserId] = useState(0);
  const [userName, setUserName] = useState("");
  const [chamaType, setChamaType] = useState("");
  const [included, setIncluded] = useState(false);
  const { connect } = useConnect();

  const togglePayModal = () => {
    setIsOpen(!isOpen);
  };

  const { data } = useReadContract({
    chainId: celo.id,
    address: "0x456a3d042c0dbd3db53d5489e98dfb038553b0d0",
    functionName: "balanceOf",
    abi: erc20Abi,
    args: [address],
  });

  const {
    data: chamaDetails,
    isError,
    isFetching,
  } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "getChama",
    args: [chama?.id ? [BigInt(Number(chama.id) - 3)] : []],
  });

  const { data: isMember } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "isMember",
    args: [
      chama?.id ? BigInt(Number(chama.id) - 3) : [],
      address ? address : [],
    ],
  });

  console.log(isMember);

  console.log(chamaDetails);
  const results = chamaDetails as ChamaDetailsTuple | undefined;
  // const members = results?[7];

  const handlePaymentMethod = (method: string) => {
    setPaymentMethod(method);
    togglePayModal(); // Open the modal when payment method is selected
  };

  useEffect(() => {
    const fetchChama = async () => {
      const data = await getChama(params.slug);
      console.log(data);
      if (data) {
        setChama(data);
        const time = await duration(data.cycleTime);
        console.log(time);
        setCycle(time);
        setChamaType(data.type);
      }
    };
    fetchChama();
  }, [chama]);

  useEffect(() => {
    if (!isConnected) {
      connect({ connector: injected({ target: "metaMask" }) });
    }
    console.log(isMember);
    setIncluded(isMember ? true : false);
  }, [isMember, isConnected]);

  const joinChama = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      // Attempt to fetch existing user
      let userData = await getUser(address as string);

      // If user does not exist, create a new user
      if (!userData) {
        userData = await createUser("Jeff", address as string);
      }

      if (userData && chama) {
        setUserId(userData.id);
        setUserName(userData.name ?? "");

        const request = await requestToJoinChama(
          userData.id,
          userData.name ?? "",
          chama.id
        );
        console.log(request);
        toast.success("Join request sent.");
      }
    } catch (error: any) {
      console.log(error);
      if (
        error.message.includes("You have already requested to join this chama.")
      ) {
        toast.error("You have already sent a join request.");
      } else {
        toast.error("An error occurred while sending the join request.");
      }
    }
  };

  if (isError) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-downy-100">
        <h1 className="text-lg font-semibold text-gray-500">
          Chama not found. Please retry.
        </h1>
      </div>
    );
  }

  if (!chama || (chama === null && !isFetching)) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-downy-100">
        <DotLottieReact
          src="https://lottie.host/d054c6be-ba43-476e-a709-0b8c5a6eacce/9H9nV28mOT.json"
          loop
          autoplay
        />
      </div>
    );
  }

  return (
    <div>
      {activeSection === "Details" && (
        <div className="bg-downy-100 min-h-screen flex flex-col items-center py-1">
          {/* Main Content */}
          <div className="flex justify-end">
            {chama.started == true ? (
              <div className="flex items-center">
                <span className="block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                <h2>Started</h2>
              </div>
            ) : (
              <div className="flex items-center">
                <span className="block w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
                <h2>Not Started</h2>
              </div>
            )}
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            {/* Image */}
            <div className="flex justify-center mb-2">
              <Image
                src={`https://ipfs.io/ipfs/Qmd1VFua3zc65LT93Sv81VVu6BGa2QEuAakAFJexmRDGtX/${Number(
                  chama.id
                ).toString()}.jpg`}
                alt="profile"
                width={200}
                height={200}
                className="rounded-full "
              />
            </div>
            {/* Chama Details */}
            <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
              {chama.name}
            </h1>
            <h2 className="text-xl text-gray-600 text-center mb-2">
              {chama.amount} cKES/{cycle}
            </h2>
            <h3 className="text-lg text-gray-500 text-center mb-2">
              {results ? results[7].length : "Loading..."} Member
              <span>{results && results[7].length > 1 ? "s" : ""}</span>
              {/* {chamaDetails[5]} */}
            </h3>
            <h3 className="text-lg text-gray-500 text-center mb-2">
              {chama.started == true
                ? `PayDate: ${chama.payDate.toLocaleString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour12: false,
                    hour: "numeric",
                    minute: "numeric",
                  })}`
                : `StartDate:${chama.startDate.toLocaleString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour12: false,
                    hour: "numeric",
                    minute: "numeric",
                  })}`}
            </h3>
            {/* Pay Button */}
            <div className="flex justify-center mb-4">
              {!included ? (
                <button
                  onClick={joinChama}
                  className="bg-downy-500 px-16 rounded-md py-2 text-white font-semibold text-center hover:bg-downy-700 transition-all"
                >
                  Join
                </button>
              ) : (
                <button
                  onClick={togglePayModal}
                  className="bg-downy-500 px-16 rounded-md py-2 text-white font-semibold text-center hover:bg-downy-700 transition-all"
                >
                  Pay
                </button>
              )}
            </div>
            {/* SVG/Icon */}

            {included && (
              <div
                onClick={() => {
                  setActiveSection("Chats");
                }}
                className="flex justify-center hover:cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-8 h-8 text-downy-500 hover:text-downy-700"
                >
                  <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" />
                  <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
                </svg>
              </div>
            )}
          </div>
        </div>
      )}
      {activeSection === "Members" && (
        <Members
          imageSrc={`https://ipfs.io/ipfs/Qmd1VFua3zc65LT93Sv81VVu6BGa2QEuAakAFJexmRDGtX/${Number(
            chama.id
          ).toString()}.jpg`}
          name={chama.name}
          slug={chama.slug}
          chamaId={chama.id}
        />
      )}
      {activeSection === "Chats" && (
        <div className="bg-downy-100 min-h-screen flex flex-col items-center">
          <div className="flex items-center w-full px-4 py-2 space-x-2  shadow-md">
            {/* Back arrow icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 cursor-pointer"
              onClick={() => {
                setActiveSection("Members");
              }}
            >
              <path
                fillRule="evenodd"
                d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z"
                clipRule="evenodd"
              />
            </svg>

            <Image
              src={`https://ipfs.io/ipfs/Qmd1VFua3zc65LT93Sv81VVu6BGa2QEuAakAFJexmRDGtX/${Number(
                chama.id
              ).toString()}.jpg`}
              alt="logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="ml-3">
              <h2 className="text-xl font-bold text-downy-600">{chama.name}</h2>
              <p className="text-gray-500">
                {results ? results[7].length : "Loading..."} Member
                <span>{results && results[7].length > 1 ? "s" : ""}</span>
              </p>
            </div>
          </div>
          <Chat chamaId={Number(chama.id)} />
        </div>
      )}

      {activeSection === "Schedule" && (
        <Schedule chamaId={Number(chama.id)} type={chamaType} />
      )}

      {activeSection !== "Chats" && (
        <ChamaNavbar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          isMember={included}
        />
      )}
      {activeSection === "Wallet" && <Wallet />}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-end transition duration-300 ease-in-out"
          onClick={togglePayModal}
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Pay
              paymentMethod={paymentMethod}
              handlePaymentMethod={handlePaymentMethod}
              chamaId={Number(chama.id)}
              chamaName={chama.name}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChamaDetails;

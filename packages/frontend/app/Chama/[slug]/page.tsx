"use client";

import Image from "next/image";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import ChamaNavbar from "@/app/Components/ChamaNav";
import Members from "@/app/Components/Members";
import Chat from "@/app/Components/Chat";
import Schedule from "@/app/Components/Schedule";
import Wallet from "@/app/Components/Wallet";
import {
  getChama,
  requestToJoinChama,
  addMemberToPublicChama,
  checkRequest,
} from "@/lib/chama";
import { duration } from "@/utils/duration";
import Pay from "@/app/Components/Pay";
import { useAccount, useConnect, useWriteContract } from "wagmi";
import {
  contractAbi,
  contractAddress,
} from "@/app/ChamaPayABI/ChamaPayContract";
import { injected } from "wagmi/connectors";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { toast } from "sonner";
import { processCheckout } from "@/app/Blockchain/TokenTransfer";
import { useRouter } from "next/navigation";
import { formatEther } from "viem";
import { FiAlertTriangle } from "react-icons/fi";
import { showToast } from "@/app/Components/Toast";
import { config } from "@/Providers/BlockchainProviders";
import { getConnectorClient, getConnections } from "@wagmi/core";

interface User {
  chamaId: number;
  id: number;
  payDate: Date;
  incognito: boolean;
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
  blockchainId: string;
  members: User[];
  name: string;
  round: number;
  cycle: number;
  canJoin: boolean;
  payDate: Date;
  slug: string;
  startDate: Date;
  started: boolean;
  type: string;
}

const ChamaDetails = ({ params }: { params: { slug: string } }) => {
  const [activeSection, setActiveSection] = useState("Details");
  const [chama, setChama] = useState<Chama | null>(null);
  const [cycle, setCycle] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const { isConnected, address } = useAccount();
  const [chamaType, setChamaType] = useState("");
  const [included, setIncluded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [adminWallet, setAdminWallet] = useState<string | null>(null);
  const { connect } = useConnect();
  const { writeContractAsync } = useWriteContract();
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [hasRequest, setHasRequest] = useState(false);
  const router = useRouter();
  const [currentConnector, setCurrentConnector] = useState("");

  const togglePayModal = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!isConnected) {
      connect({ connector: injected({ target: "metaMask" }) });
    }
    const connections = getConnections(config);
    setCurrentConnector(connections[0].connector?.id);
  }, [isConnected]);

  useEffect(() => {
    const fetchChama = async () => {
      const data = await getChama(params.slug, address as string);
      if (data) {
        setChama(data.chama);
        setIncluded(data.isMember);
        setAdminWallet(data.adminWallet || null);
        const time = await duration(data.chama?.cycleTime || 0);
        setCycle(time);
        setChamaType(data.chama?.type || "");
        const result = await checkRequest(
          address as string,
          data.chama?.id ?? 0
        );
        setHasRequest(result);
      }
    };
    fetchChama();
  }, [address, params.slug]);

  // sending request to join private chama
  const joinChama = async () => {
    if (!isConnected) {
      showToast("Please connect your wallet", "warning");
      return;
    }

    try {
      const request = await requestToJoinChama(
        address as string,
        chama?.id ?? 0
      );
      if (!request) {
        showToast(
          "Join request sent to admin./n wait for approval.",
          "success"
        );
      }
      showToast("You already sent a request.", "warning");
    } catch (error: any) {
      console.log(error);

      showToast("An error occurred while sending the join request.", "error");
    }
  };

  // joining public chama
  const joinPublicChama = async () => {
    setError("");
    if (!isConnected || !address) {
      setError("Please connect your wallet");
      return;
    }

    try {
      setProcessing(true);
      const paid = await processCheckout(
        contractAddress,
        chama?.amount ?? BigInt(0),
        currentConnector
      );
      if (paid) {
        setProcessing(false);
        setLoading(true);
        const hash = await writeContractAsync({
          address: contractAddress,
          abi: contractAbi,
          functionName: "addPublicMember",
          args: [
            chama?.blockchainId ? [BigInt(Number(chama.blockchainId))] : [],
          ],
        });

        if (hash) {
          await addMemberToPublicChama(
            address as string,
            chama?.id ?? 0,
            chama?.amount ?? BigInt(0),
            hash,
            chama?.canJoin ?? true
          );
          showToast(`successfully joined ${chama?.name}`, "success");
          setLoading(false);
          router.push("/MyChamas");
        } else {
          // toast.error("Something happened, please try again");
          setError("Something happened, please try again.");
        }
      } else {
        setError("Ensure you have enough funds in your wallet.");
      }
    } catch (error) {
      console.log("error", error);
      // toast.error("Oops! Something went wrong. Try again.");
      setError("Oops! Something went wrong. Try again.");
    } finally {
      setProcessing(false);
    }
  };

  const frameContent = {
    version: "next",
    imageUrl: `https://ipfs.io/ipfs/Qmd1VFua3zc65LT93Sv81VVu6BGa2QEuAakAFJexmRDGtX/${Number(
      chama?.id
    )}.jpg`,
    button: {
      title: "view chama",
      action: {
        type: "launch_frame",
        url: `https://chamapay-minipay.vercel.app/Chama/${chama?.slug}`,
        name: "ChamaApp",
        splashImageUrl: "https://chamapay-minipay.vercel.app/images/logo.png",
        splashBackgroundColor: "#f5f0ec",
      },
    },
  };

  if (!chama || (chama === null && !isConnected)) {
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
      <Head>
        <meta name="fc:frame" content={JSON.stringify(frameContent)} />
      </Head>
      {activeSection === "Details" && (
        <div className="bg-downy-100 min-h-screen flex flex-col items-center py-1">
          {/* Main Content */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white p-6 rounded-xl shadow-lg w-96">
                {error && (
                  <div
                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                    role="alert"
                  >
                    <FiAlertTriangle className="w-6 h-6" />
                    <span className="block sm:inline">{error}</span>
                  </div>
                )}
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  {!chama.canJoin ? "Join in Incognito Mode" : "Lock Amount"}
                </h2>
                <p className="text-gray-600 mb-6">
                  You need to lock {formatEther(chama.amount)} cUSD to join{" "}
                  {chama.name}.
                  {!chama.canJoin && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-yellow-700 text-sm">
                        ⓘ This chama has completed its first round of cycle{" "}
                        {chama.cycle}. You&apos;ll join in
                        <span className="font-semibold">
                          {" "}
                          incognito mode
                        </span>{" "}
                        and won&apos;t be part of payouts until the next cycle
                        starts.
                      </p>
                    </div>
                  )}
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={
                      loading || processing
                        ? undefined
                        : () => setShowModal(false)
                    }
                    disabled={loading || processing}
                    className={`px-4 py-2 bg-gray-300 text-gray-700 rounded-md ${
                      loading || processing
                        ? "hover:cursor-not-allowed hover:bg-current"
                        : "hover:bg-gray-400"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={joinPublicChama}
                    disabled={loading || processing}
                    className={`px-4 py-2 text-white rounded-md ${
                      processing || loading
                        ? "opacity-50 cursor-not-allowed"
                        : "bg-downy-500 hover:bg-downy-600"
                    }`}
                  >
                    {loading
                      ? "Joining..."
                      : processing
                      ? "Processing..."
                      : !chama.canJoin
                      ? "Join Incognito"
                      : "Proceed"}
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mb-1 mt-2">
            {/* Combined Status Indicator */}
            <div className="flex items-center bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200 text-xs">
              <span
                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                  chama.started ? "bg-green-500" : "bg-gray-400"
                }`}
              ></span>
              <span>{chama.started ? "Started" : "Not started"}</span>

              {chama.started && (
                <>
                  <span className="mx-1.5 text-gray-300">|</span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                      chama.canJoin ? "bg-purple-500" : "bg-yellow-500"
                    }`}
                  ></span>
                  <span>
                    {chama.canJoin ? "Open membership" : "Observer only"}
                  </span>
                </>
              )}
            </div>
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
              {formatEther(chama.amount)} cUSD/{cycle}
            </h2>
            <h3 className="text-lg text-gray-500 text-center mb-2">
              {chama.members ? chama.members.length : "Loading..."} Member
              <span>
                {chama.members && chama.members.length > 1 ? "s" : ""}
              </span>
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
                  onClick={
                    chama.type === "Public"
                      ? () => setShowModal(true)
                      : joinChama
                  }
                  disabled={hasRequest}
                  className={`bg-downy-500 px-16 rounded-md py-2 text-white font-semibold text-center  transition-all ${
                    hasRequest
                      ? "bg-opacity-50 cursor-not-allowed "
                      : "hover:bg-downy-700"
                  }`}
                >
                  {hasRequest ? "Request sent" : "Join"}
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
          members={chama.members}
          adminWallet={adminWallet || ""}
        />
      )}
      {activeSection === "Chats" && (
        <div className="bg-downy-100 h-[100vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center w-full px-4 py-2 space-x-2 shadow-md bg-downy-200">
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
                {chama.members.length} Member
                <span>{chama.members.length > 1 ? "s" : ""}</span>
              </p>
            </div>
          </div>

          {/* Chat Component */}
          <div className="flex-1 overflow-hidden">
            <Chat chamaId={Number(chama.id)} />
          </div>
        </div>
      )}

      {activeSection === "Schedule" && (
        <Schedule chama={chama} type={chamaType} />
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
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-end transition duration-300 ease-in-out"
            onClick={togglePayModal}
          ></div>
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Pay
              openModal={isOpen}
              closeModal={() => setIsOpen(false)}
              chamaId={Number(chama.id)}
              chamaName={chama.name}
              chamaBlockchainId={Number(chama.blockchainId)}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ChamaDetails;

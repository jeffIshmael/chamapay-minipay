"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import ChamaNavbar from "@/app/Components/ChamaNav";
import Members from "@/app/Components/Members";
import Chat from "@/app/Components/Chat";
import Schedule from "@/app/Components/Schedule";
import {
  getChama,
  requestToJoinChama,
  addMemberToPublicChama,
  checkRequest,
  createUser,
  checkUser,
} from "@/lib/chama";
import { duration, getPicture, utcToLocalTime } from "@/utils/duration";
import Pay from "@/app/Components/Pay";
import {
  injected,
  useAccount,
  useConnect,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import {
  contractAbi,
  contractAddress,
  cUSDContractAddress,
} from "@/app/ChamaPayABI/ChamaPayContract";
import ERC2OAbi from "@/app/ChamaPayABI/ERC20.json";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { processCheckout } from "@/app/Blockchain/TokenTransfer";
import { useRouter } from "next/navigation";
import { formatEther } from "viem";
import { FiAlertTriangle } from "react-icons/fi";
import { showToast } from "@/app/Components/Toast";
import { sdk } from "@farcaster/frame-sdk";
import { HiArrowLeft } from "react-icons/hi";
import { useIsFarcaster } from "@/app/context/isFarcasterContext";
import { registrationTx } from "@/lib/divviRegistration";
import ChamaSchedule from "@/app/Components/chamaSchedule";
import { config } from "@/Providers/BlockchainProviders";
import { waitForTransactionReceipt } from "@wagmi/core";
import { celo } from "wagmi/chains";
import { AnimatePresence } from "framer-motion";
import RegistrationModal from "@/app/Components/RegistrationModal";
import { BsFillWalletFill } from "react-icons/bs";

interface User {
  chamaId: number;
  id: number;
  payDate: Date;
  incognito: boolean;
  user: {
    id: number;
    address: string;
    name: string | null;
    isFarcaster: boolean;
    fid: number | null;
  };
  userId: number;
  isPaid: boolean;
}
interface FcUser {
  fid: number;
  username?: string;
  displayName?: string;
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
  payOutOrder: string | null;
  name: string;
  round: number;
  cycle: number;
  canJoin: boolean;
  payDate: Date;
  slug: string;
  startDate: Date;
  started: boolean;
  type: string;
  admin: {
    id: number;
    address: string;
    name: string | null;
    isFarcaster: boolean;
    fid: number | null;
  };
}

const ChamaDetails = ({ params }: { params: { slug: string } }) => {
  const [activeSection, setActiveSection] = useState("Details");
  const [chama, setChama] = useState<Chama | null>(null);
  const [cycle, setCycle] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const { isConnected, address, chain } = useAccount();
  const [chamaType, setChamaType] = useState("");
  const [included, setIncluded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [adminWallet, setAdminWallet] = useState<string | null>(null);
  const { connect, connectors } = useConnect();
  const { writeContractAsync } = useWriteContract();
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [hasRequest, setHasRequest] = useState(false);
  const { isFarcaster, setIsFarcaster } = useIsFarcaster();
  const [isFull, setIsFull] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [fcDetails, setFcDetails] = useState<FcUser | null>(null);
  const [farcasterChecked, setFarcasterChecked] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { switchChain, isPending } = useSwitchChain();
  const router = useRouter();

  const togglePayModal = () => {
    setIsOpen(!isOpen);
  };

  // checkUserRegistered effect
  useEffect(() => {
    const checkUserRegistered = async () => {
      if (
        !address ||
        !isConnected ||
        !farcasterChecked ||
        (isFarcaster && !fcDetails)
      ) {
        return;
      }

      try {
        const user = await checkUser(address);
        if (!user && isFarcaster && farcasterChecked && fcDetails) {
          await createUser(
            fcDetails.username ?? "anonymous",
            address as string,
            fcDetails.fid,
            true
          );
          return;
        } else if (!user) {
          setShowRegister(true);
        }
      } catch (err) {
        console.error("Error checking user:", err);
        setShowRegister(true);
      }
    };
    checkUserRegistered();
  }, [address, isConnected, isFarcaster, farcasterChecked]);

  // Farcaster detection useEffect
  useEffect(() => {
    const getContext = async () => {
      try {
        await sdk.actions.ready();
        const context = await sdk.context;
        if (context?.user) {
          setIsFarcaster(true);
          setFcDetails({
            fid: context.user.fid,
            username: context.user.username,
            displayName: context.user.displayName,
          });
          setShowRegister(false); // don't show modal
          connect({ connector: connectors[1] }); // connect Farcaster wallet
        } else {
          setIsFarcaster(false);
        }
      } catch (err) {
        console.error("Failed to get Farcaster context", err);
        setIsFarcaster(false);
      } finally {
        setFarcasterChecked(true); // now it's safe to run checkUser
      }
    };

    getContext();
  }, []);

  // wallet connection effect
  useEffect(() => {
    if (isFarcaster) return;
    if (window.ethereum?.isMiniPay) {
      connect({ connector: injected({ target: "metaMask" }) });
    }
  }, [isFarcaster]); // Only run when isFarcaster changes

  // Handle modal body class toggle
  useEffect(() => {
    if (showRegister) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [showRegister]);

  useEffect(() => {
    if (chain?.id !== celo.id) {
      switchChain({ chainId: celo.id });
    }
  }, [chain, isConnected]);

  useEffect(() => {
    const fetchChama = async () => {
      const data = await getChama(params.slug, address as string);
      if (data) {
        setChama(data.chama);
        console.log("the payout order is", data.chama?.payOutOrder);
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
        if ((data.chama?.members?.length ?? 0) >= (data.chama?.maxNo ?? 0)) {
          setIsFull(true);
        }
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
      setSendingRequest(true);
      const request = await requestToJoinChama(
        address as string,
        chama?.id ?? 0
      );
      if (!request) {
        showToast(
          "✅ Join request sent to admin. wait for approval.",
          "success"
        );
        setSendingRequest(false);
        return;
      }
      showToast("You already sent a request.", "warning");
    } catch (error: any) {
      console.log(error);
      showToast("An error occurred while sending the join request.", "error");
    } finally {
      setSendingRequest(false);
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
      const approveHash = await writeContractAsync({
        address: cUSDContractAddress,
        abi: ERC2OAbi,
        functionName: "approve",
        args: [contractAddress, chama?.amount ?? BigInt(0)],
      });
      const txHash = await waitForTransactionReceipt(config, {
        hash: approveHash,
      });
      if (txHash) {
        setProcessing(false);
        setLoading(true);
        const addPublicArgs = [
          chama?.blockchainId ? [BigInt(Number(chama.blockchainId))] : [],
          chama?.amount ?? BigInt(0),
        ];
        const hash = await registrationTx("addPublicMember", addPublicArgs);
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
          setShowModal(false);
          router.push("/MyChamas");
        } else {
          // toast.error("Something happened, please try again");
          setError("Something happened, please try again.");
          setLoading(false);
        }
      } else {
        setError("Ensure you have enough funds in your wallet.");
        setLoading(false);
      }
    } catch (error) {
      console.log("error", error);
      // toast.error("Oops! Something went wrong. Try again.");
      setError("Oops! Something went wrong. Try again.");
    } finally {
      setProcessing(false);
      setLoading(false);
    }
  };

  const handleShareCast = async () => {
    if (!chama) return;

    // Construct the cast text
    const message =
      `🔔 Join "${chama.name}" saving group on ChamaPay!\n` +
      `💰 Contribution: ${formatEther(chama.amount)} cUSD/${cycle}\n` +
      `👥 Members: ${chama.members?.length}\n` +
      `⏰ Next Pay Date: ${
        chama.started
          ? chama.payDate.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : chama.startDate.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
      }\n\n`;

    // Suggest an embed (e.g., link to the Chama's page or image)

    //https://gateway.pinata.cloud/ipfs/Qmd1VFua3zc65LT93Sv81VVu6BGa2QEuAakAFJexmRDGtX/1.jpg

    const embeds: [string, string] = [
      `https://gateway.pinata.cloud/ipfs/Qmd1VFua3zc65LT93Sv81VVu6BGa2QEuAakAFJexmRDGtX/1.jpg`,
      `https://chamapay-minipay.vercel.app/Chama/${chama.slug}`,
    ];

    try {
      const result = await sdk.actions.composeCast({
        text: message,
        embeds,
      });
      console.log("Cast posted:", result?.cast.hash);
    } catch (err) {
      console.error("ComposeCast failed:", err);
    }
  };

  const handleConnect = async () => {
    try {
      if (isFarcaster) {
        connect({ connector: connectors[1] });
      } else {
        connect({ connector: injected({ target: "metaMask" }) });
      }
    } catch (error) {
      console.error(error);
      showToast("Connection failed", "error");
    }
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

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-300 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center max-w-xs">
          <BsFillWalletFill className="mx-auto text-4xl text-downy-600 mb-4" />
          <h3 className="font-medium text-lg mb-2">Connect Your Wallet</h3>
          <p className="text-gray-500 mb-6 text-sm">
            To interact with ChamaPay
          </p>
          <button
            onClick={handleConnect}
            className="w-full py-2 bg-downy-600 text-white rounded-lg hover:bg-downy-700 transition-colors"
          >
            Connect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
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
                        : () => {
                            setError("");
                            setShowModal(false);
                          }
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
          <div className="flex items-center justify-between px-1">
            {/* Back icon */}
            <button
              className="px-2 py-1 bg-downy-300 rounded-md mr-12 flex justify-start"
              onClick={() => router.back()}
            >
              <HiArrowLeft className="flex justify-self-start text-gray-700 cursor-pointer" />
            </button>
            <div className="flex justify-end gap-2 mb-1 mt-2">
              {/* Combined Status Indicator */}
              <div className="flex items-center bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200 text-xs">
                <span
                  className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    chama.started ? "bg-green-500" : "bg-gray-400"
                  }`}
                ></span>
                <span>{chama.started ? "Started" : "Not started"}</span>
                {chama.started && !isFull && (
                  <>
                    <span className="mx-1.5 text-gray-300">|</span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        chama.canJoin ? "bg-purple-500" : "bg-yellow-500"
                      }`}
                    ></span>
                    <span>
                      {chama.canJoin && !isFull
                        ? "Open membership"
                        : "Observer only"}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            {/* Image */}
            <div className="flex justify-center mb-2">
              <Image
                src={`https://ipfs.io/ipfs/Qmd1VFua3zc65LT93Sv81VVu6BGa2QEuAakAFJexmRDGtX/${getPicture(
                  Number(chama.id)
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
              {chama.members ? chama.members.length : "Loading..."}/{" "}
              {chama.maxNo} Members
            </h3>
            <h3 className="text-lg text-gray-500 text-center mb-2">
              {chama.started == true
                ? `PayDate: ${utcToLocalTime(chama.payDate)}`
                : `StartDate:${utcToLocalTime(chama.startDate)}`}
            </h3>
            {/* Pay Button */}
            <div className="flex  justify-center mb-4">
              {!included ? (
                <button
                  onClick={
                    chama.type === "Public"
                      ? () => {
                          setError("");
                          setShowModal(true);
                        }
                      : joinChama
                  }
                  disabled={hasRequest || isFull || sendingRequest}
                  className={`bg-downy-500 px-16 rounded-md py-2 text-white font-semibold text-center  transition-all ${
                    hasRequest || isFull || sendingRequest
                      ? "bg-opacity-50 cursor-not-allowed "
                      : "hover:bg-downy-700"
                  }`}
                >
                  {hasRequest
                    ? "Request sent"
                    : sendingRequest
                    ? "Requesting..."
                    : isFull
                    ? "🔒 full"
                    : "Join"}
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

            <div className="flex justify-center items-center space-x-4 mt-4">
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
              {isFarcaster && (
                <button
                  onClick={handleShareCast}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                >
                  Share to
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M18.24.24H5.76A5.76 5.76 0 0 0 0 6v12a5.76 5.76 0 0 0 5.76 5.76h12.48A5.76 5.76 0 0 0 24 18V6A5.76 5.76 0 0 0 18.24.24m.816 17.166v.504a.49.49 0 0 1 .543.48v.568h-5.143v-.569A.49.49 0 0 1 15 17.91v-.504c0-.22.153-.402.358-.458l-.01-4.364c-.158-1.737-1.64-3.098-3.443-3.098s-3.285 1.361-3.443 3.098l-.01 4.358c.228.042.532.208.54.464v.504a.49.49 0 0 1 .543.48v.568H4.392v-.569a.49.49 0 0 1 .543-.479v-.504c0-.253.201-.454.454-.472V9.039h-.49l-.61-2.031H6.93V5.042h9.95v1.966h2.822l-.61 2.03h-.49v7.896c.252.017.453.22.453.472"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {activeSection === "Members" && (
        <Members
          imageSrc={`https://ipfs.io/ipfs/Qmd1VFua3zc65LT93Sv81VVu6BGa2QEuAakAFJexmRDGtX/${getPicture(
            Number(chama.id)
          ).toString()}.jpg`}
          name={chama.name}
          slug={chama.slug}
          members={chama.members}
          adminWallet={adminWallet || ""}
          isFarcaster={isFarcaster}
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
              src={`https://ipfs.io/ipfs/Qmd1VFua3zc65LT93Sv81VVu6BGa2QEuAakAFJexmRDGtX/${getPicture(
                Number(chama.id)
              )}.jpg`}
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
        <Schedule
          chama={chama}
          type={chamaType}
          payoutOrder={chama.payOutOrder ? chama.payOutOrder : null}
        />
      )}
      {activeSection === "chamaSchedule" && (
        <ChamaSchedule
          chama={chama}
          payoutOrder={chama.payOutOrder ? chama.payOutOrder : null}
          address={address as string}
        />
      )}

      {activeSection !== "Chats" && (
        <ChamaNavbar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          isMember={included}
        />
      )}

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
      <AnimatePresence>
        {/* Non-cancellable Registration Modal */}
        {showRegister && address && (
          <RegistrationModal
            address={address as string}
            modalfnctn={() => setShowRegister}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChamaDetails;

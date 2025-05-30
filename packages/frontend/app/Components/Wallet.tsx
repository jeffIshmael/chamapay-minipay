"use client";

import React, { useEffect, useState } from "react";
import { useReadContract, useAccount, useConnect, useDisconnect } from "wagmi";
import { celoAlfajores, celo } from "viem/chains";
import { cUSDContractAddress } from "@/app/ChamaPayABI/ChamaPayContract";
import erc20Abi from "@/app/ChamaPayABI/ERC20.json";
import Link from "next/link";
import { toast } from "sonner";
import { injected } from "wagmi/connectors";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { getChamaById, getPaymentsByUser, getUser } from "@/lib/chama";
import { motion } from "framer-motion";
import {
  FiEye,
  FiEyeOff,
  FiCopy,
  FiLogOut,
  FiDollarSign,
  FiSend,
  FiDownload,
} from "react-icons/fi";
import { HiOutlineQrcode } from "react-icons/hi";
import { formatEther } from "viem";
import { TbReceiptFilled } from "react-icons/tb";
import { useRouter } from "next/navigation";
import DepositModal from "./DepositModal";
import SendModal from "./sendModal";
import WithdrawModal from "./WithdrawModal";
import QRCodeModal from "./QRCodeModal";
import { sdk } from "@farcaster/frame-sdk";
import { useIsFarcaster } from "../context/isFarcasterContext";

interface Payment {
  amount: bigint;
  chamaId: number;
  doneAt: Date;
  id: number;
  txHash: string;
  userId: number;
}

const Wallet = () => {
  const { isConnected, address } = useAccount();
  const [loadingPayments, setLoadingPayments] = useState<boolean>(false);
  const [loadingUser, setLoadingUser] = useState<boolean>(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [userId, setUserId] = useState<number | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [chamaNames, setChamaNames] = useState<{ [key: number]: string }>({});
  const [hideButton, setHideButton] = useState(false);
  const router = useRouter();
  const [currentConnector, setCurrentConnector] = useState<string | null>(null);
  const { isFarcaster, setIsFarcaster } = useIsFarcaster();
  const { data: balanceData } = useReadContract({
    chainId: celo.id,
    address: cUSDContractAddress,
    functionName: "balanceOf",
    abi: erc20Abi,
    args: [address],
  });

  const [activeModal, setActiveModal] = useState<
    "deposit" | "send" | "withdraw" | "qr" | null
  >(null);

  // Add these handlers
  const openModal = (modal: "deposit" | "send" | "withdraw" | "qr") =>
    setActiveModal(modal);
  const closeModal = () => setActiveModal(null);

  const balance = balanceData ? Number(balanceData) / 10 ** 18 : 0;
  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  const copyToClipboard = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    toast.success("Address copied!");
  };

  const toggleBalanceVisibility = () => {
    setBalanceVisible(!balanceVisible);
  };

  const handleConnect = async () => {
    try {
      if (isFarcaster) {
        // Handle Farcaster wallet connection
        connect({ connector: connectors[1] });
      } else {
        // Handle regular wallet connection
        connect({ connector: injected({ target: "metaMask" }) });
      }
    } catch (error) {
      console.error(error);
      toast.error("Connection failed");
    }
  };

  //useeffect to check if user is connected to minipay
  useEffect(() => {
    if (!isConnected) return;
    if ((window.ethereum && window.ethereum.isMiniPay) || isFarcaster) {
      setHideButton(true);
    }
  }, [isConnected]);

  // Fetch user ID based on address
  useEffect(() => {
    const fetchUserId = async () => {
      if (!address) return;
      setLoadingUser(true);
      try {
        const userData = await getUser(address);
        setUserId(userData?.id || null);
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Failed to load user data");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserId();
  }, [address]);

  // Fetch payments and chama names
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      setLoadingPayments(true);
      try {
        const paymentsData = await getPaymentsByUser(userId);
        setPayments(paymentsData);

        // Fetch chama names
        const names: { [key: number]: string } = {};

        await Promise.all(
          paymentsData.map(async (payment) => {
            const chama = await getChamaById(payment.chamaId);
            names[payment.chamaId] = chama?.name || "Unknown Chama";
          })
        );
        setChamaNames(names);
      } catch (error) {
        console.error("Error fetching payments:", error);
        toast.error("Failed to load payment history");
      } finally {
        setLoadingPayments(false);
      }
    };

    fetchData();
  }, [userId]);

  //function to open farcaster link
  async function openFarcasterLink(txHash: string) {
    const url = `https://celoscan.io/tx/${txHash}`;
    const inFrame = Boolean((await sdk.context).client); // true in a valid Farcaster frame
    if (inFrame) {
      await sdk.actions.openUrl(url);
    } else {
      window.open(url, "_blank");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-downy-600 to-downy-700 px-4  pb-8 rounded-b-3xl shadow-lg">
        <div className="flex justify-between items-start">
          {isConnected && !hideButton && (
            <button
              onClick={() => {
                disconnect();
                toast("Wallet disconnected");
              }}
              className="p-2 rounded-md bg-white bg-opacity-20 text-white"
            >
              <FiLogOut />
            </button>
          )}
        </div>

        {/* Balance Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white bg-opacity-20 backdrop-blur-sm p-4 rounded-xl mt-4 shadow-md"
        >
          <div className="flex justify-between items-center">
            <p className="text-downy-100 text-sm">Available Balance</p>
            <button
              onClick={toggleBalanceVisibility}
              className="text-downy-100 bg-transparent"
            >
              {balanceVisible ? <FiEye /> : <FiEyeOff />}
            </button>
          </div>

          <div className="flex items-end mt-2">
            <h2 className="text-3xl font-bold text-white">
              {balanceVisible && isConnected
                ? balance.toFixed(2)
                : !isConnected
                ? "---"
                : "••••"}
            </h2>
            <span className="text-xl text-white ml-1">cUSD</span>
          </div>

          {/* Address */}
          {isConnected ? (
            <div className="mt-4 flex items-center justify-between bg-white bg-opacity-20 p-2 rounded-lg">
              <p className="text-white text-sm font-medium truncate">
                {truncatedAddress}
              </p>
              <button
                onClick={copyToClipboard}
                className="text-white bg-transparent"
              >
                <FiCopy />
              </button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConnect}
              className={`w-full mt-4 bg-white text-downy-600 font-bold py-3 px-4 rounded-lg shadow-md ${
                isFarcaster && "border border-purple-400"
              }`}
            >
              Connect Wallet
            </motion.button>
          )}
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          {[
            {
              icon: <FiDownload className="text-xl" />,
              label: "Deposit",
              action: () => openModal("deposit"),
            },
            {
              icon: <FiSend className="text-xl" />,
              label: "Send",
              action: () => openModal("send"),
            },
            {
              icon: <FiDollarSign className="text-xl" />,
              label: "Withdraw",
              action: () => openModal("withdraw"),
            },
            {
              icon: <HiOutlineQrcode className="text-xl" />,
              label: "QR Code",
              action: () => openModal("qr"),
            },
          ].map((action, index) => (
            <motion.button
              key={index}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={action.action}
              className="bg-downy-500 text-white p-3 rounded-xl shadow-sm flex flex-col items-center"
            >
              <div className="bg-white bg-opacity-20 p-2 rounded-full">
                {action.icon}
              </div>
              <span className="text-xs mt-1 font-medium">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Payment History */}
      <div className="px-4 mt-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Recent Transactions
        </h2>

        {loadingUser || loadingPayments ? (
          <div className="flex flex-col items-center justify-center py-8">
            <DotLottieReact
              src="https://lottie.host/965b1986-c9d6-4db5-a74d-375f05d98f59/M8KKZyk0j4.json"
              loop
              autoplay
              className="w-32 h-32"
            />
            <p className="text-gray-500 mt-2">Loading transactions...</p>
          </div>
        ) : !isConnected ? (
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <p className="text-gray-600">
              Connect your wallet to view transactions
            </p>
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <p className="text-gray-600">No transactions yet</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {payments.slice(0, 5).map((payment) => (
              <motion.div
                key={payment.id}
                whileHover={{ y: -2 }}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="bg-downy-100 p-2 rounded-full">
                      <FiDollarSign className="text-downy-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {"sent to "}
                        <button
                          onClick={() => {
                            router.push(
                              `/Chama/${chamaNames[payment.chamaId]
                                .toLowerCase()
                                .replace(/\s+/g, "-")}`
                            );
                          }}
                          className="text-downy-600 hover:text-downy-500 bg-transparent border-none  rounded-md"
                        >
                          <span className="text-downy-600">
                            {chamaNames[payment.chamaId]}
                          </span>
                        </button>
                      </h3>
                      <p className="text-gray-500 text-xs">
                        {new Date(payment.doneAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-downy-600">
                      {formatEther(payment.amount)} cUSD
                    </span>
                    {currentConnector === "farcaster" ? (
                      <button
                        onClick={() => openFarcasterLink(payment.txHash)}
                        className="text-gray-400 hover:text-downy-500 bg-transparent hover:bg-transparent"
                      >
                        <TbReceiptFilled className="text-gray-600" size={20} />
                      </button>
                    ) : (
                      <Link
                        href={`https://celoscan.io/tx/${payment.txHash}`}
                        target="_blank"
                        className="text-gray-400 hover:text-downy-500"
                      >
                        <TbReceiptFilled className="text-gray-600" size={20} />
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {payments.length > 5 && (
              <Link href="/transactions">
                <button className="w-full mt-4 text-downy-600 font-medium text-sm p-2">
                  View all transactions
                </button>
              </Link>
            )}
          </motion.div>
        )}
      </div>
      {activeModal === "deposit" && (
        <DepositModal
          isOpen={true}
          onClose={closeModal}
          address={address || ""}
        />
      )}
      {activeModal === "send" && (
        <SendModal
          isOpen={true}
          onClose={closeModal}
          balance={balance}
          isFarcaster={isFarcaster}
        />
      )}
      {activeModal === "withdraw" && (
        <WithdrawModal
          isOpen={true}
          onClose={closeModal}
          balance={balance}
          isFarcaster={isFarcaster}
        />
      )}
      {activeModal === "qr" && (
        <QRCodeModal
          isOpen={true}
          onClose={closeModal}
          address={address || ""}
        />
      )}
    </div>
  );
};

export default Wallet;

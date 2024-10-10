"use client";

import React, { useEffect, useState } from "react";
import { useReadContract, useAccount, useConnect, useDisconnect } from "wagmi";
import { celo } from "viem/chains";
import erc20Abi from "@/app/ChamaPayABI/ERC20.json";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { injected } from "wagmi/connectors";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { getChamaById, getPaymentsByUser, getUser } from "@/lib/chama";

interface Payment {
  amount: number;
  chamaId: number;
  doneAt: Date;
  id: number;
  txHash: string;
  userId: number;
}

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

const Wallet = () => {
  const { isConnected, address } = useAccount();
  const [myFullAddress, setMyFullAddress] = useState("");
  const [loadingPayments, setLoadingPayments] = useState<boolean>(false);
  const [loadingUser, setLoadingUser] = useState<boolean>(false);
  const [visible, setVisible] = useState(true);
  const { connect, connectAsync } = useConnect();
  const { disconnect } = useDisconnect();
  const [userId, setUserId] = useState<number | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [chamaNames, setChamaNames] = useState<{ [key: number]: string }>({}); // store userId => name mapping

  const { data } = useReadContract({
    chainId: celo.id,
    address: "0x456a3d042c0dbd3db53d5489e98dfb038553b0d0",
    functionName: "balanceOf",
    abi: erc20Abi,
    args: [address],
  });

  useEffect(() => {
    if (isConnected && address) {
      setMyFullAddress(address);
      console.log(address);
    }
  }, []);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(myFullAddress);
    toast.success("copied to clipboard!");
  };

  const toggleVisible = () => {
    setVisible(!visible);
  };

  const handleConnect = async () => {
    try {
      const connected = await connectAsync({
        connector: injected({ target: "metaMask" }),
      });
      if (connected) toast.success("Connected!");
    } catch (error) {
      console.log(error);
      toast.error("Unable to connect.");
    }
  };

  // Fetch user ID based on address
  useEffect(() => {
    const fetchUserId = async () => {
      if (!address) {
        console.error("Address is undefined. Cannot fetch user.");
        return;
      }
      setLoadingUser(true);
      try {
        const userData = await getUser(address);
        if (userData) {
          setUserId(userData.id);
        } else {
          setUserId(null);
          toast.error("User not found.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserId(null);
        toast.error("Failed to fetch user data.");
      } finally {
        setLoadingUser(false);
      }
    };
    if (isConnected && address) {
      fetchUserId();
    } else {
      setUserId(null);
      setPayments([]);
      setChamaNames({});
    }
  }, [address, isConnected]);

  // Fetch payments based on user ID
  useEffect(() => {
    const fetchPayments = async () => {
      if (userId === null) return;
      setLoadingPayments(true);
      try {
        const results: Payment[] = await getPaymentsByUser(userId);
        setPayments(results);
        await fetchChamaNames(results);
      } catch (error) {
        console.error("Error fetching payments:", error);
        setPayments([]);
        setChamaNames({});
        toast.error("Failed to fetch payments.");
      } finally {
        setLoadingPayments(false);
      }
    };

    const fetchChamaNames = async (payments: Payment[]) => {
      const namesMap: { [key: number]: string } = {};

      try {
        await Promise.all(
          payments.map(async (payment) => {
            const chamaData = await getChamaById(payment.chamaId);
            namesMap[payment.chamaId] = chamaData ? chamaData.name : "Unknown";
          })
        );
      } catch (error) {
        console.error("Error fetching chama names:", error);
        toast.error("Failed to fetch chama names.");
      }

      setChamaNames(namesMap);
    };

    fetchPayments();
  }, [userId]);

  const myAddress = address?.slice(0, 6) + "..." + address?.slice(-4);

  return (
    <div className="bg-downy-100 min-h-screen flex flex-col">
      <div className="bg-downy-600 p-4 border border-gray-300 rounded-b-3xl shadow-lg ">
        <div
          onClick={() => {
            disconnect();
            toast("Disconnected!");
          }}
          className="flex justify-end"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-6 text-downy-100 hover:cursor-pointer"
          >
            <path
              fillRule="evenodd"
              d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h2 className="text-white text-lg font-semibold">Balance</h2>

        <div className="flex items-center space-x-4 mt-2">
          <h1 className="text-white text-4xl font-bold">
            {visible ? `${isConnected ? (Number(data) / 10 ** 18).toFixed(2) : "--"}` : "**"}{" "}
            cKES
          </h1>
          <div onClick={toggleVisible} className="mt-1">
            {visible ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-white"
              >
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                <path
                  fillRule="evenodd"
                  d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-white"
              >
                <path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 1 0 1.06-1.06l-18-18ZM22.676 12.553a11.249 11.249 0 0 1-2.631 4.31l-3.099-3.099a5.25 5.25 0 0 0-6.71-6.71L7.759 4.577a11.217 11.217 0 0 1 4.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113Z" />
                <path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0 1 15.75 12ZM12.53 15.713l-4.243-4.244a3.75 3.75 0 0 0 4.244 4.243Z" />
                <path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 0 0-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 0 1 6.75 12Z" />
              </svg>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 bg-downy-500 p-2 w-fit rounded-md">
          {isConnected ? (
            <div
              onClick={copyToClipboard}
              className="flex items-center space-x-1 hover:cursor-pointer"
            >
              <h4 className="text-white text-sm">
                {isConnected ? myAddress : "Not connected"}
              </h4>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 text-white"
              >
                <path d="M7.5 3.375c0-1.036.84-1.875 1.875-1.875h.375a3.75 3.75 0 0 1 3.75 3.75v1.875C13.5 8.161 14.34 9 15.375 9h1.875A3.75 3.75 0 0 1 21 12.75v3.375C21 17.16 20.16 18 19.125 18h-9.75A1.875 1.875 0 0 1 7.5 16.125V3.375Z" />
                <path d="M15 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 17.25 7.5h-1.875A.375.375 0 0 1 15 7.125V5.25ZM4.875 6H6v10.125A3.375 3.375 0 0 0 9.375 19.5H16.5v1.125c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 0 1 3 20.625V7.875C3 6.839 3.84 6 4.875 6Z" />
              </svg>
            </div>
          ) : (
            <div
              onClick={handleConnect}
              className="flex items-center space-x-1 hover:cursor-pointer"
            >
              <h4 className="text-white text-sm">connect</h4>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6 ml-8 mr-8">
          <div className="flex flex-col items-center">
            <Image
              src={"/static/images/Deposit.png"}
              alt="Deposit"
              width={20}
              height={20}
            />
            <small className="mt-1">Deposit</small>
          </div>
          <div className="flex flex-col items-center">
            <Image
              src={"/static/images/Withdraw.png"}
              alt="Withdraw"
              width={20}
              height={20}
            />
            <small className=" mt-1">Withdraw</small>
          </div>
          <div className="flex flex-col items-center">
            <Image
              src={"/static/images/Send Money (2).png"}
              alt="Send"
              width={20}
              height={20}
            />
            <small className=" mt-1">Send</small>
          </div>
          <div className="flex flex-col items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-6"
            >
              <path
                fillRule="evenodd"
                d="M3 4.875C3 3.839 3.84 3 4.875 3h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5A1.875 1.875 0 0 1 3 9.375v-4.5ZM4.875 4.5a.375.375 0 0 0-.375.375v4.5c0 .207.168.375.375.375h4.5a.375.375 0 0 0 .375-.375v-4.5a.375.375 0 0 0-.375-.375h-4.5Zm7.875.375c0-1.036.84-1.875 1.875-1.875h4.5C20.16 3 21 3.84 21 4.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5a1.875 1.875 0 0 1-1.875-1.875v-4.5Zm1.875-.375a.375.375 0 0 0-.375.375v4.5c0 .207.168.375.375.375h4.5a.375.375 0 0 0 .375-.375v-4.5a.375.375 0 0 0-.375-.375h-4.5ZM6 6.75A.75.75 0 0 1 6.75 6h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75A.75.75 0 0 1 6 7.5v-.75Zm9.75 0A.75.75 0 0 1 16.5 6h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75v-.75ZM3 14.625c0-1.036.84-1.875 1.875-1.875h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.035-.84 1.875-1.875 1.875h-4.5A1.875 1.875 0 0 1 3 19.125v-4.5Zm1.875-.375a.375.375 0 0 0-.375.375v4.5c0 .207.168.375.375.375h4.5a.375.375 0 0 0 .375-.375v-4.5a.375.375 0 0 0-.375-.375h-4.5Zm7.875-.75a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75v-.75Zm6 0a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75v-.75ZM6 16.5a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75v-.75Zm9.75 0a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75v-.75Zm-3 3a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75v-.75Zm6 0a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75v-.75Z"
                clipRule="evenodd"
              />
            </svg>

            <small className="mt-1">QR Code</small>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4">
        <h1 className="text-gray-700 text-lg font-semibold">Payment History</h1>

        {/* Loading State */}
        {(loadingUser || loadingPayments) && (
          <div className="mt-4 items-center">
            <DotLottieReact
              src="https://lottie.host/965b1986-c9d6-4db5-a74d-375f05d98f59/M8KKZyk0j4.json"
              loop
              autoplay
            />
          </div>
        )}

        {/* No Payments */}
        {!loadingUser &&
          !loadingPayments &&
          payments.length === 0 &&
          isConnected && (
            <div className="mt-4">
              <p>No payments have been made yet.</p>
            </div>
          )}

        {/* Payments List */}
        {!loadingUser && !loadingPayments && payments.length > 0 && (
          <ul className="mt-4 space-y-2">
            {payments.map((payment: Payment) => (
              <li
                key={payment.id} // Use unique identifier instead of index
                className="border border-downy-300 p-3 rounded-lg flex justify-between items-center shadow-md"
              >
                {/* Payment Details */}
                <div className="flex items-center space-x-1">
                  <div className="bg-downy-500 rounded-full p-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-6 h-6 text-white"
                    >
                      <path d="M10.5 6a.75.75 0 0 1 .75-.75h6.75a.75.75 0 0 1 0 1.5h-6.75A.75.75 0 0 1 10.5 6ZM7.5 12a.75.75 0 0 1 .75-.75h9.75a.75.75 0 0 1 0 1.5H8.25A.75.75 0 0 1 7.5 12Zm-.75 5.25c0-.414.336-.75.75-.75h9.75a.75.75 0 0 1 0 1.5H8.25a.75.75 0 0 1-.75-.75Z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-gray-800 text-sm font-semibold">
                      Payment to {chamaNames[payment.chamaId] || "Loading..."}
                    </h4>
                    <p className="text-gray-600 text-xs">
                      {new Date(payment.doneAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Payment Amount */}
                <div className="text-downy-600 font-semibold">
                  {payment.amount} cKES
                </div>

                {/* Transaction Link */}
                <Link
                  href={`https://celoscan.io/tx/${payment.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6 text-downy-600"
                  >
                    <path d="M12.75 3a.75.75 0 0 0-1.5 0v9a.75.75 0 0 0 1.5 0V3Zm.89 10.031a.75.75 0 0 0-1.06 1.06l2.22 2.22H6.75a.75.75 0 1 0 0 1.5h7.98l-2.22 2.22a.75.75 0 1 0 1.06 1.06l3.53-3.53a.75.75 0 0 0 0-1.06l-3.53-3.53Z" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {!isConnected && (
          <div className="mt-4">
            <p>Please connect wallet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;

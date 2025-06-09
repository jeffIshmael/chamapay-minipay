"use client";

import React, { useEffect, useState } from "react";
import BottomNavbar from "../Components/BottomNavbar";
import {
  getUser,
  getUserById,
  getUserNotifications,
  handleJoinRequest,
  getRequestById,
  getPendingRequests,
} from "../../lib/chama";
import { useAccount, useWriteContract } from "wagmi";
import { toast } from "sonner";
import { contractAbi, contractAddress } from "../ChamaPayABI/ChamaPayContract";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { FiCheck, FiX, FiBell, FiClock, FiUserPlus } from "react-icons/fi";
import { showToast } from "../Components/Toast";
import sdk from "@farcaster/frame-sdk";
import { getConnections } from "@wagmi/core";
import { config } from "@/Providers/BlockchainProviders";
import { useIsFarcaster } from "../context/isFarcasterContext";

interface Chama {
  adminId: number;
  amount: bigint;
  createdAt: Date;
  cycleTime: number;
  id: number;
  maxNo: number;
  blockchainId: string;
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

interface Notification {
  id: number;
  message: string;
  senderId: number | null;
  requestId: number | null;
  read: boolean;
  createdAt: Date;
  chamaId: number | null;
  chama?: Chama;
}

interface Request {
  chama: Chama;
  chamaId: number;
  createdAt: Date;
  id: number;
  status: string;
  user: object;
  userId: number;
}

interface User {
  id: number;
  name: string | null;
  address: string;
  role: string;
}

const Page = () => {
  const [activeSection, setActiveSection] = useState("Notifications");
  const [userId, setUserId] = useState<number>(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(false);
  const { writeContractAsync } = useWriteContract();
  const { isConnected, address } = useAccount();
  const { isFarcaster, setIsFarcaster } = useIsFarcaster();
  const [loadingStates, setLoadingStates] = useState<
    Record<number, "approving" | "rejecting" | null>
  >({});

  // Fetch user details
  useEffect(() => {
    if (isConnected && address) {
      setFetching(true);
      const fetchUser = async () => {
        const user = await getUser(address);
        if (user) setUserId(user.id);
      };
      fetchUser();
    }
  }, [isConnected, address]);

  // Fetch pending requests and notifications when userId changes
  useEffect(() => {
    const fetchData = async () => {
      if (userId) {
        setFetching(true);
        try {
          const [pending, fetchedNotifications] = await Promise.all([
            getPendingRequests(userId),
            getUserNotifications(userId),
          ]);
          setPendingRequests(pending);
          setNotifications(
            fetchedNotifications.map((notification) => ({
              ...notification,
              chama: notification.chama || undefined,
            }))
          );
        } catch (error) {
          console.error("Error fetching data:", error);
          toast.error("Failed to fetch notifications or requests.");
        } finally {
          setFetching(false);
        }
      }
    };
    fetchData();
  }, [userId]);

  const handleJoin = async (
    action: "approve" | "reject",
    chamaBlockchainId: number,
    chamaId: number,
    chamaName: string,
    senderId: number,
    requestId: number,
    canJoin: boolean
  ) => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    // Set loading state for this specific request
    setLoadingStates((prev) => ({
      ...prev,
      [requestId]: action === "approve" ? "approving" : "rejecting",
    }));

    try {
      const [request, userData] = await Promise.all([
        getRequestById(requestId),
        getUserById(senderId),
      ]);

      if (!request) throw new Error("Notification not found");
      if (!userData) throw new Error("User details not found");

      if (action === "approve") {
        const txHash = await writeContractAsync({
          address: contractAddress,
          abi: contractAbi,
          functionName: "addMember",
          args: [userData.address, BigInt(chamaBlockchainId)],
        });

        if (txHash) {
          await handleJoinRequest(requestId, action, userId, chamaId, canJoin);
          showToast(
            `${userData.name} successfully added to ${chamaName}`,
            "success"
          );
        }
      } else {
        await handleJoinRequest(requestId, action, userId, chamaId, canJoin);
        showToast(`Request successfully rejected`, "error");
      }

      // Refetch data
      const [updatedPending, updatedNotifications] = await Promise.all([
        getPendingRequests(userId),
        getUserNotifications(userId),
      ]);
      setPendingRequests(updatedPending);
      setNotifications(
        updatedNotifications.map((notification) => ({
          ...notification,
          chama: notification.chama || undefined,
        }))
      );
    } catch (error) {
      showToast(`Failed to ${action} request`, "error");
      console.log(error);
    } finally {
      // Clear loading state for this request
      setLoadingStates((prev) => ({ ...prev, [requestId]: null }));
    }
  };

  //function to add frame to farcaster in order to receive live notifictions
  const addFrameToWarpcast = async () => {
    try {
      const result = await sdk.actions.addFrame();
      console.log("notification result", result);
    } catch (error) {
      showToast("Oops: something occured.", "error");
      console.log(error);
    }
  };

  const pendingRequestIds = new Set(pendingRequests.map((req) => req.id));

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-gradient-to-b from-white to-downy-50 min-h-screen p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <FiBell className="mr-2 text-downy-600" />
            Notifications
          </h1>
          <div className="flex items-center space-x-2">
            {!isFarcaster && notifications.length > 0 && (
              <span className="bg-downy-100 text-downy-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {notifications.length} new
              </span>
            )}
          </div>
        </div>

        {fetching ? (
          <div className="flex flex-col items-center justify-center h-64">
            <DotLottieReact
              src="https://lottie.host/85203845-23a0-4155-8c2e-223c2ffd9a97/BkZA5Rah2j.json"
              loop
              autoplay
              className="w-32 h-32"
            />
            <p className="text-gray-500 mt-4">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 && isConnected ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <FiClock className="text-gray-300 text-5xl mb-4" />
            <h3 className="text-lg font-medium text-gray-700">
              No notifications yet
            </h3>
            <p className="text-gray-500 mt-1">
              You&apos;ll see notifications here when you have new activity
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const isPending =
                notification.requestId !== null &&
                pendingRequestIds.has(notification.requestId);

              return (
                <div
                  key={notification.id}
                  className={`relative p-2 rounded-xl shadow-sm border ${
                    notification.read
                      ? "bg-white border-gray-200"
                      : "bg-downy-50 border-downy-200"
                  }`}
                >
                  {!notification.read && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-downy-500 rounded-full"></div>
                  )}

                  <div className="flex items-start">
                    <div
                      className={`p-2 rounded-lg mr-3 ${
                        isPending
                          ? "bg-purple-100 text-purple-600"
                          : "bg-downy-100 text-downy-600"
                      }`}
                    >
                      {isPending ? (
                        <FiUserPlus size={18} />
                      ) : (
                        <FiBell size={18} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium">
                        {notification.message}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500 flex items-center">
                          {new Date(notification.createdAt).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                          {" • "}
                          {new Date(notification.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                        {isPending && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                handleJoin(
                                  "approve",
                                  notification.chama
                                    ? Number(notification.chama.blockchainId)
                                    : 0,
                                  notification.chamaId ?? 0,
                                  notification.chama
                                    ? notification.chama.name
                                    : "",
                                  notification.senderId ?? 0,
                                  notification.requestId ?? 0,
                                  notification.chama
                                    ? notification.chama.canJoin
                                    : false
                                )
                              }
                              disabled={
                                loadingStates[notification.requestId ?? 0] !==
                                null
                              }
                              className={`flex items-center px-3 py-1.5 bg-downy-600 text-white rounded-lg hover:bg-downy-700 transition-colors ${
                                loadingStates[notification.requestId ?? 0] !==
                                null
                                  ? "opacity-70"
                                  : ""
                              }`}
                            >
                              <FiCheck className="mr-1" size={14} />
                              {loadingStates[notification.requestId ?? 0] ===
                              "approving"
                                ? "Approving..."
                                : "Approve"}
                            </button>
                            <button
                              onClick={() =>
                                handleJoin(
                                  "reject",
                                  notification.chama
                                    ? Number(notification.chama.blockchainId)
                                    : 0,
                                  notification.chamaId ?? 0,
                                  notification.chama
                                    ? notification.chama.name
                                    : "",
                                  notification.senderId ?? 0,
                                  notification.requestId ?? 0,
                                  notification.chama
                                    ? notification.chama.canJoin
                                    : false
                                )
                              }
                              disabled={
                                loadingStates[notification.requestId ?? 0] !==
                                null
                              }
                              className={`flex items-center px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors ${
                                loadingStates[notification.requestId ?? 0] !==
                                null
                                  ? "opacity-70"
                                  : ""
                              }`}
                            >
                              <FiX className="mr-1" size={14} />
                              {loadingStates[notification.requestId ?? 0] ===
                              "rejecting"
                                ? "Rejecting..."
                                : "Reject"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isConnected && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="bg-downy-100 p-4 rounded-xl max-w-xs">
              <h3 className="text-lg font-medium text-gray-700">
                Wallet not connected
              </h3>
              <p className="text-gray-500 mt-2">
                Connect your wallet to view notifications
              </p>
            </div>
          </div>
        )}
      </div>
      <BottomNavbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
    </div>
  );
};

export default Page;

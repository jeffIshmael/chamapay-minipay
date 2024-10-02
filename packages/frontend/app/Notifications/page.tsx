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
  getNotificationsByRequestId,
} from "../api/chama";
import { useAccount, useWriteContract } from "wagmi";
import { toast } from "sonner";
import { contractAbi, contractAddress } from "../ChamaPayABI/ChamaPayContract";

interface Notification {
  id: number;
  message: string;
  senderId: number;
  requestId: number | null;
  read: boolean;
  createdAt: Date;
  chamaId: number | null;
}

interface Request {
  chama: object;
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
  const [senderDetails, setSenderDetails] = useState<User | null>(null);

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
          // Fetch pending requests
          const pending = await getPendingRequests(userId);
          setPendingRequests(pending);

          // Fetch all notifications
          const fetchedNotifications = await getUserNotifications(userId);
          setNotifications(fetchedNotifications);
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

  // Handle approval or rejection of requests
  const handleJoin = async (
    notificationId: number,
    action: "approve" | "reject",
    chamaId: number,
    senderId: number,
    requestId: number
  ) => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }
    setLoading(true);
    try {
      const request = await getRequestById(requestId);
      if (!request) throw new Error("Notification not found");

      const userData = await getUserById(senderId);
      if (!userData) throw new Error("User details not found");

      setSenderDetails(userData);

      // Handle join request (update status, add member, etc.)
      await handleJoinRequest(requestId, action, userId, chamaId);

      if (action === "approve") {
        try {
          const txHash = await writeContractAsync({
            address: contractAddress,
            abi: contractAbi,
            functionName: "addMember",
            args: [userData.address, BigInt(chamaId - 3)],
          });

          if (txHash) {
            toast.success(`${userData.name} successfully joined the chama`);
          }
        } catch (error) {
          toast.error(`Failed to add ${userData.name} to the chama`);
          console.error(error);
        }
      } else {
        toast.success(`Request successfully rejected`);
      }

      // Optionally, you can refetch data to update the UI
      const updatedPending = await getPendingRequests(userId);
      setPendingRequests(updatedPending);

      const updatedNotifications = await getUserNotifications(userId);
      setNotifications(updatedNotifications);
    } catch (error) {
      toast.error(`Failed to ${action} request`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Extract pending request IDs for easy lookup
  const pendingRequestIds = new Set(pendingRequests.map((req) => req.id));

  return (
    <div>
      <div className="bg-downy-100 min-h-screen p-4 rounded-md">
        <h1 className="text-black text-xl font-medium mt-4">Notifications</h1>

        {fetching ? (
          <div className="text-center mt-4">
            <p className="text-gray-900">Fetching...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center mt-4">
            <p className="text-gray-900">No notifications</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const isPending =
              notification.requestId !== null &&
              pendingRequestIds.has(notification.requestId);

            return (
              <div
                key={notification.id}
                className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg mt-2 space-y-2"
              >
                <p className="text-gray-900">{notification.message}</p>
                <div className="flex justify-between items-center">
                  <small className="text-gray-500 text-sm">
                    {new Date(notification.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </small>
                  {isPending && (
                    <div className="flex space-x-4">
                      <button
                        onClick={() =>
                          handleJoin(
                            notification.id,
                            "approve",
                            notification.chamaId ?? 0,
                            notification.senderId,
                            notification.requestId ?? 0
                          )
                        }
                        className={`flex items-center px-3 py-1 bg-downy-500 text-white rounded-md hover:bg-downy-600 ${
                          loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={loading}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleJoin(
                            notification.id,
                            "reject",
                            notification.chamaId ?? 0,
                            notification.senderId,
                            notification.requestId ?? 0
                          )
                        }
                        className={`flex items-center px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 ${
                          loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={loading}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* {notifications.length === 0 ? (
          <div className="text-center mt-4">
            <p className="text-gray-900">No notifications</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const isPending =
              notification.requestId !== null &&
              pendingRequestIds.has(notification.requestId);

            return (
              <div
                key={notification.id}
                className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg mt-2 space-y-2"
              >
                <p className="text-gray-900">{notification.message}</p>
                <div className="flex justify-between items-center">
                  <small className="text-gray-500 text-sm">
                    {new Date(notification.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </small>
                  {isPending && (
                    <div className="flex space-x-4">
                      <button
                        onClick={() =>
                          handleJoin(
                            notification.id,
                            "approve",
                            notification.chamaId ?? 0,
                            notification.senderId,
                            notification.requestId ?? 0
                          )
                        }
                        className={`flex items-center px-3 py-1 bg-downy-500 text-white rounded-md hover:bg-downy-600 ${
                          loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={loading}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleJoin(
                            notification.id,
                            "reject",
                            notification.chamaId ?? 0,
                            notification.senderId,
                            notification.requestId ?? 0
                          )
                        }
                        className={`flex items-center px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 ${
                          loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={loading}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )} */}
      </div>
      <BottomNavbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
    </div>
  );
};

export default Page;

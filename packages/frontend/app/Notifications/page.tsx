"use client";
import React, { useEffect, useState } from "react";
import BottomNavbar from "../Components/BottomNavbar";
import {
  getUser,
  getUserById,
  getUserNotifications,
  handleJoinRequest,
  getRequestById,
} from "../api/chama";
import { useAccount, useWriteContract } from "wagmi";
import { toast } from "sonner";
import { contractAbi, contractAddress } from "../ChamaPayABI/ChamaPayContract";

interface Request {
  id: number;
  message: String;
  senderId: number;
  requestId: number;
  read: Boolean;
  createdAt: Date;
  chamaId: number | null;
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
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { writeContractAsync } = useWriteContract();
  const { isConnected, address } = useAccount();
  const [senderDetails, setSenderDetails] = useState<User | null>(null);

  // Fetch notifications
  useEffect(() => {
    const fetchRequests = async () => {
      if (userId) {
        const pendingRequests = await getUserNotifications(userId);
        setRequests(pendingRequests);
      }
    };
    fetchRequests();
  }, [userId]);

  // Fetch user details
  useEffect(() => {
    if (isConnected && address) {
      const fetchUser = async () => {
        const user = await getUser(address);
        if (user) setUserId(user.id);
      };
      fetchUser();
    }
  }, [isConnected, address]);

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
      if (!request) throw new Error("Request not found");

      const userData = await getUserById(senderId);
      if (!userData) throw new Error("User details not found");

      setSenderDetails(userData);

      const data = await handleJoinRequest(requestId, action, userId, chamaId);
      if (action === "approve") {
        try {
          const txHash = await writeContractAsync({
            address: contractAddress,
            abi: contractAbi,
            functionName: "addMember",
            args: [userData.address, BigInt(chamaId - 1)],
          });

          if (txHash) {
            toast.success(`${userData.name} successfully joined the chama`);
          }
        } catch (error) {
          toast.error(`Failed to add ${userData.name} to the chama`);
        }
      }
      setLoading(false);
    } catch (error) {
      toast.error(`Failed to ${action} request`);
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="bg-downy-100 min-h-screen p-4 rounded-md">
        <h1 className="text-black text-xl font-medium mt-4">Notifications</h1>
        {requests.length === 0 ? (
          <div className="text-center mt-4">
            <p className="text-gray-900">No notifications</p>
          </div>
        ) : (
          requests.map((request, index) => (
            <div
              key={index}
              className="bg-white p-1 border border-gray-300 rounded-lg shadow-lg mt-2 space-y-2"
            >
              <p className="text-gray-900">{request.message}</p>
              <div className="flex justify-between">
                <small className="text-gray-500 text-sm">
                  {new Date(request.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </small>
                <div className="flex space-x-4">
                  <div
                    onClick={() =>
                      handleJoin(
                        request.id,
                        "approve",
                        request.chamaId ?? 0,
                        request.senderId,
                        request.requestId
                      )
                    }
                    className={`hover:cursor-pointer hover:text-downy-400 ${
                      loading ? "text-gray-400" : ""
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-8"
                    >
                      <path d="M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a.75.75 0 0 0-1.5 0v2.25H15a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H21a.75.75 0 0 0 0-1.5h-2.25V7.5Z" />
                    </svg>
                  </div>
                  <div
                    onClick={() =>
                      handleJoin(
                        request.id,
                        "reject",
                        request.chamaId ?? 0,
                        request.senderId,
                        request.requestId
                      )
                    }
                    className="hover:cursor-pointer hover:text-downy-400"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-8"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))
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

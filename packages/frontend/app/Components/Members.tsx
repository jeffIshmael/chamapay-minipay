"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FiUser, FiUsers, FiShare2, FiChevronRight } from "react-icons/fi";
import { showToast } from "./Toast";
import { FiCast } from "react-icons/fi";

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
}

const Members = ({
  imageSrc,
  name,
  slug,
  members,
  adminWallet,
}: {
  imageSrc: string;
  name: string;
  slug: string;
  members: User[];
  adminWallet: string;
}) => {
  const [groupLink, setGroupLink] = useState("");
  const { isConnected, address } = useAccount();
  const [copied, setCopied] = useState(false);

  // Generate invite link
  useEffect(() => {
    setGroupLink(`${window.location.origin}/Chama/${slug}`);
  }, [slug]);

  // Copy invite link to clipboard
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(groupLink);
    setCopied(true);
    showToast("Invite link copied!", "info");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-downy-50 to-gray-50 pb-10">
      {/* Group Header */}
      <div className="bg-gradient-to-r from-downy-600 to-downy-700 px-6 pt-8 pb-6 rounded-b-3xl shadow-lg">
        <div className="flex flex-col items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden mb-2"
          >
            <Image
              src={imageSrc}
              alt="Group logo"
              width={96}
              height={96}
              className="object-cover w-full h-full"
            />
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-2">{name}</h2>

          {/* Invite Section */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={copyToClipboard}
            className="flex items-center bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full cursor-pointer mt-2"
          >
            <FiUsers className="text-white mr-2" />
            <span className="text-white text-sm font-medium truncate max-w-[180px]">
              {copied ? "Copied!" : "Invite Members"}
            </span>
            <FiShare2 className="text-white ml-2" />
          </motion.div>
        </div>
      </div>

      {/* Members List */}
      <div className="px-4 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Members ({members.length})
          </h2>
        </div>

        <div className="space-y-3">
          {members.map((member, index) => {
            const isCurrentUser =
              isConnected && member.user.address === address;
            const isAdmin = member.user.address === adminWallet;
            const isIncognito = member.incognito;
            const truncatedAddress = `${member.user.address.slice(
              0,
              6
            )}...${member.user.address.slice(-4)}`;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white p-4 rounded-xl shadow-sm border ${
                  isIncognito
                    ? "border-gray-200 border-dashed"
                    : "border-gray-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-full ${
                        isAdmin
                          ? "bg-downy-100"
                          : isIncognito
                          ? "bg-gray-50"
                          : "bg-gray-100"
                      }`}
                    >
                      <FiUser
                        className={`text-lg ${
                          isAdmin
                            ? "text-downy-600"
                            : isIncognito
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {isIncognito ? (
                          <span className="text-gray-500 italic">
                            Incognito Member
                          </span>
                        ) : (
                          <>
                            {isCurrentUser
                              ? "You"
                              : member.user?.name || "Member"}
                            {isAdmin && (
                              <span className="ml-2 bg-downy-100 text-downy-600 text-xs px-2 py-0.5 rounded-full">
                                Admin
                              </span>
                            )}
                          </>
                        )}
                      </h3>
                      {!isIncognito && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(member.user.address);
                            toast("Address copied to clipboard");
                          }}
                          className="bg-transparent hover:bg-transparent"
                        >
                          <p className="text-gray-500 text-xs">
                            {truncatedAddress}
                          </p>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.user.isFarcaster && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          window.open(
                            `https://warpcast.com/${member.user.fid}`,
                            "_blank"
                          )
                        }
                        className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium"
                      >
                        <FiCast className="text-purple-600" />
                        <span>Profile</span>
                      </motion.button>
                    )}
                    {!isIncognito && (
                      <FiChevronRight className="text-gray-400" />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Invite CTA */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={copyToClipboard}
          className="mt-6 bg-downy-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 p-2 rounded-full mr-3">
              <FiUsers className="text-white" />
            </div>
            <div>
              <h3 className="font-bold">Invite More Members</h3>
              <p className="text-downy-100 text-sm">
                Share the chama link with friends
              </p>
            </div>
          </div>
          <FiShare2 className="text-white" />
        </motion.div>
      </div>
    </div>
  );
};

export default Members;

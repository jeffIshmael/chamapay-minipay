"use client";

import { createUser } from "@/lib/chama";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import { showToast } from "./Toast";

const RegistrationModal = ({
  address,
  modalfnctn,
}: {
  address: string;
  modalfnctn: (value: boolean) => void;
}) => {
  const [userName, setUserName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");

  //function to register user
  const registerUser = async () => {
    setError("");
    if (!userName.trim()) {
      setError("Enter a valid username.");
      return;
    }
    setIsRegistering(true);
    try {
      if (address) {
        await createUser(userName.trim(), address, 1, false);
        showToast("Username set successfully!", "success");
        modalfnctn(false);
      }
    } catch (error) {
      setError("Failed to register username. Please try again.");
      console.error("Registration error:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
        >
          <div className="p-4">
            {error && (
              <div className="bg-red-500 text-white p-2 rounded-md mb-2">
                {error}
              </div>
            )}
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Welcome to ChamaPay!
            </h2>
            <p className="text-gray-600 mb-2">
              Choose a username to get started
            </p>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-downy-500 focus:border-downy-500 outline-none transition"
                  placeholder="e.g., johndoe"
                  autoFocus
                />
              </div>

              <button
                onClick={registerUser}
                disabled={!userName.trim() || isRegistering}
                className={`w-full py-3 px-6 rounded-xl font-bold text-white transition ${
                  !userName.trim() || isRegistering
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-downy-600 hover:bg-downy-700"
                }`}
              >
                {isRegistering ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Setting up your account...
                  </span>
                ) : (
                  "Continue"
                )}
              </button>
            </div>
          </div>

          {/* MiniPay branding */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-center">
            <p className="text-sm text-gray-500">
              Secured by{" "}
              <span className="font-medium">Blockchain Technology</span>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RegistrationModal;

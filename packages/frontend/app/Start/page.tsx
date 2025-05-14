"use client";

import React, { useEffect, useState } from "react";
import BottomNavbar from "../Components/BottomNavbar";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiChevronDown,
  FiUsers,
  FiGlobe,
  FiShield,
  FiPieChart,
  FiZap,
  FiDollarSign,
} from "react-icons/fi";
import { RiHandCoinLine } from "react-icons/ri";
import { IoMdPeople } from "react-icons/io";
import { TbPigMoney } from "react-icons/tb";
import { checkUser, createUser } from "@/lib/chama";
import { getConnections } from "@wagmi/core";
import { showToast } from "../Components/Toast";
import { config } from "@/Providers/BlockchainProviders";
import { getFarcasterUser } from "@/lib/farcasterUser";

const Page = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("Home");
  const [showRegister, setShowRegister] = useState(false);
  const { connect, connectors } = useConnect();
  const { address } = useAccount();
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentConnector, setCurrentConnector] = useState<string | null>(null);

  useEffect(() => {
    const checkUserRegistered = async () => {
      if (address) {
        const user = await checkUser(address as string);
        if (!user) {
          //check if user is connected via farcaster
          if (currentConnector === "farcaster") {
            console.log("the current connector is", currentConnector);
            // get farcaster user details
            const fcDetails = await getFarcasterUser(address as string);
            console.log("the fcDetails are", fcDetails);

            if (fcDetails) {
              await createUser(
                fcDetails.userName,
                address,
                fcDetails.fid,
                true
              );
              return;
            }
            return;
          }
          setShowRegister(true);
        }
      }
    };
    checkUserRegistered();
  }, [address, currentConnector]);

  useEffect(() => {
    // if (isConnected) return;

    if (window.ethereum && window.ethereum.isMiniPay) {
      connect({ connector: injected({ target: "metaMask" }) });
    } else {
      connect({ connector: connectors[1] });
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const connections = getConnections(config);
        console.log("connections", connections);
        if (connections[0]?.connector?.id) {
          setCurrentConnector(connections[0].connector.id);
        }
      } catch (error) {
        console.error("Connection error:", error);
      }
    };
    init();
  }, [address]);

  useEffect(() => {
    if (showRegister) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [showRegister]);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

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
        setShowRegister(false);
      }
    } catch (error) {
      setError("Failed to register username. Please try again.");
      console.error("Registration error:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-downy-100 pb-24">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-downy-600 to-downy-800 px-6 pt-10 pb-20 text-center rounded-b-3xl shadow-2xl overflow-hidden">
        {/* Decorative Waves */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-[url('/wave-pattern.svg')] bg-repeat-x opacity-10"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-block mb-4"
          >
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
              <h1
                className="text-5xl font-bold text-white mb-1"
                style={{
                  fontFamily: "Lobster, cursive",
                  textShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                ChamaPay
              </h1>
            </div>
          </motion.div>

          <p className="text-xl text-downy-100 mb-8 max-w-md mx-auto">
            Circular savings made <span className="font-semibold">simple</span>,{" "}
            <span className="font-semibold">secure</span>, and{" "}
            <span className="font-semibold">social</span>
          </p>

          <div className="flex flex-col space-y-4 px-4">
            <Link href="/Explore" legacyBehavior>
              <motion.button
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 8px 20px rgba(255,255,255,0.2)",
                }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-white text-downy-700 font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
              >
                <IoMdPeople className="mr-2 text-lg" />
                Explore Chamas
              </motion.button>
            </Link>
            <Link href="/Create" legacyBehavior>
              <motion.button
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 8px 20px rgba(255,255,255,0.1)",
                }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-downy-900/80 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all border border-white/20 flex items-center justify-center"
              >
                <TbPigMoney className="mr-2 text-lg" />
                Create Your Chama
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="px-6 -mt-10 z-10 relative">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 gap-4"
        >
          {[
            {
              icon: <FiUsers className="text-downy-600 text-xl" />,
              title: "Private Chamas",
              desc: "Family & Friends",
              bg: "bg-gradient-to-br from-blue-100 to-blue-200",
            },
            {
              icon: <FiGlobe className="text-downy-600 text-xl" />,
              title: "Public Chamas",
              desc: "Join Communities",
              bg: "bg-gradient-to-br from-green-100 to-green-200",
            },
            {
              icon: <FiShield className="text-downy-600 text-xl" />,
              title: "Secure",
              desc: "Blockchain Backed",
              bg: "bg-gradient-to-br from-purple-100 to-purple-200",
            },
            {
              icon: <FiPieChart className="text-downy-600 text-xl" />,
              title: "Transparent",
              desc: "Real-time Tracking",
              bg: "bg-gradient-to-br from-amber-50 to-amber-100",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -8, scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, type: "spring" }}
              className={`${feature.bg} p-5 rounded-2xl shadow-md hover:shadow-lg border border-white transition-all`}
            >
              <div className="bg-white w-12 h-12 rounded-xl flex items-center justify-center mb-3 mx-auto shadow-sm">
                {feature.icon}
              </div>
              <h3 className="font-bold text-gray-800 text-center">
                {feature.title}
              </h3>
              <p className="text-gray-500 text-xs text-center mt-1">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Value Propositions */}
      <div className="px-6 mt-14">
        <motion.h2
          className="text-3xl font-bold text-gray-800 mb-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Why <span className="text-downy-600">ChamaPay</span> Stands Out
        </motion.h2>

        <div className="space-y-6">
          {[
            {
              icon: <RiHandCoinLine className="text-downy-600 text-2xl" />,
              title: "Community Trust",
              description:
                "Trusted by many users across Kenya for their group savings needs.",
              highlight: "Many users",
            },
            {
              icon: <FiZap className="text-downy-600 text-2xl" />,
              title: "Lightning Fast",
              description:
                "Instant settlements with our optimized blockchain technology.",
              highlight: "Instant settlements",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + index * 0.1, type: "spring" }}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100/50 hover:border-downy-200 transition-all"
            >
              <div className="flex items-start">
                <div className="bg-downy-100 p-3 rounded-xl mr-4 shadow-inner">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">{item.description}</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-downy-100 text-downy-800 text-xs font-medium rounded-full">
                    {item.highlight}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="px-6 mt-14">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {[
              {
                question: "How do I create a chama?",
                answer:
                  "Simply click 'Create Chama', set your rules (contribution amount, frequency, etc.), and invite members via WhatsApp or email. Setup takes less than 2 minutes!",
                icon: <FiUsers className="text-downy-600" />,
              },
              {
                question: "What are the fees?",
                answer:
                  "ChamaPay is free to use. We only charge minimal blockchain transaction fees (typically less than 0.1 cUSD per transaction). No hidden costs!",
                icon: <FiDollarSign className="text-downy-600" />,
              },
              {
                question: "Can I use mobile money?",
                answer:
                  "Yes! We support M-Pesa integration for easy deposits and withdrawals. Funds are converted to stable cUSD tokens automatically.",
                icon: <FiZap className="text-downy-600" />,
              },
            ].map((item, index) => (
              <div
                key={index}
                className="border-b border-gray-100 pb-4 last:border-0 last:pb-0 group"
              >
                <button
                  onClick={() => toggleSection(item.question)}
                  className="flex justify-between items-center w-full text-left bg-transparent hover:bg-transparent"
                >
                  <div className="flex items-start">
                    <div className="bg-downy-100 p-2 rounded-lg mr-3">
                      {item.icon}
                    </div>
                    <h3 className="font-semibold text-gray-800 group-hover:text-downy-700 transition-colors">
                      {item.question}
                    </h3>
                  </div>
                  <FiChevronDown
                    className={`text-downy-500 transition-transform ${
                      expandedSection === item.question ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {expandedSection === item.question && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden pl-11"
                    >
                      <p className="text-gray-600 mt-2">{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Final CTA */}
      <div className="px-6 mt-14 mb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-downy-700 to-downy-800 p-8 rounded-3xl shadow-2xl text-center relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-white/10"></div>
          <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-white/10"></div>

          <h3 className="text-2xl font-bold text-white mb-3 relative z-10">
            Ready to revolutionize your chama?
          </h3>
          <p className="text-downy-100 mb-6 max-w-md mx-auto relative z-10">
            Join the digital chama revolution today
          </p>
          <div className="relative z-10">
            <Link href="/Create" legacyBehavior>
              <motion.button
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                }}
                whileTap={{ scale: 0.98 }}
                className="w-full max-w-xs mx-auto bg-white text-downy-700 font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Start Your Chama Now
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>

      <BottomNavbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      {/* Non-cancellable Registration Modal */}
      <AnimatePresence>
        {showRegister && (
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
                  Secured by <span className="font-medium">MiniPay</span>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Page;

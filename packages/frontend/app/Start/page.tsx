"use client";

import React, { useCallback, useEffect, useState } from "react";
import BottomNavbar from "../Components/BottomNavbar";
import { useAccount, useConnect, useSwitchChain } from "wagmi";
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
  FiArrowRight,
  FiAlertTriangle,
} from "react-icons/fi";
import { RiHandCoinLine } from "react-icons/ri";
import { IoMdPeople, IoMdWallet } from "react-icons/io";
import { TbPigMoney } from "react-icons/tb";
import { checkUser, createUser } from "@/lib/chama";
import { showToast } from "../Components/Toast";
import { sdk } from "@farcaster/frame-sdk";
import { useIsFarcaster } from "../context/isFarcasterContext";
import { celo } from "wagmi/chains";
import RegistrationModal from "../Components/RegistrationModal";


interface User {
  fid: number;
  username?: string;
  displayName?: string;
}

const Page = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("Home");
  const [showRegister, setShowRegister] = useState(false);
  const { address, isConnected, chain } = useAccount();
  const { isFarcaster, setIsFarcaster } = useIsFarcaster();
  const [fcDetails, setFcDetails] = useState<User | null>(null);
  const { connect, connectors } = useConnect();
  const { switchChain, isPending } = useSwitchChain();
  const [showNetworkSwitch, setShowNetworkSwitch] = useState(false);
  const [farcasterChecked, setFarcasterChecked] = useState(false);

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

  const handleSwitchToCelo = useCallback(async () => {
    try {
      await switchChain({ chainId: celo.id });
      showToast(`Switched to Celo network`, "success");
    } catch (error) {
      console.error("Chain switch failed:", error);
      showToast(`Failed to switch to Celo. Please try again.`, "error");
    }
  }, [switchChain]);

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

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-downy-100 pb-24">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-downy-600 to-downy-800 px-6 pt-10 pb-20 text-center rounded-b-3xl shadow-2xl overflow-hidden">
        {/* Decorative Waves */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-[url('/wave-pattern.svg')] bg-repeat-x opacity-10"></div>
        {/* Floating network switch button */}
        <AnimatePresence>
          {showNetworkSwitch && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed top-2 z-50"
            >
              <motion.button
                whileHover={{
                  scale: 1.02,
                  backgroundColor: "#f59e0b",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSwitchToCelo}
                className="bg-yellow-400 hover:bg-yellow-500 border-2 border-yellow-600 text-white font-medium py-2 px-4 rounded-full shadow-lg flex items-center space-x-3 backdrop-blur-sm"
              >
                <div className="flex flex-col items-start">
                  <span className="text-xs font-medium text-yellow-100">
                    Currently on wrong chain.
                  </span>
                  <span className="text-sm font-semibold flex items-center gap-2">
                    <FiAlertTriangle className="inline" />
                    Switch to Celo
                  </span>
                </div>
                <FiArrowRight className="text-lg" />
              </motion.button>
            </motion.div>
          )}
          {!isConnected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed top-4 z-50"
            >
              <motion.button
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "#06b6d4",
                  boxShadow: "0 4px 14px rgba(6, 182, 212, 0.5)",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConnect}
                className="relative bg-downy-400 hover:bg-downy-500 border-2 border-downy-600 text-white font-medium py-2 pl-3 pr-4 rounded-full shadow-lg flex items-center gap-2 backdrop-blur-sm transition-all"
              >
                {/* Pulse dot */}
                <motion.span
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -left-1 -top-1 h-3 w-3 rounded-full bg-yellow-400 border-2 border-white"
                />

                <IoMdWallet className="text-lg text-white" />
                <span className="font-semibold text-sm">Connect Wallet</span>
                <FiArrowRight className="text-lg text-white ml-1" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
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
              title: "Public Groups",
              desc: "Global Communities",
              bg: "bg-gradient-to-br from-green-100 to-green-200",
            },
            {
              icon: <FiShield className="text-downy-600 text-xl" />,
              title: "Secure",
              desc: "Blockchain Protected",
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
              title: "Built on Trust",
              description:
                "Empowering communities around the world with a secure and transparent platform for collective savings.",
              highlight: "Trusted globally",
            },
            {
              icon: <FiZap className="text-downy-600 text-2xl" />,
              title: "Truly Borderless",
              description:
                "Experience lightning-fast international transactions with near-zero fees — no matter where your group members are.",
              highlight: "Global reach",
            },
            {
              icon: <FiGlobe className="text-downy-600 text-2xl" />,
              title: "Stablecoin Integration",
              description:
                "Seamlessly contribute and withdraw using stablecoins, enabling smooth cross-border participation.",
              highlight: "Currency flexibility",
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
                question: "How do I start a savings group?",
                answer:
                  "Tap on 'Create Group', customize your rules (amount, duration, start date), and invite members across the globe. It takes less than 2 minutes to set up.",
                icon: <FiUsers className="text-downy-600" />,
              },
              {
                question: "What are the fees?",
                answer:
                  "ChamaPay runs on the blockchain, meaning you only pay minimal transaction fees — usually less than $0.01. And 5% on all transfer functions.",
                icon: <FiDollarSign className="text-downy-600" />,
              },
              {
                question: "Which currency does ChamaPay support?",
                answer:
                  "Currently, ChamaPay supports cUSD (a stablecoin), ensuring stable and borderless contributions no matter where you're located.",
                icon: <FiGlobe className="text-downy-600" />,
              },
              {
                question: "Is there a maximum number of members per group?",
                answer:
                  "Yes. To maintain fairness, speed, and smooth fund rotation, each Chama group is limited to a maximum of 15 members. This ensures an efficient and rewarding experience for everyone involved.",
                icon: <FiGlobe className="text-downy-600" />,
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

export default Page;

"use client";

import React, { useEffect, useState } from "react";
import BottomNavbar from "../Components/BottomNavbar";
import { useAccount, useConnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import Link from "next/link";
import Image from 'next/image';
// import familyIcon from '../assets/family.png';  // Add your image file
// import publicIcon from '../assets/public.png';  // Add your image file
// import heroImage from '../assets/hero.png';  // Add your image file

const Page = () => {
  const [showWhatIsChamaPay, setShowWhatIsChamaPay] = useState(false);
  const [showWhyChamaPay, setShowWhyChamaPay] = useState(false);
  const [activeSection, setActiveSection] = useState("Home");
  const {isConnected, address} = useAccount();
  const {connect} = useConnect();

  useEffect(() => {
    if (window.ethereum && !isConnected ) {
      connect({ connector: injected({ target: 'metaMask' }) });
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-downy-200 rounded-md flex flex-col justify-center items-center text-center p-8 overflow-hidden">
        {/* <Image src={heroImage} alt="Hero Image" className="absolute top-0 left-0 w-full h-full object-cover opacity-10"/> */}
        <h1
          className="text-5xl font-bold text-downy-900 mb-2"
          style={{ fontFamily: "Lobster, cursive" }}
        >
          ChamaPay
        </h1>
        <p className="italic text-lg text-gray-700 mb-4">
          Your digital chama.
        </p>
        <Link href="/Explore">
          <button className="text-white py-3 px-6 rounded-md bg-downy-600 hover:bg-downy-700 shadow-md transition">
            Explore Public Chamas
          </button>
        </Link>
      </div>

      {/* Core Features */}
      <div className="p-6 space-y-6 mt-6">
        <div className="bg-white p-4 border rounded-md shadow-md flex items-center">
          {/* <Image src={familyIcon} alt="Family Icon" className="w-12 h-12 mr-4" /> */}
          <div>
            <h2 className="text-xl font-semibold text-downy-900 mb-1">Create Family and Friends Chama</h2>
            <p className="text-gray-600">
              Start a chama with those you trust and manage it effortlessly with secure payments and easy tracking.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 border rounded-md shadow-md flex items-center">
          {/* <Image src={publicIcon} alt="Public Icon" className="w-12 h-12 mr-4" /> */}
          <div>
            <h2 className="text-xl font-semibold text-downy-900 mb-1">Create or Join a Public Chama</h2>
            <p className="text-gray-600">
              Open your chama to the public, meet like-minded people, and save together securely.
            </p>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white p-6 rounded-md shadow-md mt-8">
          <h2 className="text-lg text-center text-downy-900 font-bold mb-4">
            About ChamaPay
          </h2>
          
          <div className="cursor-pointer" onClick={() => setShowWhatIsChamaPay(!showWhatIsChamaPay)}>
            <h1 className="text-lg font-semibold text-downy-900">
              What is ChamaPay?
            </h1>
            {showWhatIsChamaPay && (
              <p className="text-gray-600 mt-2">
                ChamaPay is a platform that helps you manage your group savings effortlessly, with features designed to make group financial management easy and secure.
              </p>
            )}
          </div>
          <hr className="my-3 border-gray-300" />
          <div className="cursor-pointer" onClick={() => setShowWhyChamaPay(!showWhyChamaPay)}>
            <h1 className="text-lg font-semibold text-downy-900">
              Why ChamaPay?
            </h1>
            {showWhyChamaPay && (
              <p className="text-gray-600 mt-2">
                ChamaPay makes group saving seamless, transparent, and secure, empowering communities to collaborate financially with ease.
              </p>
            )}
          </div>
        </div>
      </div>

      <BottomNavbar activeSection={activeSection} setActiveSection={setActiveSection} />
    </div>
  );
};

export default Page;

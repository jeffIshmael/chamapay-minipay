"use client";

import Image from "next/image";
import React, { useState } from "react";
import ChamaNavbar from "@/app/Components/ChamaNav";
import Members from "@/app/Components/Members";
import Chat from "@/app/Components/Chat";
import Schedule from "@/app/Components/Schedule";
import Wallet from "@/app/Components/Wallet";

const ChamaDetails = ({ params }: { params: { id: number } }) => {
  const [activeSection, setActiveSection] = useState("Details");

  const friendsChama = [
    {
      name: "For Keeps",
      amount: "100 cKES/month",
      date: "10 Oct 2024",
      image: "/static/images/friends.jpg",
    },
    {
      name: "Fahm init",
      amount: "50 cKES/month",
      date: "30 Sep 2024",
      image: "/static/images/friends1.jpg",
    },
  ];

  console.log(params.id);

  // Check if the id is within bounds
  const chama = friendsChama[params.id];

  if (!chama) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h1 className="text-lg font-bold text-red-500">
          Chama not found. Please check the id.
        </h1>
      </div>
    );
  }

  return (
    <div>
      {activeSection === "Details" && (
        <div className="bg-downy-100 min-h-screen flex flex-col items-center py-2">
          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            {/* Image */}
            <div className="flex justify-center mb-2">
              <Image
                src={chama.image}
                alt="profile"
                width={300}
                height={300}
                className="rounded-full object-cover"
              />
            </div>
            {/* Chama Details */}
            <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
              {chama.name}
            </h1>
            <h2 className="text-xl text-gray-600 text-center mb-2">
              {chama.amount}
            </h2>
            <h3 className="text-lg text-gray-500 text-center mb-2">
              5 members
            </h3>
            {/* Pay Button */}
            <div className="flex justify-center mb-4">
              <button className="bg-downy-500 px-16 rounded-md py-2 text-white font-semibold text-center hover:bg-downy-700 transition-all">
                Pay
              </button>
            </div>
            {/* SVG/Icon */}
            <div className="flex justify-center ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-8 h-8 text-downy-500"
              >
                <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" />
                <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
              </svg>
            </div>
          </div>
        </div>
      )}
      {activeSection === "Members" && (
        <Members imageSrc={chama.image} name={chama.name} />
      )}
      {activeSection === "Chats" && (
        <Chat imageSrc={chama.image} name={chama.name} members={5} />
      )}

      {activeSection === "Schedule" && ( <Schedule /> )}

      {activeSection !== "Chats" && (
        <ChamaNavbar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
      )}
      {activeSection === "Wallet" && ( <Wallet /> )}
    </div>
  );
};

export default ChamaDetails;

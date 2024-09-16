"use client";

import React, { useState } from "react";
import BottomNavbar from "../Components/BottomNavbar";
import Image from "next/image";
import Link from "next/link";


const Page = () => {
  const [activeSection, setActiveSection] = useState("Chamas");
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

  const publicChama = [
    {
      name: "SuperTeam",
      amount: "1000 cKES/month",
      date: "4 Oct 2024",
      image: "/static/images/public.jpg",
    },
    {
      name: "Eagles",
      amount: "500 cKES/week",
      date: "28 Sep 2024",
      image: "/static/images/public1.jpg",
    },
  ];

  return (
    <div className="bg-downy-100 min-h-screen  justify-between">
      <div className="p-4 rounded-md">
        <h1
          className="text-4xl font-bold text-bigFont mt-2 ml-2"
          style={{ fontFamily: "Lobster, cursive" }}
        >
          ChamaPay
        </h1>
        <h2 className="text-black text-xl  mt-4">My Chamas</h2>

        <div className="mt-4">
          <h3 className="text-gray-500 text-sm">Family & Friends</h3>

          <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg mt-2 space-y-2">
            {friendsChama.map((chama, index) => (
              <Link href={`/Chama/${index}`} key={index}>
                <div className="flex items-center justify-between mt-2 mb-2">
                  <div className="flex items-center space-x-4">
                    <Image
                      src={`${chama.image}`}
                      alt="profile pic"
                      width={50}
                      height={50}
                      className="rounded-lg"
                    />
                    <div>
                      <h4 className="text-gray-900 font-medium">
                        {chama.name}
                      </h4>
                      <p className="text-gray-500 text-sm">
                        Deadline: {chama.date}
                      </p>
                    </div>
                  </div>
                  <h4 className="text-gray-900 font-normal">{chama.amount}</h4>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-6"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <hr className="border-gray-200" />
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-gray-500 text-sm">Public</h3>
          <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg mt-2 space-y-2">
            {publicChama.map((chama, index) => (
              <Link href={"/"} key={index}>
                <div className="flex items-center justify-between mt-2 mb-2">
                  <div className="flex items-center space-x-4">
                    <Image
                      src={`${chama.image}`}
                      alt="profile pic"
                      width={50}
                      height={50}
                      className="rounded-lg"
                    />
                    <div>
                      <h4 className="text-gray-900 font-medium">
                        {chama.name}
                      </h4>
                      <p className="text-gray-500 text-sm">
                        Deadline: {chama.date}
                      </p>
                    </div>
                  </div>
                  <h4 className="text-gray-900 font-normal">{chama.amount}</h4>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-6"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <hr className="border-gray-200" />
              </Link>
            ))}
          </div>
        </div>
      </div>
      <BottomNavbar activeSection={activeSection}
          setActiveSection={setActiveSection} />
    </div>
  );
};

export default Page;

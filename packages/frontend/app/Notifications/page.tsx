"use client";
import React, { useState } from "react";
import BottomNavbar from "../Components/BottomNavbar";

const Page = () => {
  const [activeSection, setActiveSection] = useState("Notifications");
  return (
    <div>
      <div className="bg-downy-100 min-h-screen p-4 rounded-md">
        <h1 className="text-black text-xl font-medium  mt-4">Notifications</h1>
        <div className="bg-white p-1 border border-gray-300 rounded-lg shadow-lg mt-2 space-y-2">
          <p className="text-gray-900 ">You have paid 1000 to Family</p>
          <small className="text-gray-500 text-sm">10th October 2023</small>
        </div>
        {/* <div className="flex flex-col justify-between p-4 rounded-md">
          <div className="flex flex-row justify-between p-4 rounded-md bg-white">
            <div className="flex flex-col">
              <h2 className="text-black text-md mt-2">Test notification</h2>
              <p className="text-gray-500 text-sm">10th October 2023</p>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.857 11.943l-4.697-4.697a.999.999 0 00-1.407 0l-4.703 4.703a.999.999 0 000 1.407l4.703 4.703a.999.999 0 001.407 0l4.697-4.697a.999.999 0 000-1.407Z"
              />
            </svg>
          </div>
          <hr className="border-gray-200" />
          <div className="flex flex-row justify-between p-4 rounded-md">
            <div className="flex flex-col">
              <h2 className="text-black text-md mt-2">Test notification 2</h2>
              <p className="text-gray-500 text-sm">11th October 2023</p>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.857 11.943l-4.697-4.697a.999.999 0 00-1.407 0l-4.703 4.703a.999.999 0 000 1.407l4.703 4.703a.999.999 0 001.407 0l4.697-4.697a.999.999 0 000-1.407Z"
              />
            </svg>
          </div>
        </div> */}
      </div>
      <BottomNavbar activeSection={activeSection}
          setActiveSection={setActiveSection} />
    </div>
  );
};

export default Page;

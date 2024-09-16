"use client";

import React, { useState } from "react";
import BottomNavbar from "../Components/BottomNavbar";

const Page = () => {
  const [showWhatIsChamaPay, setShowWhatIsChamaPay] = useState(false);
  const [showWhyChamaPay, setShowWhyChamaPay] = useState(false);
  const [activeSection, setActiveSection] = useState("Home");

  return (
    <div>
      <div className="bg-downy-100 min-h-screen p-4 rounded-md flex flex-col justify-between">
        <div className="flex flex-col space-y-4 mt-0">
          <div className="mb-0">
            <h1
              className="text-4xl font-bold text-bigFont mt-2 ml-2"
              style={{ fontFamily: "Lobster, cursive" }}
            >
              ChamaPay
            </h1>
            <small
              className="text-bigFont mt-2 ml-4"
              style={{ fontStyle: "italic" }}
            >
              Your online chama.
            </small>
          </div>
          <div className="bg-white p-2 border border-outline border-secondary rounded-md shadow-md mt-4">
            <h2 className="text-black mb-1">Create Family and Friends Chama</h2>
            <p className="text-gray-600">
              Start a chama with those you trust and manage it effortlessly.
            </p>
          </div>
          <div className="bg-white p-2 border border-outline border-secondary rounded-md shadow-md">
            <h2 className="text-black mb-1">Create/Join a Public Chama</h2>
            <p className="text-gray-600 mb-2">
              Open your chama to the public and connect with other individuals.
            </p>
            <button className="text-white py-2 px-2 rounded-md hover:bg-primary-dark bg-downy-500">
              Explore Public Chamas
            </button>
          </div>
          <div className="bg-white p-4 rounded-md shadow-md mt-6">
            <h2 className="text-lg text-black font-semibold mb-2 text-center">About ChamaPay</h2>

            <div
              className="cursor-pointer"
              onClick={() => setShowWhatIsChamaPay(!showWhatIsChamaPay)}
            >
              <h1 className=" text-base text-black">What is ChamaPay?</h1>
              {showWhatIsChamaPay ? (
                <p className="text-gray-600 mt-2">
                  ChamaPay is a platform that helps you manage your group
                  savings with ease.
                </p>
              ) : null}
            </div>
            <hr className="my-2 border-gray-300" />

            <div
              className="cursor-pointer"
              onClick={() => setShowWhyChamaPay(!showWhyChamaPay)}
            >
              <h1 className=" text-black">Why ChamaPay?</h1>
              {showWhyChamaPay ? (
                <p className="text-gray-600 mt-2">
                  It’s designed to make saving as a group seamless and secure.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <BottomNavbar activeSection={activeSection}
          setActiveSection={setActiveSection}  />
    </div>
  );
};

export default Page;

//Rem
//add pictures to the dive i.e make it lively
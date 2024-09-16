"use client";
import React, { useState } from "react";
import BottomNavbar from "../Components/BottomNavbar";
import Image from "next/image";
import Link from "next/link";

const Page = () => {

  const [activeSection, setActiveSection] = useState("Wallet");

  const paymentHistory = [
    {
      amount: "100 cKES",
      recipient: "Family",
      date: "10th October 2023",
      link: "/",
    },
    {
      amount: "50 cKES",
      recipient: "Friend",
      date: "8th October 2023",
      link: "/",
    },
    // Add more payment history items here as needed
  ];

  return (
    <div className="bg-downy-100 min-h-screen flex flex-col">
      <div className="bg-downy-600 p-4 border border-gray-300 rounded-b-3xl shadow-lg ">
        <h2 className="text-white text-lg font-semibold">Balance</h2>
        <div className="flex items-center space-x-4 mt-2">
          <h1 className="text-white text-4xl font-bold">294 cKES</h1>
          <div className="mt-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-white"
            >
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
              <path
                fillRule="evenodd"
                d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 bg-downy-500 p-2 w-fit rounded-md">
          <div className="flex items-center space-x-1">
            <h4 className="text-white text-sm">Address</h4>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4 text-white"
            >
              <path d="M7.5 3.375c0-1.036.84-1.875 1.875-1.875h.375a3.75 3.75 0 0 1 3.75 3.75v1.875C13.5 8.161 14.34 9 15.375 9h1.875A3.75 3.75 0 0 1 21 12.75v3.375C21 17.16 20.16 18 19.125 18h-9.75A1.875 1.875 0 0 1 7.5 16.125V3.375Z" />
              <path d="M15 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 17.25 7.5h-1.875A.375.375 0 0 1 15 7.125V5.25ZM4.875 6H6v10.125A3.375 3.375 0 0 0 9.375 19.5H16.5v1.125c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 0 1 3 20.625V7.875C3 6.839 3.84 6 4.875 6Z" />
            </svg>
          </div>
        </div>

        <div className="flex justify-between mt-6 ml-8 mr-8">
          <div className="flex flex-col items-center">
            <Image
              src={"/static/images/Deposit.png"}
              alt="Deposit"
              width={20}
              height={20}
            />
            <small className="mt-1">Deposit</small>
          </div>
          <div className="flex flex-col items-center">
            <Image
              src={"/static/images/Withdraw.png"}
              alt="Withdraw"
              width={20}
              height={20}
            />
            <small className=" mt-1">Withdraw</small>
          </div>
          <div className="flex flex-col items-center">
            <Image
              src={"/static/images/Send Money (2).png"}
              alt="Send"
              width={20}
              height={20}
            />
            <small className=" mt-1">Send</small>
          </div>
          <div className="flex flex-col items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-6"
            >
              <path
                fillRule="evenodd"
                d="M3 4.875C3 3.839 3.84 3 4.875 3h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5A1.875 1.875 0 0 1 3 9.375v-4.5ZM4.875 4.5a.375.375 0 0 0-.375.375v4.5c0 .207.168.375.375.375h4.5a.375.375 0 0 0 .375-.375v-4.5a.375.375 0 0 0-.375-.375h-4.5Zm7.875.375c0-1.036.84-1.875 1.875-1.875h4.5C20.16 3 21 3.84 21 4.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5a1.875 1.875 0 0 1-1.875-1.875v-4.5Zm1.875-.375a.375.375 0 0 0-.375.375v4.5c0 .207.168.375.375.375h4.5a.375.375 0 0 0 .375-.375v-4.5a.375.375 0 0 0-.375-.375h-4.5ZM6 6.75A.75.75 0 0 1 6.75 6h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75A.75.75 0 0 1 6 7.5v-.75Zm9.75 0A.75.75 0 0 1 16.5 6h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75v-.75ZM3 14.625c0-1.036.84-1.875 1.875-1.875h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.035-.84 1.875-1.875 1.875h-4.5A1.875 1.875 0 0 1 3 19.125v-4.5Zm1.875-.375a.375.375 0 0 0-.375.375v4.5c0 .207.168.375.375.375h4.5a.375.375 0 0 0 .375-.375v-4.5a.375.375 0 0 0-.375-.375h-4.5Zm7.875-.75a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75v-.75Zm6 0a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75v-.75ZM6 16.5a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75v-.75Zm9.75 0a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75v-.75Zm-3 3a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75v-.75Zm6 0a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75v-.75Z"
                clipRule="evenodd"
              />
            </svg>

            <small className="mt-1">QR Code</small>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4">
        <h3 className="text-gray-700 text-lg font-semibold">Payment History</h3>
        <ul className="mt-4 space-y-2">
          {paymentHistory.map((payment, index) => (
            <li
              key={index}
              className="border border-downy-300 p-3 rounded-lg flex justify-between items-center shadow-md"
            >
              <div className="flex items-center space-x-1">
                <div className="bg-downy-500 rounded-full p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6 text-white"
                  >
                    <path d="M10.5 6a.75.75 0 0 1 .75-.75h6.75a.75.75 0 0 1 0 1.5h-6.75A.75.75 0 0 1 10.5 6ZM7.5 12a.75.75 0 0 1 .75-.75h9.75a.75.75 0 0 1 0 1.5H8.25A.75.75 0 0 1 7.5 12Zm-.75 5.25c0-.414.336-.75.75-.75h9.75a.75.75 0 0 1 0 1.5H8.25a.75.75 0 0 1-.75-.75Z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-gray-800 text-sm font-semibold">
                    Payment to {payment.recipient}
                  </h4>
                  <p className="text-gray-600 text-xs">{payment.date}</p>
                </div>
              </div>
              <div className="text-downy-600 font-semibold">
                {payment.amount}
              </div>
              <Link href={payment.link}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6 text-downy-600"
                >
                  <path d="M12.75 3a.75.75 0 0 0-1.5 0v9a.75.75 0 0 0 1.5 0V3Zm.89 10.031a.75.75 0 0 0-1.06 1.06l2.22 2.22H6.75a.75.75 0 1 0 0 1.5h7.98l-2.22 2.22a.75.75 0 1 0 1.06 1.06l3.53-3.53a.75.75 0 0 0 0-1.06l-3.53-3.53Z" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <BottomNavbar activeSection={activeSection}
          setActiveSection={setActiveSection} />
    </div>
  );
};

export default Page;

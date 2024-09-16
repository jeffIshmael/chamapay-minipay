"use client";

import Image from "next/image";
import React from "react";

const Page = (imageSrc: string, name: string) => {
  const members = [
    {
      Name: "John Doe",
      Phone: "0712345678",
    },
    {
      Name: "Jane Doe",
      Phone: "0712345678",
    },
    {
      Name: "Jeff Doe",
      Phone: "0712345678",
    },
  ];

  return (
    <div className="bg-downy-100 min-h-screen flex flex-col items-center py-6 px-4">
      {/* Header Section */}
      <div className="flex flex-col items-center mb-8">
        <div className="rounded-full overflow-hidden mb-2">
          <Image src={`${imageSrc}`} alt={"logo"} width={80} height={80} />
        </div>
        <h2 className="text-2xl font-semibold text-downy-700">{name}</h2>
      </div>

      {/* Group Link Section */}
      <div className="flex flex-col items-center mb-6">
        <div className="text-lg font-medium mb-2">Invite Link</div>
        <button className="flex items-center space-x-2 bg-downy-200 text-downy-700 px-4 py-2 rounded-lg hover:bg-downy-300 transition duration-200">
          <span>Copy Link</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path
              fillRule="evenodd"
              d="M19.902 4.098a3.75 3.75 0 0 0-5.304 0l-4.5 4.5a3.75 3.75 0 0 0 1.035 6.037.75.75 0 0 1-.646 1.353 5.25 5.25 0 0 1-1.449-8.45l4.5-4.5a5.25 5.25 0 1 1 7.424 7.424l-1.757 1.757a.75.75 0 1 1-1.06-1.06l1.757-1.757a3.75 3.75 0 0 0 0-5.304Zm-7.389 4.267a.75.75 0 0 1 1-.353 5.25 5.25 0 0 1 1.449 8.45l-4.5 4.5a5.25 5.25 0 1 1-7.424-7.424l1.757-1.757a.75.75 0 1 1 1.06 1.06l-1.757 1.757a3.75 3.75 0 1 0 5.304 5.304l4.5-4.5a3.75 3.75 0 0 0-1.035-6.037.75.75 0 0 1-.354-1Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Members Section */}
      <div className="w-full max-w-md">
        <h1 className="text-xl font-bold text-downy-700 mb-4">Members</h1>
        <div className="space-y-4">
          {members.map((member, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  {member.Name}
                </h2>
                <p className="text-sm text-gray-500">{member.Phone}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="text-downy-600 hover:underline">Edit</button>
                <button className="text-red-600 hover:underline">Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;

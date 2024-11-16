"use client"
import React, { useEffect } from "react";
import { useRouter } from "next/navigation"; // Importing the useRouter hook

const Page = () => {
  const router = useRouter(); // Initialize router

  useEffect(() => {
    // Set a timer for 5 seconds (5000 milliseconds)
    const timer = setTimeout(() => {
      router.push("/Login"); // Redirect to /Login after 5 seconds
    }, 5000);

    // Clean up the timer when the component unmounts
    return () => clearTimeout(timer);
  }, [router]);
  return (
    <div className="h-screen flex items-center justify-center bg-downy-200">
      <div className="text-center">
        {/* Title text */}
        <h1
          className="text-5xl font-normal text-black"
          style={{
            fontFamily: "Playwrite US Trad",
            transform: "rotate(-5deg)",
          }}
        >
          ChamaPay.
        </h1>
        {/* Custom two lines below the text */}
        <div className="relative w-40 mx-auto mt-4">
          {/* First line */}
          {/* <div className="w-full h-1 bg-black transform -rotate-4"></div> */}
          {/* Second line with more spacing */}
          {/* <div className="w-full h-1 bg-black transform -rotate-3 mt-1"></div> */}
        </div>
        <p className="text-lg text-gray-700 mt-4">Your digital chama.</p>
      </div>
     
    </div>
  );
};

export default Page;

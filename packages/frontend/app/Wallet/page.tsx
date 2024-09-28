"use client";
import React, { useEffect, useState } from "react";
import BottomNavbar from "../Components/BottomNavbar";
import { useAccount } from "wagmi";
import Wallet from "../Components/Wallet";


const Page = () => {
  const [activeSection, setActiveSection] = useState("Wallet");
  const { address} = useAccount();

  useEffect(() => {
    console.log(address);
  }, []);


  return (
    <div >
      <Wallet />
      <BottomNavbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
    </div>
  );
};

export default Page;

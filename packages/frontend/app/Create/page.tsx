"use client";

import React, { useState } from "react";
import BottomNavbar from "../Components/BottomNavbar";
import CreateFamily from "../(Family&Friends)/CreateFamiy";
import CreatePublic from "../(Public)/CreatePublic";

const Page = () => {
  const [familyForm, setFamilyForm] = useState(true);

  const [activeSection, setActiveSection] = useState("Create");
 

  return (
    <div>
      <div className="min-h-screen bg-downy-100 p-4 rounded-md relative">
        <h1 className="text-lg font-semibold mb-4">Create Chama</h1>
        <div className="flex mb-6 rounded-lg py-1 bg-gray-200 relative">
          <button onClick={() => setFamilyForm(true)} className={`rounded-md w-1/2 py-1 ml-1 ${familyForm ? "bg-downy-500": "bg-gray-200"}`}>
            Family & Friends
          </button>
          <button onClick={() => setFamilyForm(false)} className={`rounded-md w-1/2 py-1 mr-1 ${familyForm ? "bg-gray-200": "bg-downy-500"}`}>Public</button>
        </div>
        {familyForm ? <CreateFamily /> : <CreatePublic />}
      </div>
      <BottomNavbar activeSection={activeSection}
          setActiveSection={setActiveSection} />
    </div>
  );
};

export default Page;

// pages/verify.tsx
import React from 'react';

const Verify = () => {
  return (
    <div className="h-screen   bg-downy-200  p-4 rounded-md"  >
      {/* <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xs text-center"> */}
        <h1 className="text-2xl font-bold mb-6 text-center">VERIFICATION</h1>
        <p className="mb-6 text-lg ml-4">Verify Your email address</p>
        <p className="mb-6 text-sm text-gray-500">
          Please enter the 6-digit code we sent to <br />
          <span className="font-bold text-black text-center">mygmailonly@gmail.com</span>
        </p>
        <div className="flex justify-between mb-4">
          {[1, 2, 3, 4, 5,6].map((_, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              className="w-12 h-12 border border-gray-300 rounded-md text-center text-2xl"
            />
          ))}
        </div>
        <button className="w-full bg-teal-500 text-white py-2 rounded-md">
          Verify
        </button>
        <p className="mt-4 text-sm text-teal-500">
          <a href="#" className="underline">Send again</a>
        </p>
      {/* </div> */}
    </div>
  );
};

export default Verify;

import Image from "next/image";
import React from "react";

const MPesaPay = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-sm mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <Image
          src={"/static/images/mpesa.png"}
          alt="MPesa logo"
          width={50}
          height={50}
        />
        <h3 className="text-xl font-semibold">MPesa Pay</h3>
      </div>
      <div>
        <form className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="phone" className="text-sm font-medium text-gray-600">Phone No (To pay from)</label>
            <input
              type="number"
              id="phone"
              placeholder="Input number"
              className="mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="amount" className="text-sm font-medium text-gray-600">Amount </label>
            <input
              type="text"
              id="amount"
              placeholder="Input amount"
              className="mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
            />
          </div>
          <button
            type="submit"
            disabled
            className="w-full py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition duration-300"
          >
            Pay
          </button>
        </form>
      </div>
    </div>
  );
};

export default MPesaPay;

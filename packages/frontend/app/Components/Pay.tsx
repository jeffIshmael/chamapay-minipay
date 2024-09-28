"use client";
import Image from "next/image";
import React, { useState } from "react";
import MPesaPay from "./MPesaPay";
import CKESPay from "./cKESPay";

const Pay = ({
  paymentMethod,
  handlePaymentMethod,chamaId, chamaName
}: {
  paymentMethod: string;
  handlePaymentMethod: (method: string) => void;
  chamaId:number;
  chamaName: string;
}) => {
  return (
    <div>
      <div
        onClick={() => handlePaymentMethod("")}
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-end transition duration-300 ease-in-out"
      >
        <div
          className="bg-white w-full max-w-sm rounded-t-3xl p-4 shadow-lg"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
        >
          {!paymentMethod ? (
            <>
              <h1 className="text-lg font-semibold mb-4 text-center">
                Pay with:
              </h1>
              <div className="space-y-2">
                <div
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent click propagation to the backdrop
                    handlePaymentMethod("ckes");
                  }}
                  className="flex items-center justify-between p-2 bg-white rounded-md hover:bg-slate-200 cursor-pointer active:bg-slate-300"
                >
                  <div className="flex items-center space-x-4 ">
                    <Image
                      src={"/static/images/cKES.png"}
                      alt="cKES logo"
                      width={40}
                      height={40}
                    />
                    <h3 className="text-lg font-medium">cKES</h3>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                <div
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent click propagation to the backdrop
                    handlePaymentMethod("mpesa");
                  }}
                  className="flex items-center justify-between p-2 bg-white rounded-md hover:bg-slate-200 cursor-pointer active:bg-slate-300"
                >
                  <div className="flex items-center space-x-6">
                    <Image
                      src={"/static/images/mpesa.png"}
                      alt="mpesa logo"
                      width={40}
                      height={40}
                    />
                    <h3 className="text-lg font-medium">M-Pesa</h3>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </>
          ) : paymentMethod === "mpesa" ? (
            <MPesaPay />
          ) : (
            // If you had CKESPay component, you can render it here similarly
            <CKESPay id = {chamaId}  name = {chamaName}/>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pay;

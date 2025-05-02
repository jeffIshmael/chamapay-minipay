import Image from "next/image";
import React, { useState } from "react";

const MPesaPay = ({ onClose }: { onClose: () => void }) => {
  const [phone, setPhone] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [successText, setSuccessText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleMpesaPayment = async (e: React.FormEvent<HTMLFormElement>) => {

    e.preventDefault();
    setSuccessText("");
    setError("");
    console.log("Mpesa payment submitted");
    console.log(`phone: ${phone}`);
    if (!phone || phone.length < 10) {
      setError("Phone number must be 10 digits");
      setIsLoading(false);
      return;
    }
    if (!amount || amount < 1) {
      setError("Amount must be at least 1");
      setIsLoading(false);
      return;
    }
    if (!phone. startsWith("07")) {
      setError("Phone number must start with 07");
      setIsLoading(false);
      return;
    }
    // change phone to 254700000000
    const phoneNumber = phone.replace(/^0/, "254");
    console.log(`phoneNumber: ${phoneNumber}`);
    try {
      setIsLoading(true);
      const response = await fetch("/api/mpesa", {
        method: "POST",
        body: JSON.stringify({ phone: Number(phoneNumber), amount: amount }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccessText("Please input your MPesa pin to complete the payment.");
        // const checkOutRequest = data.CheckOutRequestID;
        // // check the status of the payment
        // const statusResponse = await fetch("/api/mpesa/status", {
        //   method: "POST",
        //   body: JSON.stringify({ checkOutRequest }),
        // });
        // const statusData = await statusResponse.json();
        // console.log("status of the payment: ", statusData);
      } else {
        console.error("Mpesa payment failed");
        console.log(data);
      }
    } catch (error) {
      console.error("Error submitting Mpesa payment:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-sm mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <Image
          src={"/static/images/mpesa.png"}
          alt="MPesa logo"
          width={50}
          height={50}
        />
        <h3 className="text-xl font-semibold">Pay with MPesa</h3>
      </div>
      <div>
        <form onSubmit={handleMpesaPayment} className="space-y-4">
          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              <strong className="font-semibold">Error!</strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {successText && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              <strong className="font-semibold">Prompt sent!</strong>
              <span className="block sm:inline">{successText}</span>
            </div>
          )}
          <div className="flex flex-col">
            <label
              htmlFor="phone"
              className="text-sm font-medium text-gray-600"
            >
              Phone No (To pay from)
              <span className="text-xs text-gray-500">Note: This is the phone number to be prompted.</span>
            </label>
            <input
              type="number"
              maxLength={10}
              id="phone"
              placeholder="e.g 0712345678"
              value={phone || ""}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
            />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="amount"
              className="text-sm font-medium text-gray-600"
            >
              Amount (KES) min 10
            </label>
            <input
              type="number"
              id="amount"
              placeholder="e.g 10"
              min={1}
              step={1}
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
            />
          </div>
          <div className="flex justify-end">
            <p className="text-xs text-gray-500">
              Rate: 1 cUSD = 130 KES
            </p>
            <p className="text-xs text-gray-500">
              To receive: {(amount ? (amount / 130).toFixed(2) : "0.00")} cUSD
            </p>
          </div>
          <button
            type="submit"
            disabled={
              isLoading ||
              !phone ||
              !amount ||
              amount < 1 ||
              phone.toString().length < 10
            }
            className={`w-full py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition duration-300 ${
              isLoading ||
              !phone ||
              !amount ||
              amount < 1 ||
              phone.toString().length < 10
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {isLoading ? "Processing..." : "Pay"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MPesaPay;

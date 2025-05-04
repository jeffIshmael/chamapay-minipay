import Image from "next/image";
import React, { useState } from "react";
import { toast } from "sonner";

interface SendResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

const MPesaPay = ({ chamaName }: { chamaName: string }) => {
  const [phone, setPhone] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [paymentResponse, setPaymentResponse] = useState<SendResponse | null>(null);
  const [showConfirmPayment, setShowConfirmPayment] = useState(false);
  const [error, setError] = useState("");
  const [successText, setSuccessText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleMpesaPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessText("");
    setError("");
    
    if (!phone || phone.length < 10) {
      setError("Phone number must be 10 digits");
      return;
    }
    if (!amount || amount < 1) {
      setError("Amount must be at least KES 10");
      return;
    }
    if (!phone.startsWith("07")) {
      setError("Phone number must start with 07");
      return;
    }

    const phoneNumber = phone.replace(/^0/, "254");
    
    try {
      setIsLoading(true);
      const response = await fetch("/api/mpesa", {
        method: "POST",
        body: JSON.stringify({
          phone: Number(phoneNumber),
          amount: amount,
          chamaName: chamaName,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data) {
        setPaymentResponse(data);
        setSuccessText("An MPesa prompt has been sent to your phone. Please enter your MPesa PIN to complete the payment.");
        setShowConfirmPayment(true);
      } else {
        setError(data.message || "Payment request failed. Please try again.");
      }
    } catch (error) {
      setError("An error occurred while processing your payment.");
      console.error("Error submitting Mpesa payment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmPayment = async () => {
    setError("");
    setSuccessText("");
    
    try {
      if (!paymentResponse) {
        setError("No payment response found. Please try the payment again.");
        return;
      }
      
      setIsLoading(true);
      const response = await fetch("/api/status", {
        method: "POST",
        body: JSON.stringify({ paymentResponse }),
      });
      
      const data = await response.json();
      
      if (response.ok && data) {
        if(data.ResultCode === '0'){
          toast.success("Payment confirmed successfully!");
        setShowConfirmPayment(false);
        setPhone(null);
        setAmount(null);
        }else{
          toast.error("The prompt was cancelled.");
          console.log("Request code",data.ResultCode);
        }
        
      } else {
        toast.error(data.message || "Payment confirmation failed.");
      }
    } catch (error) {
      setError("Unable to confirm payment. Please check your payment status.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto border border-gray-100">
      <div className="flex items-center space-x-4 mb-6">
        <Image
          src={"/static/images/mpesa.png"}
          alt="MPesa logo"
          width={60}
          height={60}
          className="object-contain"
        />
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Pay with MPesa</h3>
          <p className="text-sm text-gray-500">Secure mobile payments</p>
        </div>
      </div>
      
      <form onSubmit={handleMpesaPayment} className="space-y-4">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {successText && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{successText}</p>
                {showConfirmPayment && (
                  <p className="mt-2 text-sm text-green-600 font-medium">
                    After completing the payment on your phone, click &quot;Confirm Payment&quot; below.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {!showConfirmPayment ? (
          <>
            <div className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">+254</span>
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    maxLength={9}
                    placeholder="712345678"
                    value={phone?.replace(/^0/, "") || ""}
                    onChange={(e) => setPhone("0" + e.target.value.replace(/^0/, ""))}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-16 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Enter your Safaricom phone number</p>
              </div>
              
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Amount (KES)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">KES</span>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    placeholder="100"
                    min={1}
                    step={1}
                    value={amount || ""}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-16 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Minimum amount: KES 10</p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Exchange rate:</span> 1 cUSD = 130 KES
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  <span className="font-medium">You'll receive:</span> {amount ? (amount / 130).toFixed(2) : "0.00"} cUSD
                </p>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !phone || !amount || amount < 1 || phone.length < 10}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading || !phone || !amount || amount < 10 || phone.length < 10
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Request Payment"
              )}
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Payment in progress</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>1. Check your phone for the MPesa prompt</p>
                    <p>2. Enter your MPesa PIN to complete payment</p>
                    <p>3. Click &quot;Confirm Payment&quot; below once done</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowConfirmPayment(false)}
                className="w-1/2 flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmPayment}
                disabled={isLoading}
                className={`w-1/2 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  "Confirm Payment"
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default MPesaPay;
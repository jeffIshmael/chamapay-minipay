"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { sdk } from "@farcaster/frame-sdk";
import Head from "next/head";

export default function Home() {
  const [isInterfaceReady, setIsInterfaceReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      setIsInterfaceReady(true);
    };
    initializeApp();
  }, []);

  useEffect(() => {
    const setReady = async () => {
      if (isInterfaceReady) {
        await sdk.actions.ready();
        await sdk.actions.addFrame();
      }
    };
    setReady();
  }, [isInterfaceReady]);

  const frameContent = {
    version: "next",
    imageUrl:
      "https://ipfs.io/ipfs/Qmd1VFua3zc65LT93Sv81VVu6BGa2QEuAakAFJexmRDGtX/1.jpg",
    button: {
      title: "view chama",
      action: {
        type: "launch_frame",
        url: "https://chamapay-minipay.vercel.app/myChamas",
        name: "ChamaApp",
        splashImageUrl: "https://chamapay-minipay.vercel.app/images/logo.png",
        splashBackgroundColor: "#f5f0ec",
      },
    },
  };

  return (
    <main className="bg-gradient-to-b from-downy-100 to-gray-50 min-h-screen rounded-md p-6">
      {/* Header Section */}
      <Head>
        <meta name="fc:frame" content={JSON.stringify(frameContent)} />
      </Head>
      <div className="text-center mt-8">
        <h1
          className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-downy-700 to-downy-500 animate__animated animate__fadeInDown"
          style={{ fontFamily: "Lobster, cursive" }}
        >
          ChamaPay
        </h1>
        <p className="text-xl font-semibold text-gray-700 mt-2 animate__animated animate__fadeInUp">
          Welcome to your circular savings app.
        </p>
      </div>

      {/* Family and Friends Section */}
      <div className="mt-12 text-center">
        <p className="text-lg font-serif text-gray-600 mb-6">
          Create chama with family and friends.
        </p>
        <Image
          src="/static/images/iso.png"
          alt="family icons"
          width={250}
          height={250}
          className="mx-auto rounded-full shadow-lg transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* Call to Action Button */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
        <Link href="/Start">
          <button className="bg-gradient-to-r from-downy-600 to-downy-700 px-12 py-3 rounded-full text-white font-semibold shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
            Get Started
          </button>
        </Link>
      </div>
    </main>
  );
}

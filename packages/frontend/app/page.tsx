"use client";
import Image from "next/image";
import Link from "next/link";
import { updateChamaStatus } from "../lib/chama";
import { useEffect } from "react";
import useSocket from "@/Hooks/useSocket";

export default function Home() {
  useSocket();

  useEffect(() => {
    updateChamaStatus();
    fetch("/api/socket").catch((err) =>
      console.error("Socket initialization error:", err)
    );
  }, []);

  return (
    <main className="bg-downy-50  min-h-screen rounded-md">
      <h1
        className="text-4xl font-bold text-bigFont mt-2 ml-2"
        style={{ fontFamily: "Lobster, cursive" }}
      >
        ChamaPay
      </h1>
      <p className="text-xl font-bold text-smallFont mt-4 text-center">
        Welcome to your fun digital chama.
      </p>
      <p className="text-l font-serif  text-smallFont mt-16 text-center">
        Create chama with family and friends.
      </p>
      <Image
        src="/static/images/iso.png"
        alt="family icons"
        width={300}
        height={300}
        className="mt-2 mx-auto"
      />
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
        <Link href="/Start">
          <button className=" bg-downy-500 px-16 rounded-md py-2 text-black text-center hover:bg-downy-700">
            Get Started
          </button>
        </Link>
      </div>
    </main>
  );
}

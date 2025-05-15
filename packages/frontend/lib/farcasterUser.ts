"use server";
import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.NEYNAR_API_KEY) {
  throw new Error("NEYNAR_API_KEY not found in .env");
}

const config = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY,
});

const farcasterClient = new NeynarAPIClient(config);

export async function getFarcasterUser(address: string) {
  try {
    const response = await farcasterClient.fetchBulkUsersByEthOrSolAddress({
      addresses: [address],
    });
    return response;
  } catch (error) {
    console.error("Error fetching Farcaster user:", error);
    return null;
  }
}
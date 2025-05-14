// this file handles getting farcaster user details from address i.e fid, username
"use server";
import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
import dotenv from "dotenv";
dotenv.config();

// Make sure to set NEYNAR_API_KEY in .env
// Get an API key at neynar.com
if (!process.env.NEYNAR_API_KEY) {
  throw new Error("NEYNAR_API_KEY not found in .env");
}

const config = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY,
});

const farcasterClient = new NeynarAPIClient(config);

let userDetails: {
  fid: number;
  userName: string;
} = {
  fid: 0,
  userName: "",
};

export async function getFarcasterUser(address: string) {
  const response = await farcasterClient.fetchBulkUsersByEthOrSolAddress({
    addresses: [address],
  });

  const user = response.result[0];

  if (user) {
    userDetails = {
      fid: user.fid,
      userName: user.username,
    };
  } else {
    throw new Error("User not found for address " + address);
  }

  return userDetails;
}

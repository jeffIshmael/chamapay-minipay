// npm i @neynar/nodejs-sdk
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


export default farcasterClient;


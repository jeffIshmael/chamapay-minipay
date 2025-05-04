// File: src/app/api/mpesa/route.ts (Next.js API Route)
import { NextResponse } from "next/server";
import moment from "moment";

const consumerKey = process.env.MPESA_CONSUMER_KEY;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
const paybill = process.env.MPESA_PAYBILL;
const passkey = process.env.MPESA_PASSKEY;
// Get the access token
export async function GET() {
  if (!consumerKey || !consumerSecret) {
    throw new Error("Missing MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET");
  }
  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
    "base64"
  );

  const headers = new Headers();
  headers.append("Authorization", `Basic ${credentials}`);

  try {
    const response = await fetch(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      { headers }
    );
    const result = await response.json();
    return result.access_token;
  } catch (error) {
    throw new Error("Failed to get access token");
  }
}

// get the status of the STK Push
export async function POST(req: Request) {
  if (!paybill || !passkey) {
    throw new Error("Missing MPESA_PAYBILL or MPESA_PASS_KEY");
  }
  const body = await req.json(); // Parse the request body
  console.log(body);
  const shortcode = paybill; // till number
  const timestamp = moment().format("YYYYMMDDHHmmss");
  const password = Buffer.from(shortcode + passkey + timestamp).toString(
    "base64"
  );

  try {
    // Get the access token using the GET function
    const accessToken = await GET();
    console.log("access token: ", accessToken);
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${accessToken}`);
    headers.append("Content-Type", "application/json");

    const response = await fetch(
      "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          BusinessShortCode: paybill,
          Password: password,
          Timestamp: timestamp,
          CheckoutRequestID: body.paymentResponse.CheckoutRequestID,
        }),
      }
    );
    const result = await response.json();
    console.log("result of stk push status: ", result);
    return NextResponse.json(result);
  } catch (error) {
    console.log(error);
  }
}

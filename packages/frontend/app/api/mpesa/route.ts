// File: src/app/api/mpesa/route.ts (Next.js API Route)
import { NextResponse } from "next/server";
import moment from "moment";

// Get the access token
export async function GET() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
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
    console.log("result of access token: ", result);
    console.log("access token: ", result.access_token);
    return result.access_token;
  } catch (error) {
    throw new Error("Failed to get access token");
  }
}

// STK Push
export async function POST(req: Request) {
  const body = await req.json(); // Parse the request body
  console.log(body);
  const shortcode = "174379";// till number
  const timestamp = moment().format("YYYYMMDDHHmmss");
  const password = Buffer.from(
    shortcode +
      "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919" +
      timestamp
  ).toString("base64");

  try {
    // Get the access token using the GET function
    const accessToken = await GET();
    console.log("access token: ", accessToken);
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${accessToken}`);
    headers.append("Content-Type", "application/json");

    const response = await fetch(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          BusinessShortCode: 174379,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: body.amount,
          PartyA: body.phone,
          PartyB: 174379,
          PhoneNumber: body.phone,
          CallBackURL: "https://chamapay-minipay.vercel.app/api/mpesa-callback",
          AccountReference: "CompanyXLTD",
          TransactionDesc: "Trial payment",
        }),
      }
    );
    const result = await response.json();
    console.log("result of stk push: ", result);
    return NextResponse.json(result);
  } catch (error) {
    console.log(error);
  }
}

// File: src/app/api/mpesa/route.ts (Next.js API Route)
import { NextResponse } from "next/server";
import moment from "moment";

export async function GET() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
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
    console.log(result);
    console.log(result.access_token);
    return NextResponse.json(result);
  } catch (error) {
    throw new Error("Failed to get access token");
  }
}

export async function POST(req: Request) {
  const body = await req.json(); // Parse the request body

  const shortcode = "174379";
  const timestamp = moment().format("YYYYMMDDHHmmss");
  const password = Buffer.from(
    shortcode +
      "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919" +
      timestamp
  ).toString("base64");

  try {
    // Get the access token using the GET function
    const tokenResponse = await GET();
    const accessToken = (await tokenResponse.json()).access_token;
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
          Amount: body.Amount,
          PartyA: body.PartyA,
          PartyB: 174379,
          PhoneNumber: body.PartyA,
          CallBackURL: "https://mydomain.com/path",
          AccountReference: "CompanyXLTD",
          TransactionDesc: "Payment of X",
        }),
      }
    );
    const result = await response.json();
    console.log(result);
    return NextResponse.json(result);
  } catch (error) {
    console.log(error);
  }
}

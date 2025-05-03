// app/api/mpesa-callback/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { headers } = await import("next/headers");
  const { sendEmail } = await import("@/app/actions/emailService");

  const headersList = headers();
  console.log("headersList", headersList);

  try {
    const body = await request.json();

    const resultCode = body?.Body?.stkCallback?.ResultCode;

    if (resultCode === 0) {
      await sendEmail("Confirmation text", JSON.stringify(body, null, 2));
      console.log("Payment successful", body);
    } else {
      await sendEmail("cancelled text", JSON.stringify(body, null, 2));
      console.log("Payment failed", body);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error handling MPesa callback:", err);
    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic"; // Required for external callbacks

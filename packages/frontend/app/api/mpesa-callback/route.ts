// app/api/mpesa-callback/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { sendEmail } from '@/app/actions/emailService';

export async function POST(request: Request) {
  const headersList = headers();
  console.log("headersList", headersList);
//   const signature = headersList.get('x-mpesa-signature');
  
  // Verify signature (compare with your generated signature)
  try {
    const body = await request.json();
    if (body.Body.stkCallback.ResultCode === 0) {
      await sendEmail("Confirmation text", JSON.stringify(body, null, 2));
      console.log("Payment successful", body);
    } else {
      await sendEmail("cancelled text", JSON.stringify(body,null,2));
      console.log("Payment failed", body);

    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error handling MPesa callback:", err);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
  
}

export const dynamic = 'force-dynamic'; // Required for external callbacks
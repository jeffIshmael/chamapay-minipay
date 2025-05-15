// /app/api/fc-user/route.ts (for Next.js App Router)
import { NextResponse } from "next/server";
import { getFarcasterUser } from "@/lib/farcasterUser"; // Import your server-side function



export async function POST(req: Request) {
  try {
    const { address } = await req.json();

    if (!address)
      return NextResponse.json({ error: "Missing address" }, { status: 400 });

    const response = await getFarcasterUser(address);

    return NextResponse.json({ response });
  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

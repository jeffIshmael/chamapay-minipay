import { NextResponse } from "next/server";
import { initializeCronJobs } from "@/lib/cronJobs";

// export const dynamic = "force-dynamic"; // Required for cron jobs

export async function GET(request: Request) {
  // Verify secret 
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  //Initialize cron jobs
  try {
    await initializeCronJobs();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Cron initialization failed" },
      { status: 500 }
    );
  }
}
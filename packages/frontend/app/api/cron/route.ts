import { NextResponse } from "next/server";
import dotenv from "dotenv";
import {  checkChamaStarted, runDailyPayouts } from "@/lib/cronjobFnctns";
import { triggerDisburse } from "@/lib/PayOut";

dotenv.config();

export async function GET(request: Request) {
  // 1. Auth check
  if (
    request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 2. Your cron logic
  await triggerDisburse(BigInt(0));
  await checkChamaStarted();
  await runDailyPayouts();
  console.log("Cron job executed at:", new Date().toISOString());

  return NextResponse.json({ success: true });
}

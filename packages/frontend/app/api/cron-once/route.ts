import { NextResponse } from "next/server";
import dotenv from "dotenv";
import { initializeCronJobs } from "@/lib/cronJobs";
import { allFunctions } from "@/lib/functions";
import {  notifyDeadline, runDailyPayouts } from "@/lib/cronjobFnctns";

dotenv.config();

export async function GET(request: Request) {
  // 1. Auth check
  if (
    request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 2. Your cron logic
  await notifyDeadline();
  await runDailyPayouts()

  console.log("Cron job executed at:", new Date().toISOString());

  return NextResponse.json({ success: true });
}

import { NextResponse } from "next/server";
import dotenv from "dotenv";
import {  checkChamaStarted, runDailyPayouts, trialError } from "@/lib/cronjobFnctns";
import { getFundsDisbursedEventLogs } from "@/lib/readFunctions";
import { getFundsDisbursedModule } from '@/Test'; 
import { sendEmail } from "@/app/actions/emailService";

dotenv.config();

export async function GET(request: Request) {
  // 1. Auth check
  if (
    request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 2. Your cron logic
  const result = await getFundsDisbursedEventLogs(3);
  await sendEmail("results from api", JSON.stringify(result));
  // await trialError(3,3);
  // await getFundsDisbursedEventLogs(3);
  // await checkChamaStarted();
  // await runDailyPayouts();
  console.log("Cron job executed at:", new Date().toISOString());

  return NextResponse.json({ result });
}

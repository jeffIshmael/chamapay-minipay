const cron = require("node-cron");
import {
  checkChamaStarted,
  notifyDeadline,
  checkBalance,
} from "./cronjobFnctns";

// Global flag to prevent duplicate initialization
let isInitialized = false;

export const initializeCronJobs = async () => {
  if (isInitialized) return;
  isInitialized = true;

  console.log("⏰ Initializing cron jobs...");

  try {
    // 1. Initial immediate executions
    await Promise.allSettled([
      checkChamaStarted(),
      notifyDeadline(),
      checkBalance(),
    ]);

    // // 2. Scheduled recurring jobs
    cron.schedule("*/30 * * * *", async () => {
      // Every 30 mins
      console.log("[CRON] Running checkChamaStarted");
      await checkChamaStarted().catch(console.error);
    });


    cron.schedule("0 9 * * *", async () => {
      // 9 AM UTC daily
      console.log("[CRON] Running notifyDeadline");
      await notifyDeadline().catch(console.error);
    });
  } catch (error) {
    console.error("❌ Cron initialization failed:", error);
    setTimeout(initializeCronJobs, 60_000); // Retry in 1 minute
  }
};



import {
    checkChamaStarted,
    notifyDeadline,
    checkBalance,
  } from "./cronjobFnctns";
import { sendFarcasterNotification } from "./farcasterNotification";
// export all  functions without cron
export const allFunctions = async () => {
    try {
      const results = await Promise.all([
        checkChamaStarted(),
        notifyDeadline(),
        checkBalance()
      ]);
      return results;
    } catch (error) {
      console.log("Error running all functions:", error);
      // throw error; // rethrow if you want upstream handlers to catch it
    }
  };
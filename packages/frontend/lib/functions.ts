import {
    checkChamaPaydate,
    checkChamaStarted,
    notifyDeadline,
    getChamasWithPaydateToday,
    checkBalance,
  } from "./cronjobFnctns";
import { sendFarcasterNotification } from "./farcasterNotification";
// export all  functions without cron
export const allFunctions = async () => {
    try {
      const results = await Promise.all([
        checkChamaStarted(),
        checkChamaPaydate(),
        notifyDeadline(),
        getChamasWithPaydateToday(),
        checkBalance(),
        sendFarcasterNotification([1077932], "Trial notification","Trying to send to one")
      ]);
      return results;
    } catch (error) {
      console.log("Error running all functions:", error);
      // throw error; // rethrow if you want upstream handlers to catch it
    }
  };
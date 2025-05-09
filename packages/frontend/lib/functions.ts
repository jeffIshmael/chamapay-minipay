import {
    checkChamaPaydate,
    checkChamaStarted,
    notifyDeadline,
    getChamasWithPaydateToday,
  } from "./cronjobFnctns";
// export all  functions without cron
export const allFunctions = async () => {
    try {
      const results = await Promise.all([
        checkChamaPaydate(),
        checkChamaStarted(),
        notifyDeadline(),
        getChamasWithPaydateToday(),
      ]);
      return results;
    } catch (error) {
      console.log("Error running all functions:", error);
      // throw error; // rethrow if you want upstream handlers to catch it
    }
  };
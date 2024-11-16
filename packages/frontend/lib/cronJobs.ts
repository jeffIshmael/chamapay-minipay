const cron = require("node-cron");
import { updateChamaStatus , notifyDeadline} from "./chama";
import {checkAndNotifyMembers} from "./paydate";

// Schedule the task to run periodically (every hour)
cron.schedule("0 * * * *", updateChamaStatus); // Runs every hour
cron.schedule("0 * * * *", notifyDeadline); // Runs every hour
cron.schedule("0 * * * *", checkAndNotifyMembers); // Runs every hour
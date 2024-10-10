const cron = require("node-cron");
import { updateChamaStatus , notifyDeadline} from "./chama";

// Schedule the task to run periodically (every hour)
cron.schedule("0 * * * *", updateChamaStatus); // Runs every hour
cron.schedule("0 * * * *", notifyDeadline); // Runs every hour
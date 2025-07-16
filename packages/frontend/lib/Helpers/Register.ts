// this file contains a function to register a chama creator to earnbase platform
// Earnbase platform will help them earn rewards if a member joins the chama
import dotenv from 'dotenv';
dotenv.config();

export async function registerOnEarnbase(address: string): Promise<boolean> {
  try {
    const res = await fetch("https://earnbase.vercel.app/api/register-creator", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.CRON_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address }),
    });

    if (!res.ok) {
      console.error("Earnbase API request failed:", res.status, res.statusText);
      return false;
    }

    const data = await res.json();

    if (typeof data === "boolean") {
      return data;
    } else {
      console.warn("Unexpected response format from Earnbase API:", data);
      return false;
    }
  } catch (error) {
    console.error("Error while calling Earnbase API:", error);
    return false;
  }
}

// add a reward of 0.2 cUSD after the user has joined the creator's chama
export async function rewardAdminOnEarnbase(adminAddress: string): Promise<boolean> {
    try {
      const res = await fetch("https://earnbase.vercel.app/api/reward-creator", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.CRON_SECRET}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminAddress }),
      });
  
      if (!res.ok) {
        console.error("Earnbase API request failed:", res.status, res.statusText);
        return false;
      }
  
      const data = await res.json();
  
      if (typeof data === "boolean") {
        return data;
      } else {
        console.warn("Unexpected response format from Earnbase API:", data);
        return false;
      }
    } catch (error) {
      console.error("Error while calling Earnbase API:", error);
      return false;
    }
  }
  


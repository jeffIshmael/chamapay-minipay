// this file contains functions that will be scheduled for crone
// i.e check if chama has started ? set started & set a shuffled payout order
//     - check if its chama paydate ? trigger payout function, send notification to all members & set next paydate

"use server";

import { PrismaClient } from "@prisma/client";
import {
  getUser,
  sendNotificationToAllMembers,
  checkIfChamaOver,
  changeIncognitoMembers,
  sendFarcasterNotificationToAllMembers,
  setPaid,
  setAllUnpaid,
} from "./chama";
import { getAgentWalletBalance, performPayout } from "./PayOut";
import { getFundsDisbursedEventLogs } from "./readFunctions";
import { formatEther } from "viem";
import { sendEmail } from "../app/actions/emailService";
import { utcToLocalTime } from "@/utils/duration";

const prisma = new PrismaClient();

interface Chama {
  id: number;
  name: string;
  slug: string;
  type: string;
  startDate: Date;
  payDate: Date;
  cycleTime: number;
  started: boolean;
  amount: bigint;
  round: number;
  cycle: number;
  canJoin: boolean;
  maxNo: number;
  blockchainId: string;
  adminId: number;
  payOutOrder: string | null;
  createdAt: Date;
  members: {
    id: number;
    payDate: Date;
    userId: number;
    chamaId: number;
  }[];
}

interface EventLog {
  args: {
    _chamaId: bigint;
    recipient: string;
    totalPay: bigint;
  };
}

let chamasToBePayedToday: Chama[] = [];

// function to check if chama has started to run after 5 mins
export async function checkChamaStarted() {
  const now = new Date();
  const utcNow = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes()
    )
  );

  try {
    await prisma.$transaction(async (tx) => {
      const chamas = await tx.chama.findMany({
        where: {
          started: false,
          startDate: { lte: utcNow },
        },
        include: { members: { include: { user: true } } },
      });

      for (const chama of chamas) {
        // Shuffle members using Fisher-Yates algorithm
        const payoutOrder = [...chama.members];
        for (let i = payoutOrder.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [payoutOrder[i], payoutOrder[j]] = [payoutOrder[j], payoutOrder[i]];
        }

        await tx.chama.update({
          where: { id: chama.id },
          data: {
            started: true,
            payOutOrder: JSON.stringify(payoutOrder),
            // lastNotifiedAt: now,
          },
        });

        await sendNotificationToAllMembers(
          chama.id,
          `🚀 ${chama.name}, ${chama.type} chama has started!\n\n` +
            `🥇 First payout: ${
              payoutOrder[0]?.user?.name || "Member"
            } on ${utcToLocalTime(chama.payDate)}`
        );
        await sendEmail("heading to notify","trully");
        await sendFarcasterNotificationToAllMembers(
          chama.id,
          `🚀 ${chama.name}, ${chama.type} chama has started!`,
          `🥇 First payout: ${
            payoutOrder[0]?.user?.name || "Member"
          } on ${utcToLocalTime(chama.payDate)}`
        );
      }
    });
  } catch (error) {
    console.error("Error in checkChamaStarted:", error);
    // send myself email
    await sendEmail(
      "An error occured in check chama start date",
      JSON.stringify(error)
    );
  }
}

// a functtion to return chamas whose paydate is today i.e only the date not the time
// this will run once a day
export async function getChamasWithPaydateToday() {
  const now = new Date();
  const startOfDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const endOfDay = new Date(startOfDay);
  endOfDay.setUTCDate(startOfDay.getUTCDate() + 1);

  try {
    chamasToBePayedToday = await prisma.chama.findMany({
      where: {
        payDate: {
          gte: startOfDay,
          lt: endOfDay,
        },
        started: true, // Only process started chamas
      },
      include: {
        members: {
          include: { user: true },
          orderBy: { id: "asc" }, // Consistent ordering
        },
      },
    });
  } catch (error) {
    console.error("Error fetching chamas:", error);
    await sendEmail(
      "An error occured in getChamaWithPaydateToday",
      JSON.stringify(error)
    );
    chamasToBePayedToday = []; // Reset on error
  }
}

// function to check if chama paydate has reached to run after 15 mins
export async function checkChamaPaydate() {
  const MAX_RETRIES = 3;
  if (chamasToBePayedToday.length == 0) {
    await sendEmail(
      "No chama has payout of today",
      "function of chama pay date"
    );
    return;
  }
  for (const chama of chamasToBePayedToday) {
    let retries = 0;
    let success = false;

    while (retries < MAX_RETRIES && !success) {
      try {
        // check if payout date has reached
        if (new Date(chama.payDate) < new Date(Date.now())) {
          await sendEmail(
            "There are chamas today but not yet time" + chama.name,
            "function of chama pay date"
          );
          return;
        }
        const txHash = await performPayout(Number(chama.blockchainId));
        if (!txHash || txHash instanceof Error) {
          await sendEmail(
            "An error occured in processPayout",
            JSON.stringify(txHash)
          );
          throw new Error("Payout failed");
        }

        const logs: EventLog = await getFundsDisbursedEventLogs(
          Number(chama.blockchainId)
        );
        if (!logs?.args) throw new Error("Event logs missing");

        const recipient = logs.args.recipient;
        const user = await getUser(recipient);
        if (!user) throw new Error("User not found");

        // set chama member as paid
        await setPaid(recipient, chama.id);

        // check recipient's position in  the payOut order
        let cycleOver: boolean = false;
        cycleOver = await checkIfChamaOver(chama.id, recipient.toString());

        await prisma.$transaction([
          prisma.payOut.create({
            data: {
              chamaId: chama.id,
              txHash: txHash,
              amount: logs.args.totalPay,
              receiver: recipient,
              userId: user.id,
            },
          }),
          prisma.chama.update({
            where: { id: chama.id },
            data: {
              payDate: new Date(
                chama.payDate.getTime() + chama.cycleTime * 86_400_000 // 1 day in ms
              ),
              round: cycleOver ? 1 : chama.round + 1,
              cycle: cycleOver ? chama.cycle + 1 : chama.cycle,
              startDate: cycleOver
                ? new Date(
                    chama.startDate.getTime() + chama.cycleTime * 86_400_000 // 1 day in ms
                  )
                : chama.startDate,
              canJoin: cycleOver ? true : false,
              // lastPayoutAt: new Date(),
            },
          }),
        ]);

        if (cycleOver) {
          // add the incognito members
          await changeIncognitoMembers(chama.id);
          // set members as unpaid because its now a new cycle
          await setAllUnpaid(chama.adminId);
          // shuffle the payout order
          const payoutOrder = [...chama.members];
          for (let i = payoutOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [payoutOrder[i], payoutOrder[j]] = [payoutOrder[j], payoutOrder[i]];
          }
          await prisma.chama.update({
            where: { id: chama.id },
            data: {
              payOutOrder: JSON.stringify(payoutOrder),
            },
          });
        }

        // if chama round is 1, set canJoin true
        await prisma.chama.update({
          where: { id: chama.id },
          data: {
            canJoin: chama.round > 1 ? false : true,
            // lastPayoutAt: new Date(),
          },
        });
        await sendNotificationToAllMembers(
          chama.id,
          `💰 Payout for ${chama.name} Complete!\n\n` +
            `${user.name} received ${formatEther(logs.args.totalPay)} cUSD\n` +
            `Round: ${chama.round + 1} • Cycle: ${chama.cycle}\n` +
            `TX: ${txHash.slice(0, 12)}...`
        );
        await sendFarcasterNotificationToAllMembers(
          chama.id,
          `💰 Payout for ${chama.name} Complete!`,
          `⚡ ${user.name} received ${formatEther(logs.args.totalPay)} cUSD for
            Round: ${chama.round + 1} • Cycle: ${chama.cycle}`
        );

        success = true;
      } catch (error) {
        retries++;
        if (retries >= MAX_RETRIES) {
          console.log(
            `⚠️ Payout Failed for ${chama.name}\n` +
              `Attempts: ${retries}\nError: ${
                error instanceof Error ? error.message : "Unknown error"
              }`
          );
          // send email
          await sendEmail(
            `⚠️ Payout Failed for ${chama.name}\n` +
              `Attempts: ${retries}\nError: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            "error in check chama paydate"
          );
        }
      }
    }
  }
}

// function to notify deadline in 1 day to run once a day
export async function notifyDeadline() {
  const now = new Date();
  // const notificationCutoff = new Date(now.getTime() - 12 * 60 * 60 * 1000); // 12 hours ago

  try {
    const chamas = await prisma.chama.findMany({
      where: {
        payDate: {
          gte: new Date(now.getTime() + 23 * 60 * 60 * 1000), // 23-25h from now
          lte: new Date(now.getTime() + 25 * 60 * 60 * 1000),
        },
      },
    });

    await Promise.all(
      chamas.map(async (chama) => {
        await sendNotificationToAllMembers(
          chama.id,
          `⏰ FINAL REMINDER\n\n` +
            `${chama.name} payment due in 24 hours!\n` +
            `Amount: ${formatEther(chama.amount)} cUSD\n` +
            `Pay by: ${utcToLocalTime(chama.payDate)}`
        );
        await sendFarcasterNotificationToAllMembers(
          chama.id,
          `⏰ FINAL REMINDER for ${chama.name} chama`,
          `${
            chama.name
          } chama payment is due in 24 hours!Please pay ${formatEther(
            chama.amount
          )} cUSD by ${utcToLocalTime(chama.payDate)} `
        );
      })
    );
  } catch (error) {
    await sendEmail(
      "An error occured in notify deadline",
      JSON.stringify(error)
    );
    console.log("Notification error:", error);
  }
}

// check balance and send email
export async function checkBalance() {
  const balance = getAgentWalletBalance();
  // send email if agent balance is below 1 celo
  if (Number(balance) < 1) {
    await sendEmail("Balance is low", `Your agent balance is ${balance} celo.`);
  }
}

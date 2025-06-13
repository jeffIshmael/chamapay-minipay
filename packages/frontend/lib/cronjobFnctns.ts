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
  sendBalanceNotification,
} from "./chama";
import {
  getAgentWalletBalance,
  performPayout,
  setBcPayoutOrder,
} from "./PayOut";
import { getFundsDisbursedEventLogs } from "./readFunctions";
import { formatEther } from "viem";
import { sendEmail } from "../app/actions/emailService";
import { utcToEAT, utcToLocalTime } from "@/utils/duration";

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

export async function checkChamaStarted() {
  const now = new Date(); // already in UTC by default
  console.log(`⏰ Checking chamas at ${now.toISOString()}`);

  try {
    await prisma.$transaction(async (tx) => {
      const chamas = await tx.chama.findMany({
        where: {
          started: false,
          startDate: { lte: now },
        },
        include: {
          members: {
            include: { user: true },
          },
        },
      });

      console.log(`🔍 Found ${chamas.length} chamas to process.`);

      for (const chama of chamas) {
        try {
          if (!chama.members.length) {
            console.warn(
              `⚠️ Chama '${chama.name}' (${chama.id}) has no members.`
            );
            continue;
          }

          // Shuffle members
          const payoutOrder = [...chama.members];
          for (let i = payoutOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [payoutOrder[i], payoutOrder[j]] = [payoutOrder[j], payoutOrder[i]];
          }

          const addressArray = payoutOrder.map(
            (m) => m.user.address as `0x${string}`
          );

          // Call blockchain to set payout order
          const setOrderTxHash = await setBcPayoutOrder(
            BigInt(Number(chama.blockchainId)),
            addressArray
          );

          if (!setOrderTxHash || setOrderTxHash instanceof Error) {
            const errorMsg = `❌ Failed to set payout order for Chama '${chama.name}' (ID: ${chama.id})`;
            console.error(errorMsg, setOrderTxHash);
            await sendEmail(errorMsg, JSON.stringify(setOrderTxHash));
            continue; // skip updating DB if on-chain failed
          }

          // Update database with started status and payout order
          await tx.chama.update({
            where: { id: chama.id },
            data: {
              started: true,
              payOutOrder: JSON.stringify(payoutOrder),
            },
          });

          const firstRecipient = payoutOrder[0]?.user?.name || "Member";
          const payDateStr = utcToEAT(chama.payDate);

          // Send notifications
          const message =
            `🚀 ${chama.name}, ${chama.type} chama has started!\n\n` +
            `🥇 First payout: ${firstRecipient} on ${payDateStr} (EAT / GMT+3)`;

          await sendNotificationToAllMembers(chama.id, message);
          await sendFarcasterNotificationToAllMembers(
            chama.id,
            message.split("\n")[0],
            message.split("\n")[1]
          );

          console.log(
            `✅ Chama '${chama.name}' (${chama.id}) marked as started.`
          );
        } catch (innerError) {
          console.error(
            `⚠️ Error processing Chama '${chama.name}' (${chama.id}):`,
            innerError
          );
          await sendEmail(
            `Error in checkChamaStarted for chama '${chama.name}' (${chama.id})`,
            JSON.stringify(innerError)
          );
        }
      }
    });
  } catch (error) {
    console.error("🔥 Critical error in checkChamaStarted:", error);
    await sendEmail(
      "🔥 Critical error in checkChamaStarted",
      JSON.stringify(error)
    );
  }
}

// a functtion to return chamas whose paydate is today i.e only the date not the time
export async function runDailyPayouts() {
  const now = new Date();

  // Get UTC start and end of today
  const startOfDayUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const endOfDayUTC = new Date(startOfDayUTC);
  endOfDayUTC.setUTCDate(endOfDayUTC.getUTCDate() + 1);

  console.log(
    `📅 Checking chamas with payDate between ${startOfDayUTC.toISOString()} and ${endOfDayUTC.toISOString()}`
  );

  try {
    const chamas = await prisma.chama.findMany({
      where: {
        started: true,
        payDate: {
          gte: startOfDayUTC,
          lt: endOfDayUTC,
        },
      },
      include: {
        members: {
          include: { user: true },
          orderBy: { id: "asc" },
        },
      },
    });

    if (chamas.length === 0) {
      console.log("ℹ️ No chamas to be paid today.");
      await sendEmail("No chama has payout today", "runDailyPayouts");
      return;
    }

    console.log(`✅ Found ${chamas.length} chamas with payDate today.`);
    console.table(
      chamas.map((c) => ({
        id: c.id,
        name: c.name,
        payDate: c.payDate.toISOString(),
        members: c.members.length,
      }))
    );

    for (const chama of chamas) {
      const MAX_RETRIES = 3;
      let retries = 0;
      let success = false;

      while (retries < MAX_RETRIES && !success) {
        try {
          if (new Date(chama.payDate) > new Date()) {
            await sendEmail(
              `⏳ Payout not yet time for ${chama.name}`,
              "Paydate reached but payout time is in the future"
            );
            break;
          }

          const txHash = await performPayout(Number(chama.blockchainId));
          if (!txHash || txHash instanceof Error) {
            throw new Error("Payout failed");
          }
          
          try {
            const logs: EventLog = await getFundsDisbursedEventLogs(
              Number(chama.blockchainId)
            );
            if (!logs?.args) throw new Error("Event logs missing");

            const recipient = logs.args.recipient;
            const user = await getUser(recipient);
            if (!user) throw new Error("User not found");

            await setPaid(recipient, chama.id);

            const cycleOver = await checkIfChamaOver(
              chama.id,
              recipient.toString()
            );

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
                    chama.payDate.getTime() + chama.cycleTime * 86400000
                  ),
                  round: cycleOver ? 1 : chama.round + 1,
                  cycle: cycleOver ? chama.cycle + 1 : chama.cycle,
                  startDate: cycleOver
                    ? new Date(
                        chama.startDate.getTime() + chama.cycleTime * 86400000
                      )
                    : chama.startDate,
                  canJoin: cycleOver ? true : chama.round <= 1,
                },
              }),
            ]);

            if (cycleOver) {
              await changeIncognitoMembers(chama.id);
              await setAllUnpaid(chama.adminId);

              const payoutOrder = [...chama.members];
              for (let i = payoutOrder.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [payoutOrder[i], payoutOrder[j]] = [
                  payoutOrder[j],
                  payoutOrder[i],
                ];
              }
              //get the addresses
              const addressArray = payoutOrder.map(
                (m) => m.user.address as `0x${string}`
              );

              // Call blockchain to set payout order
              const setOrderTxHash = await setBcPayoutOrder(
                BigInt(Number(chama.blockchainId)),
                addressArray
              );

              if (!setOrderTxHash || setOrderTxHash instanceof Error) {
                const errorMsg = `❌ Failed to set payout order for Chama '${chama.name}' (ID: ${chama.id})`;
                console.error(errorMsg, setOrderTxHash);
                await sendEmail(errorMsg, JSON.stringify(setOrderTxHash));
                continue; // skip updating DB if on-chain failed
              }

              await prisma.chama.update({
                where: { id: chama.id },
                data: { payOutOrder: JSON.stringify(payoutOrder) },
              });
            }

            await sendNotificationToAllMembers(
              chama.id,
              `💰 Payout for ${chama.name} Complete!\n\n${
                user.name
              } received ${formatEther(logs.args.totalPay)} cUSD\nRound: ${
                chama.round + 1
              } • Cycle: ${chama.cycle}\nTX: ${txHash.slice(0, 12)}...`
            );

            await sendFarcasterNotificationToAllMembers(
              chama.id,
              `💰 Payout for ${chama.name} Complete!`,
              `⚡ ${user.name} received ${formatEther(
                logs.args.totalPay
              )} cUSD for Round: ${chama.round + 1} • Cycle: ${chama.cycle}`
            );
            success = true;
          } catch (dbError) {
            console.error("⚠️ Post-payout processing failed:", dbError);
            await sendEmail("Post-payout Error", JSON.stringify(dbError));
          }
        } catch (payoutError) {
          retries++;
          console.error(`⛔ Payout attempt ${retries} failed:`, payoutError);
          if (retries >= MAX_RETRIES) {
            await sendEmail("Payout Failed", JSON.stringify(payoutError));
          }
        }
      }
    }
  } catch (error) {
    console.error("❌ Error during daily payout run:", error);
    await sendEmail("❌ Error in runDailyPayouts", JSON.stringify(error));
  }
}

// function to notify deadline in 1 day to run once a day
// Notify users 24 hours before payout is due.
// Runs once a day.
export async function notifyDeadline() {
  const now = new Date();

  try {
    const chamas = await prisma.chama.findMany({
      where: {
        payDate: {
          gte: new Date(now.getTime() + 23 * 60 * 60 * 1000),
          lte: new Date(now.getTime() + 25 * 60 * 60 * 1000),
        },
      },
    });

    await Promise.all(
      chamas.map(async (chama) => {
        const formattedAmount = formatEther(chama.amount);
        const deadlineTime = utcToEAT(chama.payDate);

        await sendNotificationToAllMembers(
          chama.id,
          `⏰ FINAL REMINDER\n\n` +
            `${chama.name} payment due in 24 hours!\n` +
            `Amount: ${formattedAmount} cUSD\n` +
            `Pay by: ${deadlineTime} (EAT / GMT+3)`
        );

        await sendFarcasterNotificationToAllMembers(
          chama.id,
          `⏰ FINAL REMINDER for ${chama.name} chama`,
          `${chama.name} chama payment is due in 24 hours!\nPlease pay ${formattedAmount} cUSD by ${deadlineTime} (EAT / GMT+3)`
        );
        await sendBalanceNotification(
          chama.id,
          Number(chama.blockchainId),
          Number(chama.amount),
          chama.type,
          chama.name,
          deadlineTime
        );
      })
    );
  } catch (error) {
    console.error("Notification error:", error);
    await sendEmail(
      "An error occurred in notifyDeadline()",
      JSON.stringify(error)
    );
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

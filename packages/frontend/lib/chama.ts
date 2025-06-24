// this file contains prisma functions for the chama
"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { formatEther, parseEther } from "viem";
import { sendFarcasterNotification } from "./farcasterNotification";
import { sendEmail } from "@/app/actions/emailService";
import { getIndividualBalance } from "./readFunctions";
const cron = require("node-cron");
const prisma = new PrismaClient();

//get all chamas
export async function getChamas() {
  const chama = await prisma.chama.findMany({
    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
  });
  return chama;
}

//function to check if a user is registered
export async function checkUser(userAddress: string) {
  const user = await prisma.user.findUnique({
    where: {
      address: userAddress,
    },
  });
  if (user) {
    return true;
  } else {
    return false;
  }
}
//function to get user specifically
export async function getUser(userAddress: string) {
  const user = await prisma.user.findUnique({
    where: {
      address: userAddress,
    },
  });
  return user;
}

//get a single chama
export async function getChama(chamaSlug: string, address: string) {
  const chama = await prisma.chama.findUnique({
    where: {
      slug: chamaSlug,
    },
    include: {
      members: {
        include: {
          user: true,
        },
      },
      admin: true,
    },
  });
  //get user
  const user = await getUser(address);
  const isMember: boolean = (await prisma.chamaMember.findFirst({
    where: {
      chamaId: chama?.id,
      userId: user?.id || 0,
    },
  }))
    ? true
    : false;
  // return the admin wallet address
  const adminWallet = chama?.admin.address;
  return { chama, isMember, adminWallet };
}

//get a single chama by slug
export async function getChamaBySlug(slug: string) {
  const chama = await prisma.chama.findUnique({
    where: { slug },
  });
  return chama;
}

//get a single chama
export async function getChamaById(chamaId: number) {
  const chama = await prisma.chama.findUnique({
    where: {
      id: chamaId,
    },
  });
  return chama;
}

//create a user
export async function createUser(
  userName: string | null,
  address: string,
  fid: number,
  farcaster: boolean
) {
  // Check if the address already exists
  let user = await prisma.user.findUnique({
    where: {
      address: address,
    },
  });

  // If the user does not exist, create a new user
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: userName,
        address: address,
        isFarcaster: farcaster,
        fid: fid,
      },
    });
  }

  // Return the existing or newly created user
  return user;
}

//get a member's chamas
export async function getChamasByUser(userId: number) {
  const chamas = await prisma.chama.findMany({
    where: {
      members: {
        some: {
          userId: userId,
        },
      },
    },
    include: {
      members: true,
      roundOutcome: true,
      payOuts: true,
    },
  });

  return chamas;
}

// Function to check if a chama has had a payout in the last 24 hrs and if the user hasn't been shown the modal
export async function checkPayoutModal(userId: number) {
  const MyChamas = await getChamasByUser(userId);
  const chamasToShowModal = [];

  const now = new Date();

  for (const chama of MyChamas) {
    const allRoundOutcomes = chama.roundOutcome;
    const allPayouts = chama.payOuts;

    // Check if there are outcomes and payouts to avoid errors
    if (allRoundOutcomes.length === 0 || allPayouts.length === 0) continue;

    const latestOutcome = allRoundOutcomes[allRoundOutcomes.length - 1];
    const latestPayout = allPayouts[allPayouts.length - 1]; // if needed in future

    const shownUsers = latestOutcome.shownMembers
      ? JSON.parse(latestOutcome.shownMembers)
      : [];

    // Calculate time difference in milliseconds
    const createdAt = new Date(latestOutcome.createdAt);
    const timeDifference = now.getTime() - createdAt.getTime();

    // Check: payout was within last 24 hours AND user has NOT been shown yet
    if (timeDifference <= 24 * 60 * 60 * 1000 && !shownUsers.includes(userId)) {
      chamasToShowModal.push(chama);
    }
  }

  return chamasToShowModal;
}

// function to add a user as shown to all the available
export async function addShownMemberToAll(userId: number) {
  // get roundoutcome
  const chamas = await checkPayoutModal(userId);
  for (const chama of chamas) {
    const allRoundOutcomes = chama.roundOutcome;
    // Check if there are outcomes and payouts to avoid errors
    if (allRoundOutcomes.length === 0) continue;
    const latestOutcome = allRoundOutcomes[allRoundOutcomes.length - 1];
    const shownUsers = latestOutcome.shownMembers
      ? JSON.parse(latestOutcome.shownMembers)
      : [];

    shownUsers.push(userId);
    await prisma.roundOutcome.update({
      where: {
        chamaId: chama.id,
        id: latestOutcome.id,
      },
      data: {
        shownMembers: JSON.stringify(shownUsers),
      },
    });
  }
}

// function to add a user as shown modal
export async function addShownMember(
  chamaId: number,
  userId: number,
  roundOutcomeId: number
) {
  // get roundoutcome
  const roundOutcome = await prisma.roundOutcome.findUnique({
    where: {
      id: roundOutcomeId,
      chamaId: chamaId,
    },
    select: {
      shownMembers: true,
    },
  });
  const userIds = JSON.parse(roundOutcome?.shownMembers || "[]");
  userIds.push(userId);

  await prisma.roundOutcome.update({
    where: {
      id: roundOutcomeId,
    },
    data: {
      shownMembers: JSON.stringify(userIds),
    },
  });
}

//create a chama
export async function createChama(
  formData: FormData,
  startDate: string,
  chamaType: string,
  adminAddress: `0x${string}`,
  blockchainId: number,
  txHash: string
) {
  try {
    // First, create the Chama
    const chama = await prisma.chama.create({
      data: {
        name: formData.get("name") as string,
        type: chamaType,
        amount: parseEther(formData.get("amount") as string),
        cycleTime: Number(formData.get("cycleTime")),
        maxNo: Number(formData.get("maxNumber")) || 15,
        slug: (formData.get("name") as string)
          .replace(/\s+/g, "-")
          .toLowerCase(),
        startDate: new Date(startDate),
        payDate: new Date(
          new Date(startDate).getTime() +
            Number(formData.get("cycleTime")) * 24 * 60 * 60 * 1000
        ),
        blockchainId: blockchainId.toString(),
        round: 1, // Adding default round
        cycle: 1, // Adding default cycle
        admin: {
          connect: {
            address: adminAddress,
          },
        },
      },
    });
    if (chama) {
      // Then, make the admin a member
      await prisma.chamaMember.create({
        data: {
          user: {
            connect: {
              address: adminAddress,
            },
          },
          chama: {
            connect: { id: chama.id },
          },
          payDate: new Date(),
        },
      });
      // get user
      const user = await getUser(adminAddress);
      if (chamaType === "Public") {
        await prisma.payment.create({
          data: {
            amount: parseEther(formData.get("amount") as string),
            txHash: txHash,
            chamaId: chama.id,
            userId: user?.id || 0,
          },
        });
      }
    }

    // Revalidate the path if necessary
    revalidatePath("/MyChamas");
  } catch (error) {
    console.log(error);
  }
}

//To check whether a chama exists
export async function checkChama(chamaName: string) {
  const chama = await prisma.chama.findUnique({
    where: {
      slug: chamaName.replace(/\s+/g, "-").toLowerCase(),
    },
  });

  if (chama) {
    return true;
  } else {
    return false;
  }
}

// to set chama member as paid
export async function setPaid(userAddress: string, chamaId: number) {
  const user = await getUser(userAddress);
  const member = await prisma.chamaMember.findFirst({
    where: {
      userId: user?.id,
      chamaId: chamaId,
    },
  });

  if (member) {
    await prisma.chamaMember.update({
      where: {
        id: member.id,
      },
      data: {
        isPaid: true,
      },
    });
  }
}

// to set all members as unpaid
export async function setAllUnpaid(chamaId: number) {
  await prisma.chamaMember.updateMany({
    where: {
      chamaId: chamaId,
    },
    data: {
      isPaid: false,
    },
  });
}

//function to add member to public chama
export async function addMemberToPublicChama(
  address: string,
  chamaId: number,
  amount: bigint,
  txHash: string,
  canJoin: boolean
) {
  await prisma.chamaMember.create({
    data: {
      user: {
        connect: {
          address: address,
        },
      },
      chama: {
        connect: {
          id: chamaId,
        },
      },
      payDate: new Date(),
      incognito: canJoin ? false : true,
    },
  });

  //get user
  const user = await getUser(address);
  //create payment
  await prisma.payment.create({
    data: {
      amount: amount,
      txHash: txHash,
      chamaId: chamaId,
      userId: user?.id || 0,
    },
  });
  //if canjoin, add member to payout
  if (canJoin) {
    const chamaPayout = await prisma.chama.findUnique({
      where: {
        id: chamaId,
      },
      select: {
        payOutOrder: true,
      },
    });
    if (chamaPayout && chamaPayout.payOutOrder) {
      const payoutArray = JSON.parse(chamaPayout.payOutOrder);
      payoutArray.push(user);
      await prisma.chama.update({
        where: {
          id: chamaId,
        },
        data: {
          payOutOrder: JSON.stringify(payoutArray),
        },
      });
    }
  }
}

//function to set a chama can join
export async function setChamaCanJoin(chamaId: number, value: boolean) {
  const chama = await prisma.chama.update({
    where: {
      id: chamaId,
    },
    data: {
      canJoin: value,
    },
  });
}

// function to change member from incognito
export async function changeIncognitoMembers(chamaId: number) {
  await prisma.chamaMember.updateMany({
    where: {
      chamaId: chamaId,
    },
    data: {
      incognito: false,
    },
  });
}

// function to check if a chama cycle is over
export async function checkIfChamaOver(
  chamaId: number,
  userAddress: string
): Promise<boolean> {
  const payoutOrder = await prisma.chama.findUnique({
    where: {
      id: chamaId,
    },
    select: {
      payOutOrder: true,
    },
  });

  if (!payoutOrder || !payoutOrder.payOutOrder) {
    return false;
  }
  // Parse the JSON string if it's stored as string
  let payOutArray;
  try {
    payOutArray =
      typeof payoutOrder.payOutOrder === "string"
        ? JSON.parse(payoutOrder.payOutOrder)
        : payoutOrder.payOutOrder;
  } catch (err) {
    console.error("Invalid payoutOrder format", err);
    return false;
  }

  if (!Array.isArray(payOutArray) || payOutArray.length === 0) {
    return false;
  }

  // Normalize address casing
  const normalizedAddress = userAddress.toLowerCase();

  const lastUser = payOutArray[payOutArray.length - 1];
  const lastUserAddress = lastUser.user?.address?.toLowerCase();

  return lastUserAddress === normalizedAddress;
}

//function to get public chamas that user is not member
export async function getPublicNotMember(userAddress: string) {
  //get user
  const user = await getUser(userAddress);
  const chamas = await prisma.chama.findMany({
    where: {
      type: "Public",
      members: {
        none: {
          userId: user?.id || 0,
        },
      },
    },
    include: { members: true },
  });
  return chamas;
}

//function to get public chamas that user is member
export async function getPublicChamas() {
  const chamas = await prisma.chama.findMany({
    where: {
      type: "Public",
    },
    include: { members: true },
  });
  return chamas;
}

//get user from id
export async function getUserById(userId: number) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  return user;
}

//record a payment
export async function makePayment(
  _amount: bigint,
  _txHash: string,
  _chamaId: number,
  userAddress: string,
  message: string
) {
  await prisma.payment.create({
    data: {
      amount: _amount,
      txHash: _txHash,
      description: message,
      user: {
        connect: {
          address: userAddress,
        },
      },
      chama: {
        connect: {
          id: _chamaId,
        },
      },
    },
  });
}

//get payments by type
export async function getPaymentsById(chamaId: number) {
  const payments = await prisma.payment.findMany({
    where: {
      chamaId: chamaId,
    },
    orderBy: {
      doneAt: "desc",
    },
  });
  return payments;
}

//get payments by type
export async function getPaymentsByUser(userId: number) {
  const payments = await prisma.payment.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      doneAt: "desc",
    },
  });
  return payments;
}

//function to get chama payouts
export async function getChamaPayouts(chamaId: number) {
  const payouts = await prisma.payOut.findMany({
    where: {
      chamaId: chamaId,
    },
  });
  return payouts;
}

//function to create a notification
export async function createNotification(
  userId: number,
  message: string,
  senderId: number | null,
  requestId: number | null,
  chamaId?: number | null
) {
  await prisma.notification.create({
    data: {
      message: message,
      senderId: senderId || null,
      requestId: requestId || null,
      user: {
        connect: {
          id: userId,
        },
      },
      // Only include chama if chamaId is provided
      ...(chamaId && {
        chama: {
          connect: {
            id: chamaId,
          },
        },
      }),
      read: false,
    },
  });
}

// function to send notifications to an array of user ids
export async function sendNotificationToUserIds(
  userIds: number[],
  message: string
) {
  await prisma.notification.createMany({
    data: userIds.map((userId) => ({
      message,
      userId,
    })),
  });
}

// function to send notification to all members
export async function sendNotificationToAllMembers(
  chamaId: number,
  message: string
) {
  const members = await prisma.chamaMember.findMany({
    where: { chamaId },
  });
  const memberUserIds = members.map((member) => member.userId);
  await sendNotificationToUserIds(memberUserIds, message);
  // send notification to farcaster users
}

// function to send notification via fc to all chama members
export async function sendFarcasterNotificationToAllMembers(
  chamaId: number,
  title: string,
  message: string
) {
  let fids: number[] = [];
  const members = await prisma.chamaMember.findMany({
    where: { chamaId },
    include: {
      user: true,
    },
  });

  for (const member of members) {
    if (member.user.isFarcaster && member.user.fid) {
      fids.push(member.user.fid);
    }
  }

  if (fids.length > 0) {
    await sendFarcasterNotification(fids, title, message);
  } else {
    console.log("No Farcaster users found in this Chama.");
  }
}

//function to send balance notif to user
export async function sendBalanceNotification(
  chamaId: number,
  chamaBlockchainId: number,
  chamaAmount: number,
  chamaType: string,
  chamaName: string,
  time: string
) {
  // Fetch all non-incognito members of the Chama with their wallet address and user info
  const members = await prisma.chamaMember.findMany({
    where: { chamaId, incognito: false },
    include: {
      user: {
        select: {
          address: true,
          fid: true,
          id: true,
        },
      },
    },
  });

  for (const member of members) {
    const userAddress = member.user.address as `0x${string}`;

    // Get locked and unlocked balances for this user
    const [lockedRaw, availableRaw] = (await getIndividualBalance(
      chamaBlockchainId,
      userAddress
    )) as [bigint, bigint];

    const lockedAmount = Number(formatEther(lockedRaw));
    const availableBalance = Number(formatEther(availableRaw));

    const remainingLocked = chamaAmount - lockedAmount;
    const remainingToPay = chamaAmount - availableBalance;

    // If any payment or lock is remaining, notify the user
    if (remainingLocked > 0 || remainingToPay > 0) {
      const title = "⏰ Arrears Reminder";
      const userId = member.user.id;
      const fid = member.user.fid;

      const message =
        chamaType === "Public"
          ? `You have an outstanding balance in **${chamaName}** chama.\n\n🔹 Please pay **${remainingToPay.toFixed(
              2
            )} cUSD**${
              remainingLocked > 0
                ? `\n🔒 And lock **${remainingLocked.toFixed(2)} cUSD**`
                : ""
            }\n⏳ Deadline: **${time} (EAT / GMT+3)**\n\nLet's keep your spot secure. Contribute now!`
          : `You're yet to complete your payment to **${chamaName}**.\n\n🔹 Amount due: **${remainingToPay.toFixed(
              2
            )} cUSD**\n⏳ Deadline: **${time} (EAT / GMT+3)**.\n\nMake sure to fulfill your commitment before the deadline.`;
      await sendNotificationToUserIds([userId], message);
      if (fid) {
        await sendFarcasterNotification([fid], title, message);
      }
    }
  }
}

// sending request to join private chama
export async function requestToJoinChama(address: string, chamaId: number) {
  //get user
  const user = await getUser(address);

  // Check if user has already requested to join
  const existingRequest = await prisma.chamaRequest.findFirst({
    where: { userId: user?.id, chamaId, status: "pending" },
  });

  if (existingRequest) {
    return true;
  }

  // Create the request
  const request = await prisma.chamaRequest.create({
    data: {
      user: { connect: { id: user?.id } },
      chama: { connect: { id: chamaId } },
    },
  });

  // Fetch the admin of the chama
  const chama = await prisma.chama.findUnique({
    where: { id: chamaId },
    include: { admin: true },
  });

  // Send notification to the admin
  if (chama) {
    // notify the user sending
    if (user?.isFarcaster && user.fid) {
      const fid = [user.fid];
      await sendFarcasterNotification(
        fid,
        "✅ Join request sent",
        `Request to join ${chama.name} successfully sent to the admin.`
      );
    }
    await createNotification(
      chama.admin.id,
      `${user?.name} has requested to join your chama ${chama.name}.`,
      user?.id || 0,
      request.id,
      chamaId
    );
    if (chama.admin.isFarcaster && chama.admin.fid) {
      const fid = [chama.admin.fid];
      await sendFarcasterNotification(
        fid,
        `📬 ${chama.name} join request.`,
        `${user?.name} has requested to join ${chama.name}. Head over and approve.`
      );
    }
  }

  return false;
}

//check if a user has a request to join a chama
export async function checkRequest(address: string, chamaId: number) {
  //get user
  const user = await getUser(address);

  // Check if user has already requested to join
  const existingRequest = await prisma.chamaRequest.findFirst({
    where: { userId: user?.id, chamaId, status: "pending" },
  });

  if (existingRequest) {
    return true;
  }
  return false;
}

//confirming join request (adding member to private chama)
export async function handleJoinRequest(
  requestId: number,
  action: "approve" | "reject",
  adminId: number,
  chamaId: number,
  canJoin: boolean
) {
  // Find the request
  const request = await prisma.chamaRequest.findUnique({
    where: { id: requestId },
    include: { chama: true, user: true },
  });

  if (!request) {
    throw new Error("Join request not found.");
  }

  if (action === "approve") {
    // Add user to chama members
    await prisma.chamaMember.create({
      data: {
        user: { connect: { id: request.userId } },
        chama: { connect: { id: request.chamaId } },
        payDate: new Date(),
        incognito: canJoin ? false : true,
      },
    });

    // Update request status to approved
    await prisma.chamaRequest.update({
      where: { id: requestId },
      data: { status: "approved" },
    });

    // Notify user
    await createNotification(
      request.userId,
      `Your request to join ${request.chama.name} has been approved.`,
      adminId,
      requestId,
      chamaId
    );
    if (request.user.isFarcaster && request.user.fid) {
      await sendEmail("approval test", "about to run sendFarcater notif");
      await sendFarcasterNotification(
        [request.user.fid],
        `✅ ${request.chama.name} chama request approved.`,
        `Congratulations. You are now a member of ${request.chama.name} chama.`
      );
    }
    //if canjoin, add member to payout
    if (canJoin) {
      const chamaPayout = await prisma.chama.findUnique({
        where: {
          id: chamaId,
        },
        select: {
          payOutOrder: true,
        },
      });
      if (chamaPayout && chamaPayout.payOutOrder) {
        const payoutArray = JSON.parse(chamaPayout.payOutOrder);
        payoutArray.push(request.user);
        await prisma.chama.update({
          where: {
            id: chamaId,
          },
          data: {
            payOutOrder: JSON.stringify(payoutArray),
          },
        });
      }
    }
  } else if (action === "reject") {
    // Update request status to rejected
    await prisma.chamaRequest.update({
      where: { id: requestId },
      data: { status: "rejected" },
    });

    // Notify user
    await createNotification(
      request.userId,
      `Your request to join ${request.chama.name} has been rejected.`,
      adminId,
      requestId,
      chamaId
    );
    if (request.user.isFarcaster && request.user.fid) {
      await sendFarcasterNotification(
        [request.user.fid],
        `${request.chama.name} chama request declined.`,
        `Unfortunately, Your ${request.chama.name} chama join request has been declined.`
      );
    }
  }
}

//get pending requests
export async function getPendingRequests(adminId: number) {
  const pendingRequests = await prisma.chamaRequest.findMany({
    where: {
      chama: {
        adminId: adminId,
      },
      status: "pending",
    },
    include: {
      user: true,
      chama: true,
    },
  });

  return pendingRequests;
}
//get request by ID
export async function getRequestById(requestId: number) {
  const request = await prisma.chamaRequest.findUnique({
    where: { id: requestId },
    include: { user: true, chama: true },
  });
  return request;
}

//function to send a notisfication
export async function getUserNotifications(userId: number) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }, // Sort by newest first
    include: {
      chama: true,
    },
  });
  return notifications;
}

//get usernotifications from request id
export async function getNotificationsByRequestId(requestId: number) {
  const notifications = await prisma.notification.findMany({
    where: { requestId },
    orderBy: { createdAt: "desc" }, // Sort by newest first
  });
  return notifications;
}

//create notification to users once the deadline is a day closer
export async function notifyDeadline() {
  try {
    // Get the current time
    const now = new Date();

    // Fetch all chamas that haven't paid out yet
    const chamas = await prisma.chama.findMany({
      where: {
        started: true, // Chama must have started
        // payDate: true, // Payment hasn't been done yet
      },
      include: {
        members: true, // Include chama members for sending notifications
      },
    });

    // Iterate through each chama to check their payout date
    for (const chama of chamas) {
      const payoutDate = new Date(chama.payDate);
      const oneDayBefore = new Date(payoutDate.getTime() - 24 * 60 * 60 * 1000); // 1 day before payout
      const twelveHoursBefore = new Date(
        payoutDate.getTime() - 12 * 60 * 60 * 1000
      ); // 12 hours before payout
      const twoHoursBefore = new Date(
        payoutDate.getTime() - 2 * 60 * 60 * 1000
      ); // 2 hours before payout

      // Check if we are 1 day, 12 hours, or 2 hours before payout
      if (now >= oneDayBefore && now < twelveHoursBefore) {
        // Send notifications to all members for 1 day before payout
        for (const member of chama.members) {
          await createNotification(
            member.id,
            `Reminder: The payout for your chama '${chama.name}' is in 1 day.`,
            chama.adminId,
            chama.id
          );
        }
      } else if (now >= twelveHoursBefore && now < twoHoursBefore) {
        // Send notifications to all members for 12 hours before payout
        for (const member of chama.members) {
          await createNotification(
            member.id,
            `Reminder: The payout for your chama '${chama.name}' is in 12 hours.`,
            chama.adminId,
            chama.id
          );
        }
      } else if (now >= twoHoursBefore && now < payoutDate) {
        // Send notifications to all members for 2 hours before payout
        for (const member of chama.members) {
          await createNotification(
            member.id,
            `Reminder: The payout for your chama '${chama.name}' is in 2 hours.`,
            chama.adminId,
            chama.id
          );
        }
      }
    }
  } catch (error) {
    console.error("Error notifying deadlines:", error);
  }

  cron.schedule("0 * * * *", notifyDeadline);
}

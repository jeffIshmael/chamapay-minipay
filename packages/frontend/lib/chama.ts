// this file contains prisma functions for the chama
"use server";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { assignPayDates } from "./paydate";
import { parseEther } from "viem";
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
export async function createUser(userName: string | null, address: string) {
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
        role: "nonr", // Assuming "nonr" is the default role
      },
    });
  }

  // Return the existing or newly created user
  return user;
}

//get a member's chamas
export async function getChamasByUser(userId: number) {
  const chamaIds = await prisma.chamaMember.findMany({
    where: {
      userId: userId,
    },
    select: {
      chamaId: true,
    },
  });

  const chamas = [];

  for (const chamaIdItem of chamaIds) {
    const chama = await prisma.chama.findUnique({
      where: {
        id: chamaIdItem.chamaId,
      },
      include: {
        members: true,
      },
    });

    if (chama) {
      chamas.push(chama);
    }
  }

  return chamas;
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
        maxNo: Number(formData.get("maxNumber")) || 0,
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

//function to add member to public chama
export async function addMemberToPublicChama(
  address: string,
  chamaId: number,
  amount: bigint,
  txHash: string
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
    include: {members: true},
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

// Function to update chama status
export async function updateChamaStatus() {
  try {
    const now = new Date();

    // Fetch all chamas that haven't started yet and where startDate <= current date
    const chamas = await prisma.chama.findMany({
      where: {
        started: false,
        startDate: {
          lte: now,
        },
      },
    });

    for (const chama of chamas) {
      // Update the started flag to true
      await prisma.chama.update({
        where: { id: chama.id },
        data: { started: true },
      });

      //update the paydates
      await assignPayDates(chama.id);
    }

    console.log(`Updated ${chamas.length} chamas.`);
  } catch (error) {
    console.error("Error updating chama status:", error);
  }
  // Schedule the task to run periodically (every hour)
  cron.schedule("0 * * * *", updateChamaStatus); // Runs every hour
}

export async function createNotification(
  userId: number,
  message: string,
  senderId: number,
  requestId: number,
  chamaId?: number | null
) {
  await prisma.notification.create({
    data: {
      message: message,
      senderId: senderId,
      requestId: requestId,
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

// sending request to join private chama
export async function requestToJoinChama(
  address: string,
  userName: string,
  chamaId: number
) {
  //get user
  const user = await getUser(address);

  // Check if user has already requested to join
  const existingRequest = await prisma.chamaRequest.findFirst({
    where: { userId: user?.id, chamaId, status: "pending" },
  });

  if (existingRequest) {
    throw new Error("You have already requested to join this chama.");
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
    await createNotification(
      chama.admin.id,
      `${userName || "A user"} has requested to join your chama ${chama.name}.`,
      user?.id || 0,
      request.id,
      chamaId
    );
  }

  return request;
}

//confirming join request
export async function handleJoinRequest(
  requestId: number,
  action: "approve" | "reject",
  adminId: number,
  chamaId: number
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

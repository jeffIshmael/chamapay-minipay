"use server";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
const cron = require("node-cron");

//get all chamas
export async function handler() {
  const chama = await prisma.chama.findMany();
  return chama;
}

//get a single chama
export async function getChama(chamaSlug: string) {
  const chama = await prisma.chama.findUnique({
    where: {
      slug: chamaSlug,
    },
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


//create a chama
export async function createChama(
  formData: FormData,
  chamaType: string,
  adminAddress: `0x${string}`
) {
  await prisma.chama.create({
    data: {
      name: formData.get("name") as string,
      type: chamaType,
      amount: Number(formData.get("amount")),
      cycleTime: Number(formData.get("cycleTime")),
      maxNo: Number(formData.get("maxNo")) || 0,
      slug: (formData.get("name") as string).replace(/\s+/g, "-").toLowerCase(),
      startDate: new Date(formData.get("startDate") as string),
      payDate: new Date(
        new Date(formData.get("startDate") as string).getTime() +
          Number(formData.get("cycleTime")) * 24 * 60 * 60 * 1000
      ),
      admin: {
        connectOrCreate: {
          where: {
            address: adminAddress,
          },
          create: {
            address: adminAddress,
            name: "glen",
            role: "nonr",
          },
        },
      },
    },
  });
  revalidatePath("/MyChamas");
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

//get user from id
export async function getUserById(userId: number) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  return user;
}

//make a payment
export async function makePayment(
  _amount: number,
  _txHash: string,
  _chamaId: number,
  userAddress: string
) {
  await prisma.payment.create({
    data: {
      amount: _amount,
      txHash: _txHash,

      user: {
        connectOrCreate: {
          where: {
            address: userAddress,
          },
          create: {
            address: userAddress,
            name: "slim",
            role: "admin",
          },
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


export async function requestToJoinChama(
  userId: number,
  userName: string,
  chamaId: number
) {
  // Check if user has already requested to join
  const existingRequest = await prisma.chamaRequest.findFirst({
    where: { userId, chamaId, status: "pending" },
  });

  if (existingRequest) {
    throw new Error("You have already requested to join this chama.");
  }

  // Create the request
  const request = await prisma.chamaRequest.create({
    data: {
      user: { connect: { id: userId } },
      chama: { connect: { id: chamaId } },
    },
  });

  // Fetch the admin of the chama
  const chama = await prisma.chama.findUnique({
    where: { id: chamaId },
    include: { admin: true },
  });

  // Send notification to the admin
   // Send notification to the admin
   if (chama) {
    await createNotification(
      chama.admin.id,
      `${userName || 'A user'} has requested to join your chama ${chama.name}.`,
      userId,
      request.id,
      chamaId
    );
  }

  return request;
}

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

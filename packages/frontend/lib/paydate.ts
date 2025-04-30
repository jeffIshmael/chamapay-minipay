// this file has helper functions


"use server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const cron = require("node-cron");

interface Member {
  id: number;
  payDate: Date;
  userId: number;
  chamaId: number;
  user: {
    name: string;
    address: string;
    id: number;

  };
  chama: {
    name: string;
    type: string;
  };
}

export async function assignPayDates(chamaId: number) {
  // Fetch the chama and its members
  const chama = await prisma.chama.findUnique({
    where: { id: chamaId },
    include: { members: true },
  });

  if (!chama) {
    throw new Error("Chama not found");
  }

  const { startDate, cycleTime, members } = chama;

  // Assign payDate for each member
  for (let i = 0; i < members.length; i++) {
    const payDate = new Date(startDate);

    // Calculate payDate based on cycle time and member's position in the array
    payDate.setDate(payDate.getDate() + i * cycleTime);

    // Update the member's payDate
    await prisma.chamaMember.update({
      where: { id: members[i].id },
      data: { payDate },
    });
  }
}

// function to shuffle an array
export function shuffleArray(array: any[]) {
  return array.sort(() => Math.random() - 0.5);
}

export async function checkAndNotifyMembers() {
  // Fetch all members whose payDate is today
  const members = await prisma.chamaMember.findMany({
    where: {
      payDate: {
        lte: new Date(),
      },
    },
    include: {
      user: true,
      chama: true,
    },
  });

  // Notify each member
  for (const member of members) {
    await prisma.notification.create({
      data: {
        message: `It's your turn to receive payment for Chama ${member.chama.name}`,
        userId: member.userId,
        chamaId: member.chamaId,
        senderId: member.chama.adminId,
        requestId: member.id,
      },
    });

    console.log(
      `Notification sent to ${member.user.name} for Chama ${member.chama.name}`
    );
  }
}

export async function restartCycle(chamaId: number) {
  // Fetch the chama and its members
  const chama = await prisma.chama.findUnique({
    where: { id: chamaId },
    include: { members: true },
  });

  if (!chama) {
    throw new Error("Chama not found");
  }

  const { cycleTime, members } = chama;

  // Find the member with the latest payDate
  const latestPayDate = Math.max(
    ...members.map((m) => new Date(m.payDate).getTime())
  );

  // Restart the cycle by assigning new pay dates
  for (let i = 0; i < members.length; i++) {
    const newPayDate = new Date(latestPayDate);

    // Calculate new payDate based on cycle time and member's position in the array
    newPayDate.setDate(newPayDate.getDate() + (i + 1) * cycleTime);

    // Update the member's payDate
    await prisma.chamaMember.update({
      where: { id: members[i].id },
      data: { payDate: newPayDate },
    });
  }
}

// function to get time remaining until chama starts
export const formatTimeRemaining = (milliseconds: number) => {
  const months = Math.floor(milliseconds / (1000 * 60 * 60 * 24 * 30));
  const weeks = Math.floor(milliseconds / (1000 * 60 * 60 * 24 * 7));
  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

  if (months > 0) return `${months}mths ${weeks}wks`;
  if (weeks > 0) return `${weeks}wks ${days}dys`;
  if (days > 0) return `${days}dys ${hours}hrs`;
  if (hours > 0) return `${hours}hrs ${minutes}mins`;
  return `${minutes}mins `;
};
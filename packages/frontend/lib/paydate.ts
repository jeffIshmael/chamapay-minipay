// this file has helper functions


"use server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();



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
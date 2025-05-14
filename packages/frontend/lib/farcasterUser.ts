// this file handles getting farcaster user details from address i.e fid, username
"use server";
import farcasterClient from "./neynarClient";

let userDetails: {
  fid: number;
  userName: string;
} = {
  fid: 0,
  userName: "",
};

export async function getFarcasterUser(address: string) {
  const response = await farcasterClient.fetchBulkUsersByEthOrSolAddress({
    addresses: [address],
  });

  const user = response.result[0];

  if (user) {
    userDetails = {
      fid: user.fid,
      userName: user.username,
    };
  } else {
    throw new Error("User not found for address " + address);
  }

  return userDetails;
}

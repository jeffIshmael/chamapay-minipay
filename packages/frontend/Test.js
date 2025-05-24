// const { sendEmail } = require("./app/actions/emailService");
// const { setBcPayoutOrder } = require("./lib/PayOut");

const payout = [
  {
    id: 4,
    userId: 2,
    chamaId: 2,
    incognito: false,
    isPaid: false,
    payDate: "2025-05-23T11:03:59.055Z",
    user: {
      id: 2,
      address: "0x4821ced48Fb4456055c86E42587f61c1F39c6315",
      name: "Shrek",
      isFarcaster: false,
      fid: 1,
      token: null,
      url: null,
      divviReferred: false,
    },
  },
  {
    id: 2,
    userId: 1,
    chamaId: 2,
    incognito: false,
    isPaid: false,
    payDate: "2025-05-23T11:00:44.586Z",
    user: {
      id: 1,
      address: "0x1fF127F31982E0Ef82f5EC2064B6185D57417a1a",
      name: "j3ff-muchiri",
      isFarcaster: true,
      fid: 1077932,
      token: null,
      url: null,
      divviReferred: false,
    },
  },
];

const main = async () => {
  try {
    const payoutOrder = payout.map((member) => member.user.address);
    console.log("payout order", payoutOrder);
    // const setOrderTxHash = await setBcPayoutOrder(BigInt(14), payoutOrder);

    // if (!setOrderTxHash || setOrderTxHash instanceof Error) {
    //   console.log("An error occured in processPayout", setOrderTxHash);
    // await sendEmail(
    //   "An error occured in processPayout",
    //   JSON.stringify(setOrderTxHash)
    // );
    // return;
    // }
    // console.log("After being set", setOrderTxHash);
  } catch (error) {
    console.log("The error", error);
  }
};

main();

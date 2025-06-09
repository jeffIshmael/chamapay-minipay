// import {
//   contractAbi,
//   contractAddress,
// } from "@/app/ChamaPayABI/ChamaPayContract";
const { createPublicClient, http, Log, parseAbiItem } = require("viem");
const { celo } = require("viem/chains");

const publicClient = createPublicClient({
  chain: celo,
  transport: http(),
});

async function getLatestChamaId() {
  const result = await publicClient.readContract({
    abi: contractAbi,
    address: contractAddress,
    functionName: "totalChamas",
  });

  return Number(result);
}

// function to get FundsDisbursed event logs
async function getFundsDisbursedEventLogs(chamaId) {
  try {
    let latestLog;
    // Get the latest block number to start watching from
    const latestBlock = await publicClient.getBlockNumber();
    const logs = await publicClient.getLogs({
      address: "0x367266EAfb2DD67A844648f86CD1F880AE100e09",
      event: parseAbiItem(
        "event ChamaRegistered(uint indexed id,  uint amount, uint duration, uint maxMembers, uint startDate,bool _isPublic,  address indexed admin)"
      ),
      fromBlock: latestBlock - 1000000n,
      toBlock: latestBlock,
    });

    console.log(logs);
    const lastLog = logs[logs.length - 1];
    console.log("The last log is,");
    console.log(lastLog);

    // Set up the event filter
    // const fundsDisbursedEvent = {
    //   address: "0x367266EAfb2DD67A844648f86CD1F880AE100e09",
    //   event: {
    //     type: "event",
    //     name: "FundsDisbursed",
    //     inputs: [
    //       {
    //         indexed: false,
    //         internalType: "uint256",
    //         name: "chamaId",
    //         type: "uint256",
    //       },
    //       {
    //         indexed: true,
    //         internalType: "address",
    //         name: "receiver",
    //         type: "address",
    //       },
    //       {
    //         indexed: false,
    //         internalType: "uint256",
    //         name: "amount",
    //         type: "uint256",
    //       },
    //     ],
    //   },
    //   fromBlock: latestBlock - BigInt(1000), // Look back 100 blocks to catch recent events
    //   toBlock: "latest",
    // };
    // console.log(fundsDisbursedEvent);

    // Watch for new events
    // const unwatch = publicClient.watchContractEvent({
    //   address: contractAddress,
    //   abi: contractAbi,
    //   eventName: "FundsDisbursed",
    //   args: {
    //     chamaId: chamaId,
    //   },
    //   onLogs: async (logs) => {
    //     await sendEmail(
    //       `⏳ the payout events for ${chamaId}`,
    //       JSON.stringify(logs)
    //     );
    //     const lastLog = logs[logs.length - 1];
    //     console.log(lastLog);
    //     latestLog = lastLog;
    //   },
    // });
    // const watch = publicClient.watchEvent({
    //   address: "0x367266EAfb2DD67A844648f86CD1F880AE100e09",
    //   event: parseAbiItem(
    //     "event ChamaRegistered(uint indexed id,  uint amount, uint duration, uint maxMembers, uint startDate,bool _isPublic,  address indexed admin)"
    //   ),
    //   onLogs: (logs) => {
    //     console.log(logs);
    //   },
    // });
  } catch (error) {
    console.error("Error watching for deposits:", error);
  }
}

getFundsDisbursedEventLogs(BigInt(1));

// [
//   {
//     eventName: 'FundsDisbursed',
//     args: {
//       chamaId: 1n,
//       recipient: '0x4821ced48Fb4456055c86E42587f61c1F39c6315',
//       amount: 3000000000000000n
//     },
//     address: '0x367266eafb2dd67a844648f86cd1f880ae100e09',
//     blockHash: '0x16af5fd0baa2cde9fcd46b14d1352551a499fce70f877112d3fea438e3b20acb',
//     blockNumber: 37424409n,
//     data: '0x000000000000000000000000000000000000000000000000000aa87bee538000',
//     logIndex: 27,
//     removed: false,
//     topics: [
//       '0xeb2cd132972ac2f1b1b2806265483bfbe1a6c39df51e7a855c258ecd12fd1c44',
//       '0x0000000000000000000000000000000000000000000000000000000000000001',
//       '0x0000000000000000000000004821ced48fb4456055c86e42587f61c1f39c6315'
//     ],
//     transactionHash: '0x15d50e808dd927041248a370e6a304105a8913634d4c4caf6d4ef2e2f6239fa0',
//     transactionIndex: 6
//   }
// ]

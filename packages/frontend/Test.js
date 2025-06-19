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
export async function getFundsDisbursedModule(chamaId) {
  try {
    let latestLog;
    // Get the latest block number to start watching from
    const latestBlock = await publicClient.getBlockNumber();
    console.log(latestBlock);

    // getting the disburse events
    const logs = await publicClient.getLogs({
      address: "0x367266EAfb2DD67A844648f86CD1F880AE100e09",
      event: parseAbiItem(
        "event FundsDisbursed(uint indexed chamaId, address indexed recipient, uint amount)"
      ),
      args: {
        chamaId: BigInt(chamaId),
      },
      fromBlock: 37162926n,
      toBlock: latestBlock,
    });
    // send the log to dev email
    console.log(`⏳ the payout events for ${chamaId}`, logs);
    //get the latest log
    const lastLog = logs[logs.length - 1];
    latestLog = lastLog;
    console.log(`⏳ the last log events for ${chamaId}`, lastLog);
    return latestLog;
  } catch (error) {
    console.error("Error watching for deposits:", error);
    console.log(`⏳ error getting logs ${chamaId}`, error);
    return null;
  }
}

// getFundsDisbursedModule(3);


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

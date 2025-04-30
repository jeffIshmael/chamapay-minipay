// this file contains a payout smart contract function that is done by agent wallet

const {
  createPublicClient,
  createWalletClient,
  http,
  parseAbiItem,
} = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { mainnet, celoAlfajores } = require("viem/chains");
// const { contractAddress } = require("./app/ChamaPayABI/ChamaPayContract");

const dotenv = require("dotenv");
dotenv.config();

const publicClient = createPublicClient({
  chain: celoAlfajores,
  transport: http(),
});

// function to get FundsDisbursed event logs
// const getFundsDisbursedEventLogs =(chamaId) => {
//     const unwatch = publicClient.watchEvent({
//       address: "0x7aAa436c48359939cD06841c11DA55434Cf7762f",
//       event: parseAbiItem('event CashDeposited(uint chamaId, address indexed receiver, uint amount)'),
//       args: {
//         _chamaId: BigInt(chamaId),
//       },
//       onLogs: logs => {
//         // return the latest log as an object
//         // return logs[logs.length - 1];
//         console.log(logs);
//       }
//     })

//   }

const getFundsDisbursedEventLogs = () => {
  return new Promise((resolve) => {
    const unwatch = publicClient.watchEvent({
      address: "0x7aAa436c48359939cD06841c11DA55434Cf7762f",
      event: parseAbiItem(
        "event CashDeposited(uint chamaId, address indexed receiver, uint amount)"
      ),
      fromBlock: BigInt(44798660),
      toBlock: "latest",
      onLogs: (logs) => {
        if (logs.length > 0) {
          // Resolve with the latest log and clean up the watcher
          console.log(logs[logs.length - 1]);
          resolve(logs[logs.length - 1]);
          unwatch();
        }
      },
    });
  });
};

// const getLatestChamaId = async () => {
//   const latestBlock = await publicClient.getBlockNumber();

//   // Set up the event filter
//   const depositEvent = {
//     address: "0x7aAa436c48359939cD06841c11DA55434Cf7762f",
//     event: {
//       type: "event",
//       name: "CashDeposited",
//       inputs: [
//         {
//           indexed: false,
//           internalType: "uint256",
//           name: "chamaId",
//           type: "uint256",
//         },
//         {
//           indexed: true,
//           internalType: "address",
//           name: "receiver",
//           type: "address",
//         },
//         {
//           indexed: false,
//           internalType: "uint256",
//           name: "amount",
//           type: "uint256",
//         },
//       ],
//     },
//     fromBlock: BigInt(44798660), // Look back 100 blocks to catch recent events
//     toBlock: "latest",
//   };

//   // Watch for new events
//   const unwatch = publicClient.watchContractEvent({
//     address: "0x7aAa436c48359939cD06841c11DA55434Cf7762f",
//     abi: intelAbi,
//     eventName: "Deposited",
//     onLogs: (logs: any) => {
//       logs.forEach((log: any) => {
//         console.log(`New deposit detected from ${log.args.user}`);
//         usersAddresses.push(log.args.user.toString());
//       });
//     },
//   });
// };

getFundsDisbursedEventLogs();


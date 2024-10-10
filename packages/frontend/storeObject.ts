const { Defender } = require('@openzeppelin/defender-sdk');
const { ethers } = require('ethers');
const abi = require("./app/ChamaPayABI/ChamaPay.json");
const contractAddress = "0x2a6705a9bBa71f752643893b159072ae44D52Ed4";
const dotenv = require("dotenv");

dotenv.config();
async function handler() {
    try {
      // Local mock data for testing
      const totalChamas = 5; // Mock total chamas
  
      let eligibleChamaIds = [];
  
      // Current timestamp in seconds
      const currentTime = Math.floor(Date.now() / 1000);
  
      // Simulate checking each chama
      for (let chamaId = 0; chamaId < totalChamas; chamaId++) {
        // Replace this with your actual contract call
        const payDate = currentTime + 10; // Mock payDate for testing
  
        console.log(`Chama ID: ${chamaId}, PayDate: ${payDate}, Current Time: ${currentTime}`);
  
        // Simulate eligibility check
        if (currentTime >= payDate) {
          eligibleChamaIds.push(chamaId);
        }
      }
  
      // Proceed with eligible chamas as before
      console.log(`Eligible Chamas: ${eligibleChamaIds}`);
    } catch (globalError) {
      console.error('Error in Autotask execution:', globalError);
    }
  }
  

handler().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

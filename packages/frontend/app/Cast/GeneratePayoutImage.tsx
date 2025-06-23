import React from "react";
import { toPng } from "html-to-image";

interface Details {
  chamaName: string;
  receiverAddress: string;
  amount: string;
  date: string; // Example: "15 June 2025"
}

export const generatePayoutImage = async (payoutDetails: Details) => {
  // const payoutDetails = {
  //   chamaName: "Celo Devs",
  //   receiverAddress: "0x3546...7452",
  //   amount: "10",
  //   date: "15 June 2025",
  // };
  const canvasRef = document.createElement("div");

  canvasRef.style.width = "1086px";
  canvasRef.style.height = "768px";
  canvasRef.style.position = "relative";
  canvasRef.style.fontFamily = "sans-serif";

  const canvasHTML = `
    <div style="
      width: 100%;
      height: 100%;
      background-image: url('/static/template-images/payouttemplate.png');
      background-size: cover;
      background-position: center;
      position: relative;
      box-sizing: border-box;
    ">
    <div
    style="
        position: absolute;
        top: 320px;
        left: 180px;
      ">
 
      <p style="
        font-size: 34px;
        color: black;
      ">
        <b>${payoutDetails.chamaName}</b> chama successfully reached payout.
      </p>

      <p style="
        font-size: 32px;
        color: #e0e0e0;
        margin-top: 10px;
      ">
        [<b style="
        color: #4ecdc4;
      ">${payoutDetails.receiverAddress}</b>]  received  💵<b style="
        color: #4ecdc4;" >${payoutDetails.amount} cUSD</b>.
      </p>

      <div style="
       position: absolute;
        top: 180px;
        left: 290px;
        border-radius: 10px;
        background: #4ecdc4;
        padding: 10px 20px;
        color: white;
        font-size: 30px;
        display: flex;
        align-items: center;
      ">
        ${payoutDetails.date}
      </div>
      </div>
    </div>
  `;

  canvasRef.innerHTML = canvasHTML;
  document.body.appendChild(canvasRef);

  // Convert to PNG
  const imageUrl = await toPng(canvasRef, { cacheBust: true });

  // Clean up
  document.body.removeChild(canvasRef);

  return imageUrl; // optionally return image if needed
};

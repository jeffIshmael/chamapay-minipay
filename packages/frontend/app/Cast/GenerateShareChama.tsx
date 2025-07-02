import React from "react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

interface Details {
  chamaName: string;
  duration: string;
  members: string;
  maxNo: string;
  amount: string;
}

export const generateShareImage = async (chamaDetails:Details) => {
  // const chamaDetails = {
  //   chamaName: "Celo Devs",
  //   duration: "3 dys",
  //   members: "6",
  //   maxNo: "10",
  //   amount: "10",
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
      background-image: url('/static/template-images/shareChama.png');
      background-size: cover;
      background-position: center;
      position: relative;
      box-sizing: border-box;
    ">
    <div
    style="
        position: absolute;
        top: 310px;
        left: 540px;
      ">
 
      <p style="
        font-size: 32px;
        color: white;
      ">
        Be part of the <b>${chamaDetails.chamaName}</b> circular savings group.
      </p>
      </div>
       <div
    style="
        position: absolute;
        top: 440px;
        left: 640px;
      ">
 
      <p style="
        font-size: 34px;
        color: white;
      ">
        ${chamaDetails.chamaName}</b>
      </p>
      </div>
       <div
    style="
        position: absolute;
        top: 500px;
        left: 640px;
      ">
 
      <p style="
        font-size: 34px;
        color: white;
      ">
        ${chamaDetails.amount} cUSD/${chamaDetails.duration}
      </p>
      </div>
        <div
    style="
        position: absolute;
        top: 570px;
        left: 640px;
      ">
 
      <p style="
        font-size: 34px;
        color: white;
      ">
        ${chamaDetails.members}/${chamaDetails.maxNo} members
      </p>
      </div>
    </div>
  `;

  canvasRef.innerHTML = canvasHTML;
  document.body.appendChild(canvasRef);

  // Convert to PNG
  const imageUrl = await toPng(canvasRef, { cacheBust: true });

  // Convert PNG to PDF
//   const pdf = new jsPDF({
//     orientation: "landscape",
//     unit: "px",
//     format: [1086, 768],
//   });

//   pdf.addImage(imageUrl, "PNG", 0, 0, 1086, 768);
//   pdf.save("payout_ticket.pdf");

  // Clean up
  document.body.removeChild(canvasRef);

  return imageUrl; 
};

import React from "react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

interface Details {
  chamaName: string;
  duration: string;
  amount: string;
}

export const generateScheduleImage = async (scheduleDetails: Details) => {
  const canvasRef = document.createElement("div");

  canvasRef.style.width = "1086px";
  canvasRef.style.height = "768px";
  canvasRef.style.position = "relative";
  canvasRef.style.fontFamily = "sans-serif";

  const canvasHTML = `
    <div style="
      width: 100%;
      height: 100%;
      background-image: url('/static/template-images/scheduleTemplate.png');
      background-size: cover;
      background-position: center;
      position: relative;
      box-sizing: border-box;
    ">
   <div
        style="
          position: absolute;
          top: 400px;
          left: 400px;
          width: 640px;
          padding: 10px 10px;
          box-sizing: border-box;
          background: transparent;
          text-align: left;
        "
      >
        <p style="
          font-size: 26px;
          color: black;
          line-height: 1.5;
          word-wrap: break-word;
          margin: 0;
        ">
          In just <b>${scheduleDetails.duration}</b>, it's my turn to receive 
          <b>${scheduleDetails.amount} cUSD</b> from the 
          <b>${scheduleDetails.chamaName}</b> chama.
        </p>
      </div>
    </div>
  `;

  canvasRef.innerHTML = canvasHTML;
  document.body.appendChild(canvasRef);

  // Convert to PNG
  const imageUrl = await toPng(canvasRef, { cacheBust: true });

  // Clean up
  document.body.removeChild(canvasRef);

  return imageUrl;
};

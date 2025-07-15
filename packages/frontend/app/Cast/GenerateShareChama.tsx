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

export const generateShareImage = async (chamaDetails: Details) => {
  const canvasRef = document.createElement("div");

  // Off-screen and hidden
  canvasRef.style.position = "absolute";
  canvasRef.style.left = "-9999px";
  canvasRef.style.top = "-9999px";
  canvasRef.style.width = "1086px";
  canvasRef.style.height = "768px";
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
      <div style="position: absolute; top: 310px; left: 540px;">
        <p style="font-size: 32px; color: white;">
          Be part of the <b>${chamaDetails.chamaName}</b> circular savings group.
        </p>
      </div>
      <div style="position: absolute; top: 440px; left: 640px;">
        <p style="font-size: 34px; color: white;">
          ${chamaDetails.chamaName}
        </p>
      </div>
      <div style="position: absolute; top: 500px; left: 640px;">
        <p style="font-size: 34px; color: white;">
          ${chamaDetails.amount} cUSD/${chamaDetails.duration}
        </p>
      </div>
      <div style="position: absolute; top: 570px; left: 640px;">
        <p style="font-size: 34px; color: white;">
          ${chamaDetails.members}/${chamaDetails.maxNo} members
        </p>
      </div>
    </div>
  `;

  canvasRef.innerHTML = canvasHTML;
  document.body.appendChild(canvasRef);

  const imageUrl = await toPng(canvasRef, { cacheBust: true });

  document.body.removeChild(canvasRef);

  return imageUrl;
};


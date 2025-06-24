# ChamaPay

![ChamaPay Logo](logo-no-background.png)

ChamaPay is a decentralized platform that leverages the **cUSD stablecoin** to facilitate the traditional _chama_ system of cicular savings. 

### What is Circular Saving?

Circular saving is a community-based saving practice where members contribute fixed amounts at regular intervals. Funds are then distributed rotationally to each participant, combining savings and peer lending.
With chamapay, users can create and manage public or private chamas where members contribute funds that are distributed to participants in rotating turns. By integrating blockchain technology, ChamaPay ensures transparent, secure, and efficient fund management for these savings groups.

---

## Problem Statement

Traditional circular savings groups face several limitations:

1. **Geographical Barriers** – Limited to physical communities due to trust requirements (e.g., workplace or neighborhood groups).
2. **Lack of Variety** – Few options for joining different types of savings groups.
3. **Manual Management** – Requires extensive record-keeping (contributions, payouts, penalties) which is prone to errors.

---

## Solution

Chamapay solves these problems by offering a **digital circular savings platform** powered by the **Celo blockchain**. Key benefits include:

- **Smart Contract Automation** – Contributions and payouts are enforced programmatically.
- **Transparency** – All transactions are recorded on-chain.
- **Access to variety group** – With chamapay platform you get variety of chamas that you can join.

---

## Features

- **Create Public and Private Chamas:**  
  Users can create two types of chamas: public (open to anyone) and private (by invitation only).
- **Rotary Fund Disbursement:**  
  Funds are contributed and distributed to chama members in turns, managed by smart contracts.

- **Hybrid Payment Options:**  
  Supports payments with cUSD stablecoin and integration with mobile money systems like M-Pesa (future plans).

- **Smart Contract-based Transparency:**  
  All transactions and fund rotations are handled transparently on the blockchain.

- **Secure and Private:**  
  User data is protected, and blockchain ensures that funds are safe and disbursed according to pre-set rules.

---

## Screenshots

Here’s a preview of the ChamaPay platform:

<div style="display: flex; flex-wrap: wrap; justify-content: space-between;">

  <img src="/packages/frontend/public/static/chamapay-demo/start.jpg" alt="start Page" width="22%" />
  <img src="/packages/frontend/public/static/chamapay-demo/home_page.jpg" alt="home Page" width="22%" />
  <img src="/packages/frontend/public/static/chamapay-demo/createChama.jpeg" alt="Create Chama" width="22%" />
  <img src="/packages/frontend/public/static/chamapay-demo/createPublic.jpeg" alt="Create public Chama" width="22%" />

  <img src="/packages/frontend/public/static/chamapay-demo/my_chamas.jpg" alt="View Chamas" width="22%" />
  <img src="/packages/frontend/public/static/chamapay-demo/explore.jpg" alt="Explore Chamas" width="22%" />  
  <img src="/packages/frontend/public/static/chamapay-demo/details.jpeg" alt="Chama Details" width="22%" />
  <img src="/packages/frontend/public/static/chamapay-demo/joinPublic.jpeg" alt="Joining public chama" width="22%" />

  <img src="/packages/frontend/public/static/chamapay-demo/chat.jpg" alt="Chama Chat" width="22%" />
  <img src="/packages/frontend/public/static/chamapay-demo/schedule_started.jpg" alt="started schedule" width="22%" />
  <img src="/packages/frontend/public/static/chamapay-demo/schedule_unstarted.jpg" alt="unstarted Schedule" width="22%" />
  <img src="/packages/frontend/public/static/chamapay-demo/wallet.jpg" alt="Wallet" width="22%" />

   <img src="/packages/frontend/public/static/chamapay-demo/paste_link.jpg" alt="paste link" width="22%" />
  <img src="/packages/frontend/public/static/chamapay-demo/join_request.jpg" alt="join request" width="22%" />
  <img src="/packages/frontend/public/static/chamapay-demo/request_sent.jpg" alt="request sent" width="22%" />
  <img src="/packages/frontend/public/static/chamapay-demo/notification.jpeg" alt="notification" width="22%" />

</div>

---

## Tech Stack

- **Blockchain:** Celo
- **Smart Contracts:** Solidity
- **Stablecoin:** cUSD
- **Frontend:** Next.js, Tailwind CSS
- **Web3 Integration:** wagmi
- **Prisma:** Prisma is utilized as the ORM (Object-Relational Mapping) tool to manage database interactions. 
- **Mobile Money Integration:** cUSD ,M-Pesa (future plans)

---

## Architecture

<img src="/packages/frontend/public/static/chamapay-demo/chamapay_arch.png" alt="Chama architecture" width="100%" />

---

## How It Works

1. **Create a Chama:**  
   Users can create a chama by defining parameters like group type (public or private), number of members, contribution amount, and rotation schedule.

2. **Invite Members:**  
   In private chamas, the group creator can invite specific people, while public chamas are open for anyone to join.

3. **Contribute Funds:**  
   Members contribute a fixed amount of funds in **cUSD**, which are pooled together.

4. **Rotary Disbursement:**  
   Funds are distributed to each member in turns.

5. **Payout:**  
   Members receive their payout automatically once its time.

---

## Security Measures

 - **Public Chama Safeguard:** In public chamas, each member is required to lock an amount equal to the chama’s contribution amount. This locked amount can be used to cover the member’s share in case they default on a payment, ensuring that the chama’s payout structure remains secure.

 - **Private Chama Access Control:** For private chamas, users need a direct link and admin approval to join, maintaining privacy and group integrity by allowing only selected participants.

- **Non-Contribution on Payout Date:** If, on the payout date, any member has not contributed their required amount, all contributing members are automatically refunded to their wallets. This measure protects contributors and maintains fairness in payout timing.

---

## Implemented Features


- ✅ Chama creation (public/private)
- ✅ Join public chamas
- ✅ Deposit funds (cUSD via M-Pesa or wallet)
- ✅ Automated payouts
- ✅ chamapay smart contract deployment (Celo) [View smart contract](https://celoscan.io/address/0xbbeac768e3a3441c75cdb1ee6c3f56af89695bba)
- ✅ Farcaster Integration: Successfully implemented Farcaster transforming it into a seamless mini-app experience. [chamapay fc miniapp](https://farcaster.xyz/miniapps/xXpwKJ5lxJHj/chamapay)
   



## Upcoming Features

🛠 **Paymaster Integration**

- Sponsor gas fees for users.

🛠 **M-pesa integration**

- Enable users to pay for chamas via m-pesa.

---

### Getting Started

- Watch our video demo [Live Demo](https://youtu.be/QWdLC_tvImo?si=T2chg5htx1sYIYg5)
- Try out our platform in our [live link](https://chamapay-minipay.vercel.app/)

---

## Contact

<a href="chamapay37@gmail.com">@ChamaPay devs </a>

import React from "react";
import { HiOutlineX } from "react-icons/hi";

const PayoutCongrats = () => {
  return (
    <div>
      <div>
        <HiOutlineX />
      </div>
      <div>
        <h1>Congratulations!!</h1>
        <p>
           Hurray!!<span>Celo Devs</span> chama has reached payout.
           
        </p>
        <p>
            Drips received 10 cUSD as payout for cycle 2 round 4 of Celo Devs chama.
        </p>
        {/* fancy image / svg */}
      </div>
      <div>
        <button>Cast and Flex</button>
      </div>
    </div>
  );
};

export default PayoutCongrats;

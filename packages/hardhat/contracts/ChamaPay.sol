// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;


import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ChamaPay {

    uint public totalChamas;
    uint public totalPayments;

    IERC20 public cKESToken;
    address public owner;
       
    // address public cUSDTokenAddress = // 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1 //testnet
    // 0x765DE816845861e75A25fCA122bb6898B8B1282a //mainnet

    // 0x456a3D042C0DbD3db53D5489e98dFb038553B0d0  //cKES
    constructor() {

    owner = msg.sender;
    cKESToken = IERC20(0x456a3D042C0DbD3db53D5489e98dFb038553B0d0);
    
    }

    struct Chama {
        uint chamaId;
        // string name;
        uint amount;
        uint startDate;
        uint payDate;
        uint duration;
        // uint maxMembers;
        uint cycle; //disbursements
        uint round; // whole rotation(everyone has gotten)
        address admin;       
        address[] members;
        address[] payoutOrder;//order on how the payment is done
        mapping(address => uint) balances;
        mapping(address => bool) hasSent;
    }

    Chama[] public chamas;

    //Records of withdrawals
    struct Payment {
        uint id;
        uint chamaId;
        address receiver;
        uint amount;
        uint timestamp;
    }

    Payment[] public payments;

    event ChamaRegistered(uint id,  uint amount, uint duration, uint startDate,  address admin);
    event CashDeposited(uint chamaId, address receiver, uint amount);
    event FundsDisbursed(uint chamaId, address recipient, uint amount);
    event RefundIssued(uint chamaId, address member, uint amount);
    event amountWithdrawn( address _address, uint amount);
    event MemberAdded(uint _chamaId , address _address);
    event PayoutOrderSet(uint _chamaId, address [] _payoutOrder);
    event MemberRemoved(uint _chamaId, address _member);
    event ChamaDeleted(uint _chamaId);
    event PayOutProcessed( address _receiver, uint _amount);
    event WithdrawalRecorded(uint _chamaId, address _receiver, uint  _amount);
    event RefundUpdated( uint _chamaId);

    // Register a new chama
    function registerChama(uint _amount, uint _duration, uint _startDate) public {
        // require(_maxMembers == _members.length, "Total members count doesn't match the provided members.");
        require(_startDate >= block.timestamp, "Start date must be in the future.");

        Chama storage newChama = chamas.push();
        newChama.chamaId = totalChamas;
        // newChama.name = _name;
        newChama.amount = _amount;
        newChama.startDate = _startDate;
        newChama.duration = _duration;
        // newChama.maxMembers = _maxMembers;
        newChama.payDate = _startDate + _duration;
        newChama.admin = msg.sender;
        newChama.members.push(msg.sender);
        newChama.cycle = 1;
        newChama.round=1;
        newChama.balances[msg.sender] = 0;
        newChama.hasSent[msg.sender] = false;

        totalChamas++;

        emit ChamaRegistered(totalChamas - 1, _amount, _duration, _startDate,  msg.sender);
    }

    
     // Add a member to the chama
    function addMember(address _address, uint _chamaId) public onlyAdmin(_chamaId) {
        require(_chamaId < chamas.length, "The chamaId does not exist");
        Chama storage chama = chamas[_chamaId];
        // require(chama.members.length < chama.maxMembers, "Chama already has max members");
        chama.members.push(_address);
        if(block.timestamp > chama.startDate){
            chama.payoutOrder.push(_address);
        }
        emit MemberAdded(_chamaId, _address);
    }

    
    // Deposit cash to a chama
    function depositCash(uint _chamaId, uint _amount) public onlyMembers(_chamaId) {
    // Ensure the chama exists
    require(_chamaId < totalChamas, "Chama does not exist");

    Chama storage chama = chamas[_chamaId];
    

    // Update balance for the sender
    chama.balances[msg.sender] += _amount;

    // Mark the user as having sent their payment if they have reached the required amount
    if (chama.balances[msg.sender] >= chama.amount) {
        chama.hasSent[msg.sender] = true;
    }

     checkPayDate(_chamaId);
    // Emit an event for the cash deposit
    emit CashDeposited(_chamaId, msg.sender, _amount);

   
}

    // Check if all members have contributed
    function allMembersContributed(uint _chamaId) internal view returns (bool) {
        Chama storage chama = chamas[_chamaId];
        for (uint i = 0; i < chama.members.length; i++) {
            if (chama.balances[chama.members[i]] < chama.amount) {
                return false;
            }
        }
        return true;
    }

    // Disburse funds to a member
    function disburse(uint _chamaId) internal {
        Chama storage chama = chamas[_chamaId];        
        require(chama.members.length > 0, "Payout order is empty");
        address recipient = chama.members[chama.cycle % chama.members.length];
        uint totalPay = chama.amount * chama.members.length;

        //make the payout
        processPayout(recipient, totalPay);

        //record the withdrawal
        recordWithdrawal(_chamaId, recipient, totalPay);
        
        // Reset payment status for the next round
        for (uint i = 0; i < chama.members.length; i++) {
            chama.hasSent[chama.members[i]] = false;
        }

        //reset their balances
        for (uint i = 0; i < chama.members.length; i++) {
            chama.balances[chama.members[i]] -= chama.amount;
        }

            // Check if we have completed a rotation
        if (chama.cycle + 1 > chama.members.length) {
        chama.round += 1; // Increment the round after one rotation
        }
        chama.payDate += chama.duration;
        chama.cycle++;

        emit FundsDisbursed(_chamaId, recipient, totalPay);
    
    }

    // Function to delete a member (admin or self)
    function deleteMember(uint _chamaId, address _member) public onlyMembers(_chamaId) {
        Chama storage chama = chamas[_chamaId];
        require(msg.sender == chama.admin || msg.sender == _member, "Only admin or the member can delete");

        // Check if chama.cycle is divisible by members.length
        require(chama.members.length > 0, "No members to remove");
        require(chama.cycle % chama.members.length == 0, "Cannot delete member during an active cycle");

        // Refund the member's balance if greater than zero
        uint refundAmount = chama.balances[_member];
        if (refundAmount > 0) {
            // Transfer the balance back to the member
            processPayout(_member, refundAmount);

            //record the withdrawal
            recordWithdrawal(_chamaId, _member, refundAmount);
            chama.balances[_member] = 0; // Reset the balance
        }

        // Remove member from members array
        for (uint i = 0; i < chama.members.length; i++) {
            if (chama.members[i] == _member) {
                chama.members[i] = chama.members[chama.members.length - 1]; // Replace with the last member
                chama.members.pop(); // Remove the last member
                break;
            }
        }
        
        // Remove member from payout order 
        for (uint i = 0; i < chama.payoutOrder.length; i++) {
            if (chama.payoutOrder[i] == _member) {
                chama.payoutOrder[i] = chama.payoutOrder[chama.payoutOrder.length - 1];
                chama.payoutOrder.pop();
                break;
            }
        }

        emit MemberRemoved(_chamaId, _member);
    }

    //function to process payout
    function processPayout(address _receiver, uint _amount) internal {
        require(cKESToken.balanceOf(address(this)) >= _amount, "Contract does not have enough cKES");
        require(cKESToken.transfer(_receiver, _amount), "Transfer failed");
        emit PayOutProcessed(_receiver, _amount);
        
    }

    //function to record all withdrawal function
    function recordWithdrawal(uint _chamaId, address _receiver, uint _amount) internal {
         // Record the payment
        payments.push(Payment({
        id: totalPayments,
        chamaId: _chamaId,
        receiver: _receiver,
        amount: _amount,
        timestamp: block.timestamp
        }));

        totalPayments++;

        emit WithdrawalRecorded(_chamaId, _receiver, _amount);
        
    }


    // Function to delete a chama (admin only)
    function deleteChama(uint _chamaId) public onlyAdmin(_chamaId) {
        Chama storage chama = chamas[_chamaId];

         // Check if chama.cycle is divisible by members.length
        require(chama.members.length > 0, "No members to remove");
        require(chama.cycle % chama.members.length == 0, "Cannot delete member during an active cycle");

        // Refund all members
        refund(_chamaId);

        // Remove the chama by swapping with the last element and then popping
        Chama storage lastChama = chamas[chamas.length - 1];
        chamas[_chamaId].chamaId = lastChama.chamaId;
        chamas[_chamaId].amount = lastChama.amount;
        chamas[_chamaId].startDate = lastChama.startDate;
        chamas[_chamaId].payDate = lastChama.payDate;
        chamas[_chamaId].duration = lastChama.duration;
        chamas[_chamaId].cycle = lastChama.cycle;
        chamas[_chamaId].round = lastChama.round;
        chamas[_chamaId].admin = lastChama.admin;
        chamas[_chamaId].members = lastChama.members;
        chamas[_chamaId].payoutOrder = lastChama.payoutOrder;
        chamas.pop();

        emit ChamaDeleted(_chamaId);
    }



    // Check pay date and trigger payout or refund
    function checkPayDate(uint _chamaId) public {
        Chama storage chama = chamas[_chamaId];
        // Check if the current time has passed the pay date
        if (block.timestamp >= chama.payDate) {
            if (allMembersContributed(_chamaId)) {
                disburse(_chamaId); // Disburse funds if everyone has paid
            } else {
                refund(_chamaId); // Refund if not everyone has paid
            }
        }
    }

    // Function to check the balance of a specific address in a specific chama
    function getBalance(uint _chamaId, address _member) public view returns (uint) {
    require(_chamaId < totalChamas, "Chama does not exist");
    
    Chama storage chama = chamas[_chamaId];
    
    // Return the balance from the mapping
    return chama.balances[_member];
    }


    // Set the shuffled payout order (off-chain generated)
    function setPayoutOrder(uint _chamaId, address[] memory _payoutOrder) public onlyAdmin(_chamaId) {
        require(_payoutOrder.length == chamas[_chamaId].members.length, "Payout order length mismatch");
        Chama storage chama = chamas[_chamaId];
        chama.payoutOrder = _payoutOrder;
        emit PayoutOrderSet(_chamaId, _payoutOrder);
    }


    // Refund the cash if the startDate passes and not all members have paid
    function refund(uint _chamaId) internal {
        Chama storage chama = chamas[_chamaId];

        for (uint i = 0; i < chama.members.length; i++) {
            address member = chama.members[i];
            uint refundAmount = chama.balances[member];
            if (refundAmount > 0) {
                //transfer the money back to the member
                processPayout(member, refundAmount);

                //record the withdrawal
                recordWithdrawal(_chamaId, member, refundAmount);

                chama.balances[member] = 0;

                emit RefundIssued(_chamaId, member, refundAmount);
            }
        }
        // Reset payment status for the next round
        for (uint i = 0; i < chama.members.length; i++) {
            chama.hasSent[chama.members[i]] = false;
        }
         if (chama.cycle + 1 > chama.members.length) {
        chama.round += 1; // Increment the round after one rotation
        }
        chama.payDate += chama.duration;
        chama.cycle++;
        emit RefundUpdated( _chamaId);

    }

    // Get all payments
    function getPayments() public view returns (Payment[] memory) {
        return payments;
    }

    // Get all chamas
   function getChamas() public view returns (
    uint[] memory, 
    // string[] memory, 
    uint[] memory, 
    uint[] memory, 
    uint[] memory, 
    // uint[] memory, 
    address[] memory
) {
    uint[] memory chamaIds = new uint[](chamas.length);
    // string[] memory names = new string[](chamas.length);
    uint[] memory amounts = new uint[](chamas.length);
    uint[] memory startDates = new uint[](chamas.length);
    uint[] memory durations = new uint[](chamas.length);    
    address[] memory admins = new address[](chamas.length);

    for (uint i = 0; i < chamas.length; i++) {
        Chama storage chama = chamas[i];
        chamaIds[i] = chama.chamaId;
        // names[i] = chama.name;
        amounts[i] = chama.amount;
        startDates[i] = chama.startDate;
        durations[i] = chama.duration;        
        admins[i] = chama.admin;
    }

    return (chamaIds, amounts, startDates, durations, admins);
}


    //function to get chama by id
   function getChama(uint _chamaId) public view returns (
    uint,
    // string memory,
    uint,
    uint,
    uint,
    uint,
    uint,
    address,
    address[] memory
) {
    Chama storage chama = chamas[_chamaId];
    return (
        chama.chamaId,
        // chama.name,
        chama.amount,
        chama.startDate,
        chama.duration,
        chama.round,
        chama.cycle,
        chama.admin,
        chama.members
    );
}

    //function to check that one is member
    function isMember(uint _chamaId, address _user) public view returns (bool) {
    Chama storage chama = chamas[_chamaId];
    for (uint i = 0; i < chama.members.length; i++) {
        if (chama.members[i] == _user) {
            return true;
        }
    }
    return false;
    }



    // Modifier to restrict function access to members of a chama
    modifier onlyMembers(uint _chamaId) {
        bool isAMember = false;
        for (uint i = 0; i < chamas[_chamaId].members.length; i++) {
            if (msg.sender == chamas[_chamaId].members[i]) {
                isAMember = true;
                break;
            }
        }
        require(isAMember, "You are not a member of the chama.");
        _;
    }

    //function to withdraw from the contract
   function withdraw(address _address) public onlyOwner {
       cKESToken.transfer(_address, cKESToken.balanceOf(address(this)));
       emit amountWithdrawn(_address, cKESToken.balanceOf(address(this)));
   }

   
   //modifier for only Admin
   modifier onlyAdmin(uint _chamaId){
    require(chamas[_chamaId].admin == msg.sender, "only the admin can add a member");
    _;
   }

   //modifier of only owner
   modifier onlyOwner() {
       require(msg.sender == owner, "Only owner");
       _;
   }
}

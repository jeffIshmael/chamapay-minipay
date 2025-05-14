/**
 * @title ChamaPay - Circular Savings  management smart contract
 * @author Jeff Muchiri
 */

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract ChamaPay is Ownable,ReentrancyGuard {

    uint public totalChamas;
    uint public totalPayments;

    IERC20 public cUSDToken;
    address public aiAgent;
       
    // address public cUSDTokenAddress = // 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1 //testnet
    // 0x765DE816845861e75A25fCA122bb6898B8B1282a //mainnet

    // 0x456a3D042C0DbD3db53D5489e98dFb038553B0d0  //cKES
    constructor() Ownable(msg.sender) {

    aiAgent = msg.sender;
    cUSDToken = IERC20(0x765DE816845861e75A25fCA122bb6898B8B1282a);
    
    }

    struct Chama {
        uint chamaId;
        uint amount;
        uint startDate;
        uint payDate;
        uint duration;
        uint maxMembers;
        uint cycle; //disbursements
        uint round; // whole rotation(everyone has gotten)
        address admin;       
        address[] members;
        address[] payoutOrder;//order on how the payment is done
        mapping(address => uint) balances;
        mapping(address => bool) hasSent;
        mapping(address => uint) lockedAmounts; // New mapping to track locked amounts
        bool isPublic;
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

    event ChamaRegistered(uint indexed id,  uint amount, uint duration, uint maxMembers, uint startDate,bool _isPublic,  address indexed admin);
    event CashDeposited(uint indexed chamaId, address indexed receiver, uint amount);
    event FundsDisbursed(uint indexed chamaId, address indexed recipient, uint amount);
    event RefundIssued(uint indexed chamaId, address indexed member, uint amount);
    event amountWithdrawn( address indexed _address, uint amount);
    event MemberAdded(uint indexed _chamaId , address indexed   _address);
    event PayoutOrderSet(uint indexed _chamaId, address [] indexed _payoutOrder);
    event MemberRemoved(uint indexed _chamaId, address indexed _member);
    event ChamaDeleted(uint indexed _chamaId);
    event PayOutProcessed( address indexed _receiver, uint _amount);
    event WithdrawalRecorded(uint indexed _chamaId, address indexed _receiver, uint  _amount);
    event RefundUpdated( uint indexed _chamaId);
    event aiAgentSet(address indexed _aiAgent);

   
   // Register a new chama
    function registerChama(
        uint _amount, 
        uint _duration, 
        uint _startDate, 
        uint _maxMembers, 
        bool _isPublic ) public {
        require(_startDate >= block.timestamp, "Start date must be in the future.");
        require(_duration > 0, "Duration must be greater than 0.");
        require(_amount > 0, "Amount must be greater than 0.");

        Chama storage newChama = chamas.push();
        newChama.chamaId = totalChamas;
        newChama.amount = _amount;
        newChama.startDate = _startDate;
        newChama.duration = _duration;
        newChama.maxMembers = _maxMembers;
        newChama.payDate = _startDate + _duration;
        newChama.admin = msg.sender;
        newChama.members.push(msg.sender);
        newChama.payoutOrder.push(msg.sender);
        newChama.cycle = 1;
        newChama.round = 1;
        newChama.balances[msg.sender] = 0;
        newChama.hasSent[msg.sender] = false;
        newChama.isPublic = _isPublic;

        // Add locked amount only if chama is public
        if (_isPublic) {
            newChama.lockedAmounts[msg.sender] = _amount;
        }

        totalChamas++;

        emit ChamaRegistered(
            totalChamas - 1, 
            _amount,
            _maxMembers, 
            _duration, 
            _startDate, 
            _isPublic,  
            msg.sender
        );
    }
    
    
    // Add a member to the chama(Private)
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

    //add a member to a public Chama
     function addPublicMember(uint _chamaId) public {
        require(_chamaId < chamas.length, "The chamaId does not exist");
        Chama storage chama = chamas[_chamaId];
        require(chama.isPublic, "This is not a public chama.");
        require(chama.members.length < chama.maxMembers, "Chama already has max members");
        require(!isMember(_chamaId, msg.sender), "Already a member of the chama.");
        chama.members.push(msg.sender);
        chama.lockedAmounts[msg.sender] += chama.amount;
        if(block.timestamp > chama.startDate){
            chama.payoutOrder.push(msg.sender);
        }
        emit MemberAdded(_chamaId, msg.sender);
    }

    // Deposit cash to a chama
    function depositCash(uint _chamaId, uint _amount) public onlyMembers(_chamaId) nonReentrant {
        // Ensure the chama exists
        require(_chamaId < totalChamas, "Chama does not exist");

        Chama storage chama = chamas[_chamaId];
        

        // Update balance for the sender
        chama.balances[msg.sender] += _amount;

        // Mark the user as having sent their payment if they have reached the required amount
        if (chama.balances[msg.sender] >= chama.amount) {
            chama.hasSent[msg.sender] = true;
        }
        // Emit an event for the cash deposit
        emit CashDeposited(_chamaId, msg.sender, _amount);
    }

    // Check if all members have contributed
    function allMembersContributed(uint _chamaId) internal view returns (bool) {
        Chama storage chama = chamas[_chamaId];
        
        for (uint i = 0; i < chama.members.length; i++) {
            uint membersBalance = chama.balances[chama.members[i]] + chama.lockedAmounts[chama.members[i]];
            if (membersBalance < chama.amount) {
                return false;
            }
        }
        return true;
    }

    // Disburse funds to a member
    function disburse(uint _chamaId) internal nonReentrant {
        Chama storage chama = chamas[_chamaId];        
        require(chama.payoutOrder.length > 0, "Payout order is empty");
        address recipient = chama.members[chama.cycle % chama.payoutOrder.length];
        uint totalPay = chama.amount * chama.members.length;

        // Calculate total available funds: sum of all balances + sum of all lockedAmounts (for public chamas)
        uint totalAvailable = 0;
        for (uint i = 0; i < chama.payoutOrder.length; i++) {
            address member = chama.payoutOrder[i];
            totalAvailable += chama.balances[member];
            if(chama.isPublic){
                totalAvailable += chama.lockedAmounts[member];
            }
        }
        require(totalAvailable >= totalPay, "Not enough funds to disburse");

        // Ensure each member has contributed their amount, using lockedAmounts if necessary (only for public chamas)
        for (uint i = 0; i < chama.payoutOrder.length; i++) {
            address member = chama.payoutOrder[i];
            if (chama.balances[member] < chama.amount) {
                require(chama.isPublic, "Member has not contributed and it's a private chama.");
                uint deficit = chama.amount - chama.balances[member];
                require(chama.lockedAmounts[member] >= deficit, "Member does not have enough locked funds.");

                // Deduct from lockedAmounts and add to balances
                chama.lockedAmounts[member] -= deficit;
                chama.balances[member] += deficit;
                chama.hasSent[member] = true;
            }
        }

        // Now, all members have contributed their required amount
        // Proceed to transfer totalPay to recipient
        processPayout(recipient, totalPay);

        // Record the withdrawal
        recordWithdrawal(_chamaId, recipient, totalPay);

        // Reset payment status for the next round and deduct balances
        for (uint i = 0; i < chama.payoutOrder.length; i++) {
            chama.hasSent[chama.payoutOrder[i]] = false;
            chama.balances[chama.payoutOrder[i]] -= chama.amount;
        }

        // Check if we have completed a rotation
        if (chama.cycle + 1 > chama.payoutOrder.length) {
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

            // Record the withdrawal
            recordWithdrawal(_chamaId, _member, refundAmount);
            chama.balances[_member] = 0; // Reset the balance
        }

        // If public, refund the locked amount
        if(chama.isPublic){
            uint lockedAmount = chama.lockedAmounts[_member];
            if (lockedAmount > 0) {
                processPayout(_member, lockedAmount);
                recordWithdrawal(_chamaId, _member, lockedAmount);
                chama.lockedAmounts[_member] = 0;
                emit RefundIssued(_chamaId, _member, lockedAmount);
            }
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
    function processPayout(address _receiver, uint _amount) internal nonReentrant {
        require(cUSDToken.balanceOf(address(this)) >= _amount, "Contract does not have enough cKES");
        require(cUSDToken.transfer(_receiver, _amount), "Transfer failed");
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
    function checkPayDate(uint[] memory chamaIds) public onlyAiAgent nonReentrant {
        for (uint i = 0; i < chamaIds.length; i++) {
            uint chamaId = chamaIds[i];
            require(chamaId < totalChamas, "Chama does not exist");

            Chama storage chama = chamas[chamaId];

            // Check if the current time has passed the pay date
            if (block.timestamp >= chama.payDate) {
                if (allMembersContributed(chamaId)) {
                    disburse(chamaId); // Disburse funds if everyone has paid
                } else {
                    refund(chamaId); // Refund if not everyone has paid
                }
            }
        }
    }

   // Function to check the balance of a specific address in a specific chama
    function getBalance(uint _chamaId, address _member) public view returns (uint[] memory) {
        require(_chamaId < totalChamas, "Chama does not exist");
        
        Chama storage chama = chamas[_chamaId];
        
        // Create a fixed-size array with 2 elements
        uint [] memory balances = new uint[](2);
        
        // Assign the balance and locked amounts
        balances[0] = chama.balances[_member];
        balances[1] = chama.lockedAmounts[_member];
        
        // Return the balance and locked amounts
        return balances;
    }

    // Set the shuffled payout order (off-chain generated)
    function setPayoutOrder(uint _chamaId, address[] memory _payoutOrder) public onlyAiAgent {
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
    uint,
    uint,
    uint,
    uint,
    uint,
    address,
    address[] memory,
    bool
    ) {
        Chama storage chama = chamas[_chamaId];
        return (chama.chamaId,chama.amount,chama.startDate,chama.duration,chama.round,chama.cycle,chama.admin,chama.members,chama.isPublic);
    }

    //function to get a chama payout order
    function getChamaPayoutOrder(uint _chamaId) public view returns (address[] memory) {
        Chama storage chama = chamas[_chamaId];
        return chama.payoutOrder;
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
   function emergencyWithdraw(address _address) public onlyOwner {
       cUSDToken.transfer(_address, cUSDToken.balanceOf(address(this)));
       emit amountWithdrawn(_address, cUSDToken.balanceOf(address(this)));
   }

   //function to set aiAgent
   function setAiAgent(address _aiAgent) public onlyOwner {
       aiAgent = _aiAgent;
       emit aiAgentSet(_aiAgent);
   }
   
   //modifier for only Admin
   modifier onlyAdmin(uint _chamaId){
    require(chamas[_chamaId].admin == msg.sender, "only the admin can add a member");
    _;
   }

   //modifier for aiAgent
   modifier onlyAiAgent() {
       require(msg.sender == aiAgent, "Only aiAgent");
       _;
   }
}

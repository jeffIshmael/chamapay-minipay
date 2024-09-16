// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;


import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ChamaPay {

    uint public totalChamas;
    uint public totalPayments;

    IERC20 public cKESToken;
    address public owner;
       
    // address public cKESTokenAddress = // 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1 //testnet
    // 0x765DE816845861e75A25fCA122bb6898B8B1282a //mainnet

    // 0x456a3D042C0DbD3db53D5489e98dFb038553B0d0  //cKES
    constructor() {

    owner = msg.sender;
    cKESToken = IERC20(0x456a3D042C0DbD3db53D5489e98dFb038553B0d0);
    
    }

    struct Chama {
        uint chamaId;
        string name;
        uint amount;
        uint deadline;
        uint duration;
        uint totalMembers;
        uint lastRotation;
        address admin;       
        address[] members;
        mapping(address => uint) balances;
        mapping(address => bool) hasSent;
    }

    Chama[] public chamas;

    struct Payment {
        uint id;
        uint chamaId;
        address applicant;
        uint amount;
        uint timestamp;
    }

    Payment[] public payments;

    event ChamaRegistered(uint id, string name, uint amount, uint duration, uint deadline, uint totalMembers, address admin);
    event CashDeposited(uint chamaId, address applicant, uint amount);
    event FundsDisbursed(uint chamaId, address recipient, uint amount);
    event RefundIssued(uint chamaId, address member, uint amount);
    event amountWithdrawn( address _address, uint amount);

    // Register a new chama
    function registerChama(string memory _name, uint _amount, uint _duration, uint _deadline, uint _totalMembers) public {
        // require(_totalMembers == _members.length, "Total members count doesn't match the provided members.");
        Chama storage newChama = chamas.push();
        newChama.chamaId = totalChamas;
        newChama.name = _name;
        newChama.amount = _amount;
        newChama.deadline = _deadline;
        newChama.duration = _duration;
        newChama.totalMembers = _totalMembers;
        newChama.admin = msg.sender;
        newChama.members.push(msg.sender);
        newChama.lastRotation = block.timestamp;

        totalChamas++;

        emit ChamaRegistered(totalChamas - 1, _name, _amount, _duration, _deadline, _totalMembers, msg.sender);
    }

    // Deposit cash to a chama
    function depositCash(uint _chamaId, uint _amount) public payable onlyMembers(_chamaId) {
       
        Chama storage chama = chamas[_chamaId];
        chama.balances[msg.sender] += _amount;
        chama.hasSent[msg.sender] = true;

        payments.push(Payment({
            id: totalPayments,
            chamaId: _chamaId,
            applicant: msg.sender,
            amount: _amount,
            timestamp: block.timestamp
        }));
        totalPayments++;

        emit CashDeposited(_chamaId, msg.sender, msg.value);

        // If all members have contributed, disburse funds
        if (allMembersContributed(_chamaId)) {
            disburse(_chamaId);
        }
      
    }

    // Check if all members have contributed
    function allMembersContributed(uint _chamaId) internal view returns (bool) {
        Chama storage chama = chamas[_chamaId];
        for (uint i = 0; i < chama.members.length; i++) {
            if (!chama.hasSent[chama.members[i]]) {
                return false;
            }
        }
        return true;
    }

    // Disburse funds to a member
    function disburse(uint _chamaId) internal {
        Chama storage chama = chamas[_chamaId];

        if (block.timestamp <= chama.deadline + (chama.duration / 30)) {
            
            address recipient = chama.members[chama.lastRotation % chama.totalMembers];
            uint totalPay = chama.amount * chama.totalMembers;

            // Transfer the funds using cKESToken
            require(cKESToken.transfer(recipient, totalPay), "Transfer failed");

            emit FundsDisbursed(_chamaId, recipient, totalPay);

            // Reset payment status for the next round
            for (uint i = 0; i < chama.members.length; i++) {
                chama.hasSent[chama.members[i]] = false;
            }

            chama.lastRotation++;
        } else {
            refund(_chamaId);
        }
    }

    //function to get next to receive
    function getNextRecipient(uint _chamaId) public view returns (address) {
    Chama storage chama = chamas[_chamaId];
    uint nextRotationIndex = chama.lastRotation % chama.totalMembers;
    return chama.members[nextRotationIndex];
    }

    // Refund the cash if the deadline passes and not all members have paid
    function refund(uint _chamaId) internal {
        Chama storage chama = chamas[_chamaId];

        for (uint i = 0; i < chama.members.length; i++) {
            address member = chama.members[i];
            uint refundAmount = chama.balances[member];
            if (refundAmount > 0) {
                require(cKESToken.transfer(member, refundAmount), "Transfer failed");
                chama.balances[member] = 0;

                emit RefundIssued(_chamaId, member, refundAmount);
            }
        }
        // Reset payment status for the next round
        for (uint i = 0; i < chama.members.length; i++) {
            chama.hasSent[chama.members[i]] = false;
        }
    }

    // Get all payments
    function getPayments() public view returns (Payment[] memory) {
        return payments;
    }

    // Get all chamas
   function getChamas() public view returns (
    uint[] memory, 
    string[] memory, 
    uint[] memory, 
    uint[] memory, 
    uint[] memory, 
    uint[] memory, 
    address[] memory
) {
    uint[] memory chamaIds = new uint[](chamas.length);
    string[] memory names = new string[](chamas.length);
    uint[] memory amounts = new uint[](chamas.length);
    uint[] memory deadlines = new uint[](chamas.length);
    uint[] memory durations = new uint[](chamas.length);
    uint[] memory totalMembers = new uint[](chamas.length);
    address[] memory admins = new address[](chamas.length);

    for (uint i = 0; i < chamas.length; i++) {
        Chama storage chama = chamas[i];
        chamaIds[i] = chama.chamaId;
        names[i] = chama.name;
        amounts[i] = chama.amount;
        deadlines[i] = chama.deadline;
        durations[i] = chama.duration;
        totalMembers[i] = chama.totalMembers;
        admins[i] = chama.admin;
    }

    return (chamaIds, names, amounts, deadlines, durations, totalMembers, admins);
}


    //function to get chama by id
   function getChama(uint _chamaId) public view returns (
    uint,
    string memory,
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
        chama.name,
        chama.amount,
        chama.deadline,
        chama.duration,
        chama.totalMembers,
        chama.lastRotation,
        chama.admin,
        chama.members
    );
}

    // Modifier to restrict function access to members of a chama
    modifier onlyMembers(uint _chamaId) {
        bool isMember = false;
        for (uint i = 0; i < chamas[_chamaId].members.length; i++) {
            if (msg.sender == chamas[_chamaId].members[i]) {
                isMember = true;
                break;
            }
        }
        require(isMember, "You are not a member of the chama.");
        _;
    }

       //function to withdraw from the contract
   function withdraw(address _address) public onlyOwner {
       cKESToken.transfer(_address, cKESToken.balanceOf(address(this)));
       emit amountWithdrawn(_address, cKESToken.balanceOf(address(this)));
   }

   //modifier of only owner
   modifier onlyOwner() {
       require(msg.sender == owner, "Only owner");
       _;
   }
}

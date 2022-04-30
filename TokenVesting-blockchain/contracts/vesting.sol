// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "./vestingToken.sol";

/**
 * @title TokenVesting
 */
contract TokenVesting {

    address public owner;//contract owner / admin
    VestingToken Token;
    uint256 public totalTokenSupply =100000000; //100 million initial supply

    struct VestingSchedule{
        uint id; //vestingSchedule id

        // beneficiary of tokens after they are released
        address  beneficiary;

        // start time of the vesting period
        uint256  start;

        // duration of the vesting period in seconds
        uint256  duration;
        
        // total amount of tokens to be released at the end of the vesting
        uint256 totalAmount;

        // amount of tokens withdrawn
        uint256  amountWithdrawn;

        //time interval after which some token are released periodically untill all tokens are released (in seconds)
        // example per minute, per hour .... 
        uint256 releaseInterval;
    }
    //count of total vesting schedules
    uint public totalVestingSchedules=0;
    // vesting schedule ID => vesting schedule 
    mapping(uint256=> VestingSchedule) public allVestingSchedules;
    // user address => vesting schedule id
    mapping(address => uint256) public holdersVestingScheduleId;

    constructor(address tokenAddress) {
        owner = msg.sender;
        Token = VestingToken(tokenAddress);
    }

    modifier isOwner(){
        require(msg.sender==owner , "access denied");
        _;
    }

    /**
    * @notice Creates a new vesting schedule for a beneficiary.
    * @param _beneficiary address of the beneficiary to whom vested tokens are transferred
    * @param _amount total amount of token to be released
    */
    function _createVestingSchedule(address _beneficiary, uint256 _amount) internal{
        totalVestingSchedules++;
        uint vestingId = totalVestingSchedules;
        holdersVestingScheduleId[_beneficiary] = vestingId;
        allVestingSchedules[vestingId] = VestingSchedule(
            vestingId,
            _beneficiary,
            block.timestamp,
            31560000, //seconds in 12 months
            _amount,
            0,
            60// 1 minute
        );
    }
    /**
    * @notice Creates a new vesting schedule for a group of beneficiaries.
    * @param _beneficiaries addresses of the beneficiaries to whom vested tokens are transferred
    */
    function createVestingSchedule(address[] memory _beneficiaries) public isOwner(){
        uint totalBeneficiaries = _beneficiaries.length;
        uint256 amountPerBeneficiary = totalTokenSupply/totalBeneficiaries;
        for(uint i=0;i<totalBeneficiaries;i++){
            _createVestingSchedule(_beneficiaries[i],amountPerBeneficiary);
        }
    }


/**
    * @dev returns the amount of tokens released
    * @param account address of the beneficiary
    */
    function releasedTokensAmount(address account)public view returns (uint256){
        uint256 vestingScheduleId = holdersVestingScheduleId[account];
        require(vestingScheduleId>0 ,"address doesn't have vesting schdeule");
        VestingSchedule memory vestingSchedule = allVestingSchedules[vestingScheduleId];
        uint256 secondsPassed = block.timestamp - vestingSchedule.start; 
        if(secondsPassed > vestingSchedule.duration)secondsPassed =vestingSchedule.duration;
        uint256 totalIntervals = vestingSchedule.duration/vestingSchedule.releaseInterval;
        uint256 intervalsPassed = secondsPassed/vestingSchedule.releaseInterval;
        uint256 releasedAmount = ((vestingSchedule.totalAmount*(10**18))/totalIntervals)*intervalsPassed;
        return releasedAmount;
    }

    /**
    * @notice withdraw/claim tokens from released tokens
    * @param account address of the beneficiary
    * @param amount  number of tokens withdrawn
    * require number of tokens withdrawn should be less than or equal to available released tokens
    */
    function withdrawTokens(address account, uint256 amount) public {
        uint256 vestingScheduleId = holdersVestingScheduleId[account];
        require(vestingScheduleId>0 ,"address doesn't have vesting schdeule");
        VestingSchedule storage vestingSchedule = allVestingSchedules[vestingScheduleId];
        uint256 releasedTokens = releasedTokensAmount(account);
        uint256 availableTokens = releasedTokens - vestingSchedule.amountWithdrawn;
        require(amount <= availableTokens,"insufficient token balance");
        Token.transfer(account,amount);
        vestingSchedule.amountWithdrawn += amount;
    }


    /**
    * @dev Returns the address of  contract owner/admin.
    */
    function getOwnerAddress()public view returns(address){
        return owner;
    }


    /**
    * @dev Returns the total amount of tokens.
    */
    function getTotalTokenSupply()public view returns(uint256){
        return totalTokenSupply;
    }
    /**
    * @dev Returns the total number of vesting schedules created.
    */
    function getTotalVestingSchedules() public view returns(uint256){
        return totalVestingSchedules;
    }
    /**
    * @dev Returns the vesting schedule Id of a particular user.
    */
    function getHoldersVestingScheduleId(address account) public view returns(uint256){
        return holdersVestingScheduleId[account];
    }

    // @dev Returns vesting schedule with ID -> id
    function getVestingSchedule(uint256 id) public view returns(VestingSchedule memory){
        return allVestingSchedules[id];
    }

    // @returns user token balance
      function userBalance()public view returns(uint){
        return Token.balanceOf(msg.sender);
    }   
    // @returns amount of token held by contract
      function contractBalance()public view returns(uint){
        return Token.balanceOf(address(this));
    }   
}
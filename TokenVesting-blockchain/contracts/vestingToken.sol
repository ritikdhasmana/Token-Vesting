// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract VestingToken is ERC20{
    
    address public owner;
    constructor() ERC20("Vesting Token", "VST"){
         owner = msg.sender;
    }
     modifier isOwner(){
        require(msg.sender==owner , "access denied");
        _;
    }
    function mintTokens(address account, uint256 amount)public isOwner(){
        _mint(account, amount);
    }
  
}
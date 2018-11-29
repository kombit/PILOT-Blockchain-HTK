pragma solidity ^0.4.0;

import "./ICommonState.sol";

interface IHasSubcontracts {
    function countSubcontracts() external constant returns(uint);
}
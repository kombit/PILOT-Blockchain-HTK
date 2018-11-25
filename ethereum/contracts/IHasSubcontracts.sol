pragma solidity ^0.4.0;

import "./ICommonState.sol";

interface IHasSubcontracts {
    function add(ICommonState _subcontract) external;

    function countSubcontracts() external constant returns(uint);
    function getSubcontract(uint _index) external constant returns(address);
}
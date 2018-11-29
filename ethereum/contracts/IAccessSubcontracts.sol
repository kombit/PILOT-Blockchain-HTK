pragma solidity ^0.4.0;

import "./ICommonState.sol";

interface IAccessSubcontracts {
    function add(ICommonState _subcontract) external;
    function getSubcontract(uint _index) external constant returns(address);
}
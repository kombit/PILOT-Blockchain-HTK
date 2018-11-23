pragma solidity ^0.4.0;

import "./ICommonState.sol";

interface IHasSubcontracts {
    function add(ICommonState _subcontract) external;
}
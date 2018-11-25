pragma solidity ^0.4.0;

import './Owned.sol';

interface ICommonState {
    function getState() external constant returns(uint);
}

pragma solidity ^0.4.0;

import "./Owned.sol";
import "./IHasSubcontracts.sol";
import "./CommonStateNames.sol";
import "./ICommonState.sol";
import "./IAccessSubcontracts.sol";
import "./KCommon.sol";

contract K4 is ICommonState, IHasSubcontracts, IAccessSubcontracts, CommonStateNames, KCommon, Owned {

    uint public state = DRAFT; // defaults to draft

    uint[] public payments;

    // the address where the price payments goes to
    address public serviceProvider;

    ICommonState subcontract;
    uint numSubcontracts;

    constructor(address _owner, address _serviceProvider)
        Owned(_owner) public {
        serviceProvider = _serviceProvider;
        payments = new uint[](3);

        payments[0] = 5000 * KR;  // jan 2018
        payments[1] = 5000 * KR;  // feb 2018
        payments[2] = 5000 * KR;  // mar 2018
    }

    modifier serviceProviderOnly {
        require(msg.sender == serviceProvider, "sender was not serviceProvider");
        _;
    }

    // state
    function activate() external ownerOnly {
        state = ACTIVE;
    }

    function step(uint _month) external {
        require(state == ACTIVE, "current state was not ACTIVE");

        uint amountForMonth = payments[_month];
        require(amountForMonth > 0, "Nothing to do, amount was 0");
        require(amountForMonth <= this.balance, "The contract itself is out of money");

        // our subcontract must not be terminated
        require(subcontract.getState() == ACTIVE, "K4's subcontract should have been ACTIVE");

        serviceProvider.transfer(amountForMonth);
        payments[_month] = 0;

        if (_month == 2) {
            state = EXPIRED;
        }
    }

    // the contract can hold ether
    function () payable {
    }

    // IAccessSubcontracts
    function add(ICommonState _subcontract) external { // serviceProviderOnly ?
        numSubcontracts = 1;
        subcontract = ICommonState(_subcontract);
    }

    function getSubcontract(uint _index) external constant returns(address) {
        return subcontract;
    }

    // implementation of ICommonState
    function getState() external constant returns(uint) {
        return state;
    }

    // IHasSubcontracts
    function countSubcontracts() external constant returns(uint) {
        return numSubcontracts;
    }

}

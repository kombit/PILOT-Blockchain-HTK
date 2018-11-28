pragma solidity ^0.4.0;

import "./Owned.sol";
import "./IHasSubcontracts.sol";
import "./CommonStateNames.sol";
import "./ICommonState.sol";
import "./IAccessSubcontracts.sol";

contract K4 is ICommonState, IHasSubcontracts, IAccessSubcontracts, CommonStateNames, Owned {

    uint public state = DRAFT; // defaults to draft

    uint[] payments;

    // the address where the price payments goes to
    address public serviceProvider;

    ICommonState subcontract;
    uint numSubcontracts;

    constructor(address _owner, address _serviceProvider)
        Owned(_owner) public {
        serviceProvider = _serviceProvider;
        payments = new uint[](3);

        payments[0] = 5000 szabo;  // jan 2018
        payments[1] = 5000 szabo;  // feb 2018
        payments[2] = 5000 szabo;  // mar 2018
    }

    modifier serviceProviderOnly {
        require(msg.sender == serviceProvider);
        _;
    }

    // state
    function activate() external ownerOnly {
        require(state == DRAFT, "current state was not DRAFT");
        state = ACTIVE;
    }

    function step(uint _month) external {
        require(state == ACTIVE, "current state was not ACTIVE");

        uint amountForMonth = payments[_month];
        require(amountForMonth > 0, "Nothing to do, amount was 0");
        require(amountForMonth <= this.balance, "The contract itself is out of money");

        // our subcontract must not be terminated
        require(subcontract.getState() == ACTIVE);

        serviceProvider.transfer(amountForMonth);
        payments[_month] = 0;
    }

    // the contract can hold ether
    function () payable {
    }

    // IAccessSubcontracts
    function add(ICommonState _subcontract) serviceProviderOnly external {
        require(state != TERMINATED, "state must not be TERMINATED when adding subcontract");
        numSubcontracts = 1;
        subcontract = ICommonState(_subcontract);
    }

    function getSubcontract(uint _index) external constant returns(address) {
        return address(subcontract);
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

pragma solidity ^0.4.0;

import "./Owned.sol";
import "./IHasSubcontracts.sol";
import "./CommonStateNames.sol";
import "./ICommonState.sol";
import "./IAccessSubcontracts.sol";

contract K1 is ICommonState, IHasSubcontracts, IAccessSubcontracts, CommonStateNames, Owned {

    uint public state = DRAFT; // defaults to draft

    // the price
    uint public constant totalPrice = 180000 ether;

    // the address where the price payments goes to
    address public serviceProvider;

    // address of the sub contract
    ICommonState public subcontract;
    // count number of sub contracts (here we only have 1, see also the `add` method)
    uint public numSubcontracts;

    modifier serviceProviderOnly {
        require(msg.sender == serviceProvider);
        _;
    }

    constructor(address _owner, address _serviceProvider)
        Owned(_owner) public {
        serviceProvider = _serviceProvider;
    }

    // state

    function activate() external ownerOnly {
        require(state == DRAFT, "current state was not DRAFT");
        state = ACTIVE;
    }

    function terminate() external ownerOnly {
        require(state == ACTIVE, "current state was not DRAFT");
        require(serviceProvider.balance >= totalPrice, "serviceProvider.balance did not hold the required amount");
        require(subcontract.getState() == TERMINATED, "subcontract was not terminated");
        state = TERMINATED;
    }

    // implementation of ICommonState
    function getState() external constant returns(uint) {
        return state;
    }

    // IHasSubcontracts
    function countSubcontracts() external constant returns(uint) {
        return numSubcontracts;
    }

    // IAccessSubcontracts
    function add(ICommonState _subcontract) serviceProviderOnly external {
        require(state != TERMINATED, "state must not be TERMINATED when adding subcontract");
        numSubcontracts = 1;
        subcontract = ICommonState(_subcontract);
    }

    function getSubcontract(uint _index) external constant returns(address) {
        return subcontract;
    }
}

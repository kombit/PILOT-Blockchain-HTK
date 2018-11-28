pragma solidity ^0.4.0;

import "./Owned.sol";
import "./IHasSubcontracts.sol";
import "./CommonStateNames.sol";
import "./ICommonState.sol";
import "./IAccessSubcontracts.sol";

contract K1 is ICommonState, IHasSubcontracts, IAccessSubcontracts, CommonStateNames, Owned {

    uint public state = DRAFT; // defaults to draft

    uint[] public payments;

    // the address where the price payments goes to
    address public serviceProvider;

    //
    bytes32[] public status;

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
        payments = new uint[](12);

        payments[0] = 60000 szabo;  // jan 2018
        payments[1] = 60000 szabo;  // feb 2018
        payments[2] = 60000 szabo;  // mar 2018
        payments[3] = 60000 szabo;  // apr 2018
        payments[4] = 60000 szabo;  // may 2018
        payments[5] = 60000 szabo;  // jun 2018
        payments[6] = 60000 szabo;  // jul 2018
        payments[7] = 60000 szabo;  // aug 2018
        payments[8] = 60000 szabo;  // sep 2018
        payments[9] = 60000 szabo;  // oct 2018
        payments[10] = 60000 szabo; // nov 2018
        payments[11] = 60000 szabo; // dec 2018

        status = new bytes32[](12);
    }

    // state

    function activate() external ownerOnly {
        require(state == DRAFT, "current state was not DRAFT");
        state = ACTIVE;
    }

    function step(uint _month) external {
//        require(state == ACTIVE, "current state was not ACTIVE");
        uint amountForMonth = payments[_month]; // lookup getRelativeMonth()
        require(amountForMonth > 0, "Nothing to do, amount was 0");
        require(amountForMonth <= this.balance, "The contract itself is out of money");

        uint rest = (_month+1) % 3;
        if (rest == 0) {
            bytes32 b = status[_month];
            require(b != 0x0, "status was not set");
        }

        serviceProvider.transfer(amountForMonth);
        payments[_month] = 0;
    }

    function setStatus(uint month, bytes32 _status) external {
        // enable this if its required that setStatus is NOT overwriting existing status
//        bytes32 b = status[month];
//        require(b == 0x0, "status was already set");
        status[month] = _status;
    }

    // the contract can hold ether
    function () payable {
    }

    // implementation of ICommonState
    function getState() external constant returns(uint) {
        return state;
    }

    // IHasSubcontracts
    function countSubcontracts() external constant returns(uint) {
        return 0;
    }
}

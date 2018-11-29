pragma solidity ^0.4.0;

import "./Owned.sol";
import "./IHasSubcontracts.sol";
import "./CommonStateNames.sol";
import "./ICommonState.sol";
import "./IAccessSubcontracts.sol";

contract K2 is ICommonState, IHasSubcontracts, CommonStateNames, Owned {

    uint public state = DRAFT; // defaults to draft

    uint[] public payments;

    // the address where the price payments goes to
    address public serviceProvider;

    modifier serviceProviderOnly {
        require(msg.sender == serviceProvider);
        _;
    }

    constructor(address _owner, address _serviceProvider)
        Owned(_owner) public {
        serviceProvider = _serviceProvider;
        payments = new uint[](12);

        payments[0] =  30000 szabo;  // jan 2018
        payments[1] =  30000 szabo;  // feb 2018
        payments[2] =  30000 szabo;  // mar 2018
        payments[3] =  30000 szabo;  // apr 2018
        payments[4] =  30000 szabo;  // may 2018
        payments[5] =  30000 szabo;  // jun 2018
        payments[6] =  30000 szabo;  // jul 2018
        payments[7] =  30000 szabo;  // aug 2018
        payments[8] =  30000 szabo;  // sep 2018
        payments[9] =  30000 szabo;  // oct 2018
        payments[10] = 30000 szabo; // nov 2018
        payments[11] = 30000 szabo; // dec 2018
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
        serviceProvider.transfer(amountForMonth);
        payments[_month] = 0;
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

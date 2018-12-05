pragma solidity ^0.4.0;

import "./Owned.sol";
import "./IHasSubcontracts.sol";
import "./CommonStateNames.sol";
import "./ICommonState.sol";
import "./IAccessSubcontracts.sol";
import "./KCommon.sol";

contract K3 is ICommonState, IHasSubcontracts, CommonStateNames, KCommon, Owned {

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
        payments = new uint[](3);

        payments[0] = 5000 * KR;  // jan 2018
        payments[1] = 5000 * KR;  // feb 2018
        payments[2] = 5000 * KR;  // mar 2018
    }

    // the contract can hold ether
    function () payable {
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


    // implementation of ICommonState
    function getState() external constant returns(uint) {
        return state;
    }

    // IHasSubcontracts
    function countSubcontracts() external constant returns(uint) {
        return 0;
    }

}

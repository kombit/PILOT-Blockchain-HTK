pragma solidity ^0.4.0;

import "./Owned.sol";
import "./IHasSubcontracts.sol";
import "./CommonStateNames.sol";
import "./ICommonState.sol";
import "./IAccessSubcontracts.sol";
import "./KCommon.sol";

contract K1 is ICommonState, IHasSubcontracts, CommonStateNames, KCommon, Owned {

    uint public state = DRAFT; // defaults to draft

    uint[] public payments;

    // the address where the price payments goes to
    address public serviceProvider;

    //
    bytes32[] public status;


    constructor(address _owner, address _serviceProvider)
        Owned(_owner) public {
        serviceProvider = _serviceProvider;
        payments = new uint[](12);

        payments[0] = 60000 * KR;  // jan 2018
        payments[1] = 60000 * KR;  // feb 2018
        payments[2] = 60000 * KR;  // mar 2018
        payments[3] = 60000 * KR;  // apr 2018
        payments[4] = 60000 * KR;  // may 2018
        payments[5] = 60000 * KR;  // jun 2018
        payments[6] = 60000 * KR;  // jul 2018
        payments[7] = 60000 * KR;  // aug 2018
        payments[8] = 60000 * KR;  // sep 2018
        payments[9] = 60000 * KR;  // oct 2018
        payments[10] = 60000 * KR; // nov 2018
        payments[11] = 60000 * KR; // dec 2018

        status = new bytes32[](12);
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

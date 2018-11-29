"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const visual_helpers_js_1 = require("../visual-helpers.js");
const chalk_1 = require("chalk");
const path_1 = require("path");
const Web3 = require('web3');
const { yellow, red, blue, greenBright } = chalk_1.default;
async function info(contractAddress, networkId) {
    console.log(`CONTRACT STATE INFORMATION`);
    console.log('');
    const web3 = new Web3('http://localhost:7545');
    await recursiveWalk(contractAddress, web3, `Contract`)
        .catch(err => console.error(red(err)));
}
exports.info = info;
var StateNames;
(function (StateNames) {
    StateNames[StateNames["draft"] = 1] = "draft";
    StateNames[StateNames["active"] = 2] = "active";
    StateNames[StateNames["terminated"] = 3] = "terminated";
})(StateNames || (StateNames = {}));
const stateColours = new Map();
stateColours.set(StateNames.draft, yellow);
stateColours.set(StateNames.active, greenBright);
stateColours.set(StateNames.terminated, blue);
const colour = (state) => {
    const func = stateColours.get(state);
    if (func)
        return func(StateNames[state]);
    else
        return StateNames[state];
};
async function recursiveWalk(address, web3, displayName, level = 0) {
    if (address === '0x0000000000000000000000000000000000000000')
        return Promise.reject('address was 0x');
    const hasSubcontracts = new web3.eth.Contract(require(path_1.join(__dirname, '../../ethereum/build/contracts/IHasSubcontracts.json')).abi, address);
    const accessSubcontracts = new web3.eth.Contract(require(path_1.join(__dirname, '../../ethereum/build/contracts/IAccessSubcontracts.json')).abi, address);
    const commonState = new web3.eth.Contract(require(path_1.join(__dirname, '../../ethereum/build/contracts/ICommonState.json')).abi, address);
    const k4 = new web3.eth.Contract(require(path_1.join(__dirname, '../../ethereum/build/contracts/K4.json')).abi, address);
    const [contractState, numSubContracts] = await Promise.all([
        commonState.methods.getState().call(),
        hasSubcontracts.methods.countSubcontracts().call(),
    ]);
    const list = await getValuesFromArray(k4.methods.payments);
    console.log(`${displayName} (at ${visual_helpers_js_1.shorten(address)})`);
    console.log(`  State is ${colour(parseInt(contractState.toString(), 10))}`);
    console.log(`  Has ${numSubContracts} subcontracts`);
    console.log('');
    if (list.length > 0) {
        console.log(`  Interval payments (${list.length > 0 ? list.length + " total" : "none"})`);
        list
            .map(val => web3.utils.fromWei(val, 'szabo'))
            .map(val => (val.toString() === '0') ? `Paid (${val.toString() + " pending"})` : val.toString() + " pending")
            .forEach(v => console.log(`    ${v}`));
    }
    for (let i = 0; i < numSubContracts; i++) {
        const subContractAddress = await accessSubcontracts.methods.getSubcontract(i.toString()).call();
        await recursiveWalk(subContractAddress, web3, `${' '.repeat(2 + level * 2)}- subcontract`, level + 1);
    }
}
exports.recursiveWalk = recursiveWalk;
async function getValuesFromArray(method) {
    const list = [];
    let i = 0;
    // here we don't know the length of the array, so we'll just try call(i) until the VM throws an exception
    while (i < 100) {
        let val;
        try {
            val = await method(i).call();
            i++;
            list.push(val);
        }
        catch (e) {
            // will produce VM Exception
            break;
        }
    }
    return list;
}

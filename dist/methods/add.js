"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const assert_1 = require("assert");
const web3_js_1 = require("../web3.js");
async function add(address, subcontractAddress, from, test) {
    const web3 = web3_js_1.getWeb3();
    const instance = new web3.eth.Contract(require(path_1.join(__dirname, '../../ethereum/build/contracts/IAccessSubcontracts.json')).abi, address, {
        from: from,
    });
    instance.methods.add(subcontractAddress)
        .send()
        .then(() => {
        if (test) {
            instance.methods.getSubcontract("0").call().then(val => assert_1.strictEqual(val.toString().toLowerCase(), subcontractAddress.toLowerCase(), "Was not set correct"));
        }
    });
}
exports.add = add;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("../web3.js");
const path_1 = require("path");
async function step(contractName, n, address, from) {
    const web3 = web3_js_1.getWeb3();
    const instance = new web3.eth.Contract(require(path_1.join(__dirname, `../../ethereum/build/contracts/${contractName}.json`)).abi, address, { from: from });
    await instance.methods.step(n).send();
}
exports.step = step;

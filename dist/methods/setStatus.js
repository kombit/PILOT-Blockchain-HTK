"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("../web3.js");
const path_1 = require("path");
async function setStatus(month, status, address, from) {
    const web3 = web3_js_1.getWeb3();
    const instance = new web3.eth.Contract(require(path_1.join(__dirname, `../../ethereum/build/contracts/K1.json`)).abi, address, { from: from });
    await instance.methods.setStatus(month, status).send();
}
exports.setStatus = setStatus;

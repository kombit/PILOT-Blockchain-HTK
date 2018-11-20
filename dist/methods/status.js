"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const files_js_1 = require("../files.js");
const info_js_1 = require("./info.js");
const Web3 = require('web3');
async function status() {
    const allContracts = await files_js_1.getDeployedContracts2();
    const web3 = new Web3('http://localhost:7545');
    allContracts
        .forEach(contract => {
        info_js_1.recursiveWalk(contract.address, web3, `Contract`);
    });
}
exports.status = status;

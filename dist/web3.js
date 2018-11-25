"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Web3 = require('web3');
exports.httpLocalhost7545 = 'http://localhost:7545';
function getWeb3() {
    const web3 = new Web3(exports.httpLocalhost7545);
    return web3;
}
exports.getWeb3 = getWeb3;
async function getAccount(index = 0) {
    const web3 = getWeb3();
    const accounts = await web3.eth.getAccounts();
    console.assert(accounts.length > 0, "Unexpected; 0 accounts retrieved via getAccounts()");
    return accounts[index];
}
exports.getAccount = getAccount;

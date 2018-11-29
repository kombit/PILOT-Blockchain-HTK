"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("../web3.js");
async function fund(address, amount, fromIndex = 0) {
    const web3 = web3_js_1.getWeb3();
    const from = await web3_js_1.getAccount(fromIndex);
    await web3.eth.sendTransaction({
        from: from,
        to: address,
        value: web3.utils.toWei(amount, 'ether'),
    });
}
exports.fund = fund;

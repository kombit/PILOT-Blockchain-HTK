"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sigTools_js_1 = require("../sigTools.js");
const Web3 = require('web3');
async function sign(destMethod, destAddress, multisigAddress, from, seedPhrase, password) {
    const web3 = new Web3('http://localhost:7545');
    return new Promise(resolve => {
        const multisigInstance = new web3.eth.Contract(require('../ethereum/build/contracts/SimpleMultiSig').abi, multisigAddress, {
            from,
        });
        multisigInstance.methods.nonce().call().then(async (nonce) => {
            console.assert(destAddress, 'missing dest address');
            const [ks, keyFromPw] = await sigTools_js_1.retrieveKeystore(seedPhrase, password);
            ks.generateNewAddress(keyFromPw, 1);
            const [signingAddr] = ks.getAddresses();
            let s;
            s = sigTools_js_1.createSig(ks, signingAddr, keyFromPw, multisigAddress, nonce, destMethod, destAddress);
            resolve(s);
        });
    });
}
exports.sign = sign;

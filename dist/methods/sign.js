"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sigTools_js_1 = require("../sigTools.js");
const path_1 = require("path");
const web3_js_1 = require("../web3.js");
function sign(destMethod, destAddress, multisigAddress, seedPhrase, password) {
    const web3 = web3_js_1.getWeb3();
    const multisigInstance = new web3.eth.Contract(require(path_1.join(__dirname, '../../ethereum/build/contracts/SimpleMultiSig')).abi, multisigAddress, {});
    const p = new Promise(resolve => {
        multisigInstance.methods.nonce().call().then(async (nonce) => {
            const [ks, keyFromPw] = await sigTools_js_1.retrieveKeystore(seedPhrase, password);
            ks.generateNewAddress(keyFromPw, 1);
            const [signingAddr] = ks.getAddresses();
            let s;
            s = sigTools_js_1.createSig(ks, signingAddr, keyFromPw, multisigAddress, nonce, destMethod, destAddress);
            resolve(s);
        });
    });
    return p;
}
exports.sign = sign;

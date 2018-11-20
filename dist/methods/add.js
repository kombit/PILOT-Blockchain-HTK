"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Web3 = require('web3');
async function add(address, subcontractAddress, from) {
    const web3 = new Web3('http://localhost:7545');
    const instance = new web3.eth.Contract(require('../../ethereum/build/contracts/IHasSubcontracts.json').abi, address, {
        from: from,
    });
    instance.methods.add(subcontractAddress)
        .send()
        .then(() => {
        const instance = new web3.eth.Contract(require('../../ethereum/build/contracts/ICommonState.json').abi, address, {});
        instance.methods.getSubcontract(0).call().then(val => {
            console.assert(val.toString().toLowerCase() === subcontractAddress.toLowerCase(), "Was not set correct");
        });
    });
}
exports.add = add;

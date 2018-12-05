"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("assert");
const path_1 = require("path");
const minimist = require("minimist");
const Web3 = require('web3');
const argv = minimist(process.argv.slice(2), {
    default: {},
});
const network = argv.network || process.env.NETWORK || 'development'; // defaults to 'development'
const truffleConfig = require(path_1.join(__dirname, '../ethereum/truffle.js'));
assert_1.ok(truffleConfig.networks[network], `missing configuration for '${network}'`);
exports.networkId = truffleConfig.networks[network].network_id;
assert_1.ok(exports.networkId, "missing network ID");
let provider;
if (network === 'development') {
    const { host, port } = truffleConfig.networks[network];
    provider = `http://${host}:${port}`;
}
else {
    provider = truffleConfig.networks[network].provider();
    assert_1.ok(typeof provider === "object", "should be provider obj here");
}
assert_1.ok(provider, "missing some setup for provider");
function stop() {
    try {
        if (provider.engine) {
            // console.log("Attempting to stop provider engine gracefully")
            provider.engine.stop();
        }
    }
    catch (e) {
        console.log(e.message);
    }
}
exports.stop = stop;
function getWeb3() {
    const web3 = new Web3(provider);
    return web3;
}
exports.getWeb3 = getWeb3;
async function getAccount(index = 0) {
    const web3 = getWeb3();
    const accounts = await web3.eth.getAccounts();
    assert_1.ok(accounts.length > 0, "Unexpected; 0 accounts retrieved via getAccounts()");
    return accounts[index];
}
exports.getAccount = getAccount;

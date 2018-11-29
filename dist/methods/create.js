"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const chalk_1 = require("chalk");
const assert_1 = require("assert");
const Web3 = require('web3');
const { greenBright } = chalk_1.default;
async function create(template, from, constructorArguments = []) {
    constructorArguments.forEach(val => {
        assert_1.ok(val !== undefined, "can't pass undefined to constructor");
        assert_1.ok(val !== null, "can't pass null to constructor");
    });
    const web3 = new Web3('http://localhost:7545');
    const artifact = require(path_1.join(__dirname, `../../ethereum/build/contracts/${template}.json`));
    assert_1.ok(artifact.bytecode && artifact.bytecode !== "0x", `Something is off with the byte code: ` + artifact.bytecode);
    const metaInstance = new web3.eth.Contract(artifact.abi);
    const deployed = await metaInstance
        .deploy({
        data: artifact.bytecode,
        arguments: constructorArguments,
    })
        .send({
        from: from,
        gas: 2000000,
    });
    console.info(`  deployed ${greenBright(template)} to ${greenBright(deployed.options.address)}`);
    return deployed;
}
exports.create = create;

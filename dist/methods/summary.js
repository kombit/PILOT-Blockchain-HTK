"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const files_js_1 = require("../files.js");
const visual_helpers_js_1 = require("../visual-helpers.js");
const chalk_1 = require("chalk");
const { grey } = chalk_1.default;
async function summary() {
    const allContracts = await files_js_1.getDeployedContracts2();
    console.log(`SHOWING ALL CONTRACTS (${allContracts.length})`);
    console.log();
    allContracts
        .forEach(contract => {
        console.log(`Contract ${visual_helpers_js_1.shorten(contract.address)} deployed at ${contract.created.substr(0, 10)} - ${contract.created_note}`);
        console.log(grey(`  node cli.js info ${contract.address}`));
    });
}
exports.summary = summary;

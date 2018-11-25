"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const klaw = require("klaw");
const fs_extra_1 = require("fs-extra");
const opts = {
    filter: filePath => path_1.extname(filePath) === ".json",
};
const dataDirPath = path_1.join(__dirname, '../data');
const filePath = path_1.join(dataDirPath, '/deployed.json');
const contractsPath = path_1.join(__dirname, "../ethereum/build/contracts/");
async function getContractArtifacts() {
    return new Promise(resolve => {
        const reads = [];
        klaw(contractsPath, opts)
            .on('data', item => {
            if (!item.stats.isDirectory()) {
                reads.push(fs_extra_1.readJSON(item.path));
            }
        })
            .on('end', async () => {
            const items = await Promise.all(reads);
            const filtered = items
                .filter(artf => artf.contractName !== 'Migrations') // filter out Truffle migration tracking
                .filter(artf => artf.bytecode !== '0x'); // filter out interfaces
            resolve(filtered);
        });
    });
}
exports.getContractArtifacts = getContractArtifacts;
async function addDeployedContract(name, address, msg) {
    const table = await getDeployedContracts2();
    table.push({
        address: address,
        contractName: name,
        created: new Date().toJSON(),
        created_note: msg,
    });
    await fs_extra_1.writeJSON(filePath, table, {
        spaces: 2 // JSON formatting
    });
}
exports.addDeployedContract = addDeployedContract;
async function getDeployedContracts2() {
    try {
        await fs_extra_1.ensureDir(dataDirPath);
        await fs_extra_1.ensureFile(filePath);
        const map = await fs_extra_1.readJSON(filePath);
        if (Array.isArray(map)) {
            return map;
        }
        else if (map && typeof map === "object") {
            return Object.values(map);
        }
    }
    catch (e) {
    }
    return [];
}
exports.getDeployedContracts2 = getDeployedContracts2;

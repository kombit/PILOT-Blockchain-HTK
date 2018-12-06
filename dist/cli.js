"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const minimist = require("minimist");
const chalk_1 = require("chalk");
const sigTools_js_1 = require("./sigTools.js");
const eth_lightwallet_1 = require("eth-lightwallet");
const files_js_1 = require("./files.js");
const create_js_1 = require("./methods/create.js");
const info_js_1 = require("./methods/info.js");
const summary_js_1 = require("./methods/summary.js");
const sign_js_1 = require("./methods/sign.js");
const add_js_1 = require("./methods/add.js");
const web3_js_1 = require("./web3.js");
const fund_js_1 = require("./methods/fund.js");
const step_js_1 = require("./methods/step.js");
const assert_1 = require("assert");
const activate_js_1 = require("./methods/activate.js");
const setStatus_js_1 = require("./methods/setStatus.js");
const { red, grey } = chalk_1.default;
if (parseInt(process.version.replace('v', ''), 10) < 10) {
    console.log("Please install node v10");
    process.exit();
}
const argv = minimist(process.argv.slice(2), {
    string: [
        '_',
        'a', 'address',
        'm', 'multisig',
        'n', 'number', 'month',
        'amount',
        'd', 'dest',
        'u',
        'sp', 's',
        'subcontract',
        'o', 'owners',
        'from', 'f'
    ],
});
// console.debug(argv)
var Cmd;
(function (Cmd) {
    Cmd[Cmd["help"] = 0] = "help";
    Cmd[Cmd["step"] = 1] = "step";
    Cmd[Cmd["pay"] = 2] = "pay";
    Cmd[Cmd["activate"] = 3] = "activate";
    Cmd[Cmd["fund"] = 4] = "fund";
    Cmd[Cmd["info"] = 5] = "info";
    Cmd[Cmd["status"] = 6] = "status";
    Cmd[Cmd["summary"] = 7] = "summary";
    Cmd[Cmd["add"] = 8] = "add";
    Cmd[Cmd["list"] = 9] = "list";
    Cmd[Cmd["ls"] = 10] = "ls";
    Cmd[Cmd["register"] = 11] = "register";
    Cmd[Cmd["create"] = 12] = "create";
    Cmd[Cmd["mk"] = 13] = "mk";
    Cmd[Cmd["template"] = 14] = "template";
    Cmd[Cmd["templates"] = 15] = "templates";
    Cmd[Cmd["tpl"] = 16] = "tpl";
    Cmd[Cmd["sign"] = 17] = "sign";
    Cmd[Cmd["send"] = 18] = "send";
    Cmd[Cmd["set-status"] = 19] = "set-status";
})(Cmd || (Cmd = {}));
const subcommand = Cmd[argv._[0]];
async function _help() {
    console.log('USAGE');
    console.log(`  node cli.js <subcommand>`);
    console.log('');
    console.log('SUBCOMMANDS');
    console.log('  ' + Object.keys(Cmd)
        .filter(v => /^\d+$/.test(v) === false)
        .filter(value => [
        // blacklisted subcommands:
        Cmd[Cmd.help],
        Cmd[Cmd.activate],
        Cmd[Cmd.step],
        // aliases:
        Cmd[Cmd.mk],
        Cmd[Cmd.ls],
        Cmd[Cmd.tpl], Cmd[Cmd.templates],
        Cmd[Cmd.status],
    ].includes(value) === false)
        .sort()
        .join(', '));
    console.log('');
    console.log("Try 'node cli.js <subcommand> -h' to learn more about each command");
}
async function _register() {
    if (argv.h) {
        console.log("USAGE");
        console.log("  register");
        return;
    }
    const fundNewAccount = (argv.f !== undefined);
    const newSeed = eth_lightwallet_1.keystore.generateRandomSeed();
    const [ks, keyFromPw] = await sigTools_js_1.retrieveKeystore(newSeed, '');
    ks.generateNewAddress(keyFromPw, 1);
    const [signingAddr] = ks.getAddresses();
    console.log("Address: " + signingAddr);
    console.log("Seed:    " + newSeed);
    if (fundNewAccount) {
        await fund_js_1.fund(signingAddr, '1');
        console.log("  Sent 1 ether to new account.");
    }
}
async function _tx() {
    if (subcommandNoArgs(argv)) {
        console.log("USAGE");
        console.log(`  ${Cmd[Cmd.send]} <sig1> <sig2> --from 0x123 --dest 0x345 --multisig 0x678`);
        console.log("");
        console.log("ARGUMENTS");
        console.log("  two serialized signatures");
        console.log("");
        console.log("OPTIONS");
        console.log("  --method, -m destination method");
        console.log("  --dest, -d destination address");
        console.log("  --from, -f from address");
        console.log("  --multisig, -u multisigAddress address");
        return;
    }
    const destMethod = argv.m || argv.method;
    const destAddress = argv.d || argv.dest;
    const multisigAddress = argv.u || argv.multisig;
    const from = argv.from || argv.f || await web3_js_1.getAccount();
    assert_1.ok(destMethod, "missing dest. method; use --method -m");
    assert_1.ok(destAddress, "missing dest. address; use --dest -d");
    assert_1.ok(multisigAddress, "missing multiSig address; use --multisig -u");
    assert_1.ok(from, "requires from; --from -f");
    const sig1 = JSON.parse(argv._[1]); // {"sigV":28,"sigR":"0x7d223c507acf17887340f364f7cf910ec54dfb2f10e08ce5ddc3d60bf9b221b3","sigS":"0x1bdd9f4ba9afd5466b59010746caf55dd396769a1c8a8c001e3ee693276af1d3"}
    const sig2 = JSON.parse(argv._[2]); // {"sigV":28,"sigR":"0x7d223c507acf17887340f364f7cf910ec54dfb2f10e08ce5ddc3d60bf9b221b3","sigS":"0x1bdd9f4ba9afd5466b59010746caf55dd396769a1c8a8c001e3ee693276af1d3"}
    // validate all input
    new Array(sig1, sig2)
        .forEach((sig, index) => assert_1.ok(sig.sigV && sig.sigR && sig.sigS, index + ": missing V, R or S"));
    try {
        sigTools_js_1.multiSigCall(destMethod, sig1, sig2, destAddress, multisigAddress, from);
    }
    catch (e) {
        if (e.message.includes('order')) {
            sigTools_js_1.multiSigCall(destMethod, sig2, sig1, destAddress, multisigAddress, from);
        }
    }
}
async function _sign() {
    if (subcommandNoArgs(argv)) {
        console.log("USAGE");
        console.log(`  sign --dest 0x345 --method testHest --multisig 0x234 --seed "mnemonic .. words"`);
        console.log("");
        console.log("OPTIONS");
        console.log("  --method, -m destination method");
        console.log("  --dest, -d destination contract");
        console.log("  --multisig, -u address of the multisig contract");
        console.log("  --seed, -s seed words to signing HD wallet");
        return;
    }
    const seedPhrase = argv.s || argv.seed;
    const password = argv.p || argv.password || '';
    const multisigAddress = argv.u || argv.multisig;
    const destMethod = argv.m || argv.method;
    const destAddress = argv.d || argv.dest;
    assert_1.ok(seedPhrase, "need seed phrase --seed -s");
    assert_1.ok(multisigAddress, "missing --multisig -u");
    assert_1.ok(!!password || password === '', "need password");
    assert_1.ok(destMethod, "missing dest. method --method -m");
    assert_1.ok(destAddress, "missing dest. address --dest -d");
    const sig = await sign_js_1.sign(destMethod, destAddress, multisigAddress, seedPhrase, password);
    console.log('Signature');
    console.log(JSON.stringify(sig));
    console.log('');
    console.log(`  Use it with node send like so:`);
    console.log(`  ${Cmd[Cmd.send]} '${JSON.stringify(sig)}' <other sig> --method ${destMethod} --dest ${destAddress} --multisig ${multisigAddress}`);
}
async function _add() {
    if (subcommandNoArgs(argv)) {
        console.log("USAGE");
        console.log("  add --subcontract 0x123 --address 0x456 --from -0x321");
        console.log("");
        console.log("OPTIONS");
        console.log("  --address -a the address of the main contract");
        console.log("  --from -f the sender");
        console.log("  --subcontract -s the address of the subcontract to be added");
        return;
    }
    // const mainContractAddress:string = argv.a || argv.address
    const subcontractAddress = argv.s || argv.subcontract;
    const targetAddress = argv.a || argv.address;
    const from = argv.f || argv.from || await web3_js_1.getAccount();
    const networkId = argv.networkId || '1337';
    assert_1.ok(networkId);
    assert_1.ok(subcontractAddress, "need sub contract address; --subcontract -s");
    assert_1.ok(targetAddress, "requires address; --address -a");
    assert_1.ok(from, "requires from; --from -f");
    await add_js_1.add(targetAddress, subcontractAddress, from, !!argv.test);
}
async function _info() {
    if (subcommandNoArgs(argv)) {
        console.log('USAGE');
        console.log('  node cli.js info <address>');
        return;
    }
    const networkId = argv.networkId || '1337';
    const contractAddress = argv.address || argv.a || argv._[1];
    assert_1.ok(contractAddress, "please provide an address");
    await info_js_1.info(contractAddress, networkId);
}
async function _summary() {
    if (argv.h) {
        console.log('USAGE');
        console.log('  node cli.js er der styr på det?');
        return;
    }
    // const networkId = argv.networkId || '1337'
    // await info(contractAddress, networkId)
    await summary_js_1.summary();
}
async function _list() {
    if (argv.h) {
        console.log("USAGE");
        console.log("  node cli.js list");
        return;
    }
    const networkId = argv.networkId || '1337';
    const allContracts = await files_js_1.getDeployedContracts2();
    console.log(`CONTRACTS OVERVIEW`);
    console.log("");
    allContracts
        .map(contract => ([
        `  ${contract.contractName}`,
        `    ${contract.address}`,
        `    ${contract.created.substr(0, 10)} ${contract.created_note}`,
    ]))
        .forEach(vm => Object.values(vm).forEach(val => console.log(val)));
}
async function _create() {
    async function displayHelp() {
        console.log("USAGE");
        console.log(`  node.cli create --from 0x123 --message "a test contract" <contract name> <constructor arguments>`);
        console.log(``);
        console.log(`OPTIONS`);
        console.log(`  --from, -f is the sender address`);
        console.log(`  --message, -m is the administrative note about the contract`);
        console.log(`  --owners to set up a multisig contract as owner (requires the contracts to implement Owned)`);
        console.log(`  --json to deserialize every constructor argument as JSON (useful if sending a list)`);
        console.log(`  --owner-index, -i the zero indexed position of the 'owner' in constructor arguments. Default 0 (first)`);
        console.log('');
        console.log('Possible contract templates:');
        const tpls = await files_js_1.getContractArtifacts();
        tpls.filter(tpl => tpl.contractName !== 'Owned')
            .filter(((value, index) => index < 100))
            .forEach(tpl => console.log('  ' + tpl.contractName));
        console.log('');
        console.log(`SEE MORE about the available templates using: node cli.js ${Cmd[Cmd.template]}`);
    }
    if (subcommandNoArgs(argv)) {
        return displayHelp();
    }
    const tpl = argv._[1];
    assert_1.ok(tpl, "Need a template name");
    const constructorArgs = argv._.slice(2) || [];
    if (tpl && Object.keys(argv).length === 1 && Object.keys(argv._).length === 2) {
        const allArtifacts = await files_js_1.getContractArtifacts();
        const cTpl = allArtifacts.find(cTpl => cTpl.contractName === tpl);
        if (!cTpl) {
            return displayHelp();
        }
        console.log(`${tpl} need the following arguments: `);
        console.log(`  ` +
            (Array.isArray(cTpl.abi) ? cTpl.abi : [])
                .filter(method => method.type === "constructor")
                .map(theConstructor => (Array.isArray(theConstructor.inputs) ? theConstructor.inputs : [])
                .map(input => input.type + " " + input.name)
                .join(', ')));
        console.log(`Deploy ${cTpl.contractName} like so:`);
        console.log(`  node cli.js create ${cTpl.contractName} ${(Array.isArray(cTpl.abi) ? cTpl.abi : [])
            .filter(method => method.type === "constructor")
            .map(theConstructor => (Array.isArray(theConstructor.inputs) ? theConstructor.inputs : [])
            .map(input => `<${input.type}>`)
            .join(' '))}`);
        return;
    }
    const msg = argv.m || argv.message || "";
    const from = argv.f || argv.from || await web3_js_1.getAccount();
    const ownerIndex = argv.i || argv.ownerIndex || 0;
    assert_1.ok(typeof msg === 'string', `Please leave a note for the contract deployment using --message, -m`);
    assert_1.ok(from, "requires from; --from -f");
    assert_1.ok(typeof ownerIndex === 'number', "missing owner index");
    if (argv.json) {
        constructorArgs.forEach(((value, index, array) => {
            array[index] = JSON.parse(value);
        }));
    }
    const multiSigOwners = argv.owners;
    let multiSigContractDeployed;
    assert_1.ok(multiSigOwners === undefined || (Array.isArray(multiSigOwners) && multiSigOwners.length > 1), "specifying multisig with --owners requires at least 2 owners");
    if (Array.isArray(multiSigOwners)) {
        console.log("Deploying multisig contract for " + multiSigOwners.length + " owners ...");
        multiSigOwners.sort(); // important! see SimpleMultiSig.sol
        multiSigContractDeployed = await create_js_1.create('SimpleMultiSig', from, [multiSigOwners.length, multiSigOwners]);
        constructorArgs[ownerIndex] = multiSigContractDeployed.options.address;
        console.log('');
    }
    console.log(constructorArgs.length > 0 ? `Constructor arguments in applied order (${constructorArgs.length}):` : 'No constructor arguments.');
    constructorArgs
        .map(value => Array.isArray(value) ? JSON.stringify(value) : value + '')
        .forEach(value => console.log('  ' + value));
    const contract = await create_js_1.create(tpl, from, constructorArgs);
    if (!argv.n) {
        await files_js_1.addDeployedContract(tpl, contract.options.address, msg);
    }
    if (multiSigContractDeployed && !argv.n) {
        const msg = `Multisig contract owning ${contract.options.address}`;
        await files_js_1.addDeployedContract('SimpleMultiSig', multiSigContractDeployed.options.address, msg);
    }
}
async function _template() {
    const tpls = await files_js_1.getContractArtifacts();
    console.log(`AVAILABLE CONTRACT TEMPLATES`);
    console.log(``);
    tpls.forEach(tpl => {
        console.log('  ' + tpl.contractName);
        console.log('    ' +
            (Array.isArray(tpl.abi) ? tpl.abi : [])
                .filter(method => method.type === "constructor")
                .map(theConstructor => (Array.isArray(theConstructor.inputs) ? theConstructor.inputs : [])
                .map(input => input.type + " " + input.name)
                .join(', ')));
        console.log(grey(`    node cli.js create ${tpl.contractName} ${(Array.isArray(tpl.abi) ? tpl.abi : [])
            .filter(method => method.type === "constructor")
            .map(theConstructor => (Array.isArray(theConstructor.inputs) ? theConstructor.inputs : [])
            .map(input => `<${input.type}>`)
            .join(' '))}`));
    });
}
async function _fund() {
    if (subcommandNoArgs(argv)) {
        console.log("USAGE ");
        console.log("  fund --address <address> --amount <amount>");
        console.log("");
        return;
    }
    const address = argv.address || argv.a || argv._[1];
    const amount = argv.amount || argv.m;
    assert_1.ok(amount, 'missing amount (ether); --amount, -m');
    assert_1.ok(address, 'missing address; --address, -a');
    assert_1.ok(address.substr(0, 2) === '0x', 'something is off with address');
    await fund_js_1.fund(address, amount);
    console.log("Transaction sent! Be sure to check for confirmations.");
}
async function _step() {
    if (subcommandNoArgs(argv)) {
        console.log('USAGE');
        console.log('  node cli.js step --address <contract address> --number <step number>');
        console.log('');
        return;
    }
    const address = argv.address || argv.a;
    const number = (argv.n || argv.number) + '';
    const from = argv.f || argv.from || await web3_js_1.getAccount();
    assert_1.ok(address, 'missing address; --address, -a');
    assert_1.ok(number, "missing step number; --number, -n");
    assert_1.ok(from, "missing from; --from, -f");
    await step_js_1.step(number, address, from);
}
async function _activate() {
    if (subcommandNoArgs(argv)) {
        console.log('USAGE');
        console.log('  node cli.js activate --address <contract address>');
        console.log('');
        return;
    }
    const address = argv.address || argv.a || argv._[1];
    const from = argv.f || argv.from || await web3_js_1.getAccount();
    assert_1.ok(address, 'missing address; --address, -a');
    assert_1.ok(from, "missing from; --from, -f");
    await activate_js_1.activate(address, from);
}
async function _setStatus() {
    if (subcommandNoArgs(argv)) {
        console.log('USAGE');
        console.log('  node cli.js set-status --status 0x --number 0 --address <contract address>');
        console.log('');
        return;
    }
    const address = argv.address || argv.a;
    const month = argv.month || argv.n || argv.number;
    const status = argv.status || argv.s;
    const from = argv.f || argv.from || await web3_js_1.getAccount();
    const web3 = web3_js_1.getWeb3();
    assert_1.ok(status, 'missing status; --status, -s');
    assert_1.ok(web3.utils.isHex(status), 'status must be hex notation');
    const hexStatus = '0x' + status.replace('0x', '');
    assert_1.ok(web3.utils.isHexStrict(hexStatus), 'status must be hex notation - prefixed with 0x');
    assert_1.ok(address, 'missing address; --address, -a');
    assert_1.ok(from, "missing from; --from, -f");
    assert_1.ok(month, "missing month; --month");
    await setStatus_js_1.setStatus(month, hexStatus, address, from);
}
function subcommandNoArgs(argv) {
    return (argv.h || argv._.length === 1 && Object.values(argv).length === 1);
}
const handlers = new Map();
handlers.set(Cmd.step, _step);
handlers.set(Cmd.pay, _step);
handlers.set(Cmd.activate, _activate);
handlers.set(Cmd.info, _info);
handlers.set(Cmd.status, handlers.get(Cmd.info));
handlers.set(Cmd.summary, _summary);
handlers.set(Cmd.add, _add);
handlers.set(Cmd.send, _tx);
handlers.set(Cmd.help, _help);
handlers.set(Cmd.sign, _sign);
handlers.set(Cmd.register, _register);
handlers.set(Cmd.list, _list);
handlers.set(Cmd.ls, handlers.get(Cmd.list));
handlers.set(Cmd.create, _create);
handlers.set(Cmd.fund, _fund);
handlers.set(Cmd.template, _template);
handlers.set(Cmd.templates, _template);
handlers.set(Cmd.tpl, _template);
handlers.set(Cmd['set-status'], _setStatus);
handlers.set(Cmd.mk, handlers.get(Cmd.create));
const handler = handlers.get(subcommand) || handlers.get(Cmd.help);
assert_1.ok(handler, "should have found handler");
handler()
    .catch(err => console.error(red(err.toString())))
    .finally(() => web3_js_1.stop());

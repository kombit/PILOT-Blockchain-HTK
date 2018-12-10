import minimist = require('minimist')
import chalk from 'chalk'
import { multiSigCall, retrieveKeystore, } from './sigTools.js'
import { keystore } from 'eth-lightwallet'
import { addDeployedContract, getContractArtifacts, getDeployedContracts2, savedContract } from './files.js'
import { create } from './methods/create.js'
import { info, } from './methods/info.js'
import { ParsedArgs } from 'minimist'
import { summary } from './methods/summary.js'
import { sign } from './methods/sign.js'
import { add } from './methods/add.js'
import { getAccount, getWeb3, stop } from './web3.js'
import { fund } from './methods/fund.js'
import { step } from './methods/step.js'
import { ok} from 'assert'
import { activate } from './methods/activate.js'
import { setStatus } from './methods/setStatus.js'

const {red, grey, yellowBright} = chalk

if (parseInt(process.version.replace('v',''),10) < 10) {
  console.log("Please install node v10")
  process.exit()
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
    'status', 's',
    'subcontract',
    'o', 'owners',
    'from', 'f'
  ], // always treat these as strings
})
// console.debug(argv)

enum Cmd {
  help,
  step,
  pay,
  activate,
  fund,
  info, status,
  summary,
  add,
  list, ls,
  register,
  create, mk,
  template, templates, tpl,
  sign,
  send,
  "set-status",
}

const subcommand:Cmd|undefined = Cmd[argv._[0]]

async function _help() {
  console.log('USAGE')
  console.log(`  node cli.js <subcommand>`)
  console.log('')
  console.log('SUBCOMMANDS')
  console.log('  '+ Object.keys(Cmd)
    .filter(v => /^\d+$/.test(v) === false)
    .filter(value => [
      // blacklisted subcommands:
      Cmd[Cmd.help], // this is the help menu itself
      Cmd[Cmd.activate], // for presentation only
      Cmd[Cmd.step], // for presentation only
      // aliases:
      Cmd[Cmd.mk],
      Cmd[Cmd.ls],
      Cmd[Cmd.tpl], Cmd[Cmd.templates],
      Cmd[Cmd.status],
    ].includes(value) === false)
    .sort()
    .join(', ')
  )
  console.log('')
  console.log("Try 'node cli.js <subcommand> -h' to learn more about each command")
}

async function _register () {
  if (argv.h) {
    console.log("USAGE")
    console.log("  register")
    return
  }

  const fundNewAccount = (argv.f !== undefined)

  const newSeed = keystore.generateRandomSeed()
  const [ks, keyFromPw] = await retrieveKeystore(newSeed, '')

  ks.generateNewAddress(keyFromPw, 1)
  const [signingAddr] = ks.getAddresses()
  console.log("Address: "+signingAddr)
  console.log("Seed:    "+newSeed)
  if (fundNewAccount) {
    await fund(signingAddr, '1')
    console.log("  Sent 1 ether to new account.")
  }
}

async function _tx () {
  if (subcommandNoArgs(argv)) {
    console.log("USAGE")
    console.log(`  ${Cmd[Cmd.send]} <sig1> <sig2> --from 0x123 --dest 0x345 --multisig 0x678`)
    console.log("")
    console.log("ARGUMENTS")
    console.log("  two serialized signatures")
    console.log("")
    console.log("OPTIONS")
    console.log("  --method, -m destination method")
    console.log("  --dest, -d destination address")
    console.log("  --from, -f from address")
    console.log("  --multisig, -u multisigAddress address")
    return
  }

  const destMethod:string = argv.m || argv.method
  const destAddress:string = argv.d || argv.dest
  const multisigAddress:string = argv.u || argv.multisig
  const from:string = argv.from || argv.f || await getAccount()

  ok(destMethod, "missing dest. method; use --method -m")
  ok(destAddress, "missing dest. address; use --dest -d")
  ok(multisigAddress, "missing multiSig address; use --multisig -u")
  ok(from, "requires from; --from -f")

  const sig1 = JSON.parse(argv._[1]) // {"sigV":28,"sigR":"0x7d223c507acf17887340f364f7cf910ec54dfb2f10e08ce5ddc3d60bf9b221b3","sigS":"0x1bdd9f4ba9afd5466b59010746caf55dd396769a1c8a8c001e3ee693276af1d3"}
  const sig2 = JSON.parse(argv._[2]) // {"sigV":28,"sigR":"0x7d223c507acf17887340f364f7cf910ec54dfb2f10e08ce5ddc3d60bf9b221b3","sigS":"0x1bdd9f4ba9afd5466b59010746caf55dd396769a1c8a8c001e3ee693276af1d3"}

  // validate all input
  new Array(sig1, sig2)
    .forEach((sig, index) => ok(sig.sigV && sig.sigR && sig.sigS, index +": missing V, R or S"))

  try {
    multiSigCall(destMethod, sig1, sig2, destAddress, multisigAddress, from)
  }
  catch (e) {
    if (e.message.includes('order')) {
      multiSigCall(destMethod, sig2, sig1, destAddress, multisigAddress, from)
    }
  }
}

async function _sign () {
  if (subcommandNoArgs(argv)) {
    console.log("USAGE")
    console.log(`  sign --dest 0x345 --method testHest --multisig 0x234 --seed "mnemonic .. words"`)
    console.log("")
    console.log("OPTIONS")
    console.log("  --method, -m destination method")
    console.log("  --dest, -d destination contract")
    console.log("  --multisig, -u address of the multisig contract")
    console.log("  --seed, -s seed words to signing HD wallet")
    return
  }

  const seedPhrase = argv.s || argv.seed
  const password = argv.p || argv.password || ''
  const multisigAddress = argv.u || argv.multisig
  const destMethod = argv.m || argv.method
  const destAddress = argv.d || argv.dest

  ok(seedPhrase, "need seed phrase --seed -s")
  ok(multisigAddress, "missing --multisig -u")
  ok(!!password || password === '', "need password")
  ok(destMethod, "missing dest. method --method -m")
  ok(destAddress, "missing dest. address --dest -d")

  const sig = await sign(destMethod, destAddress, multisigAddress, seedPhrase, password)
  console.log('Signature')
  console.log(yellowBright( JSON.stringify(sig) ))
  console.log('')
  console.log(`  Use it with node send like so:`)
  console.log(`  node cli.js ${Cmd[Cmd.send]} --method ${destMethod} --dest ${destAddress} --multisig ${multisigAddress} '${JSON.stringify(sig)}' '<other sig>'`)
}

async function _add () {
  if (subcommandNoArgs(argv)) {
    console.log("USAGE")
    console.log("  add --subcontract 0x123 --address 0x456 --from -0x321")
    console.log("")
    console.log("OPTIONS")
    console.log("  --address -a the address of the main contract")
    console.log("  --from -f the sender")
    console.log("  --subcontract -s the address of the subcontract to be added")
    return
  }

  // const mainContractAddress:string = argv.a || argv.address
  const subcontractAddress:string = argv.s || argv.subcontract
  const targetAddress:string = argv.a || argv.address
  const from:string = argv.f || argv.from || await getAccount()

  const networkId = argv.networkId || '1337'
  ok(networkId)
  ok(subcontractAddress, "need sub contract address; --subcontract -s")
  ok(targetAddress, "requires address; --address -a")
  ok(from, "requires from; --from -f")

  await add(targetAddress, subcontractAddress, from, !!argv.test)
}

async function _info () {
  if (subcommandNoArgs(argv)) {
    console.log('USAGE')
    console.log('  node cli.js info <address>')
    return
  }

  const networkId = argv.networkId || '1337'
  const contractAddress:string = argv.address || argv.a || argv._[1]
  ok(contractAddress, "please provide an address")
  await info(contractAddress, networkId)
}

async function _summary() {
  if (argv.h) {
    console.log('USAGE')
    console.log('  node cli.js er der styr på det?')
    return
  }

  // const networkId = argv.networkId || '1337'
  // await info(contractAddress, networkId)
  await summary()
}

async function _list() {
  if (argv.h) {
    console.log("USAGE")
    console.log("  node cli.js list")
    return
  }

  const networkId = argv.networkId || '1337'
  const allContracts:savedContract[] = await getDeployedContracts2()

  console.log(`CONTRACTS OVERVIEW`)
  console.log("")
  allContracts
    .map(contract => ([
      `  ${contract.contractName}`,
      `    ${contract.address}`,
      `    ${contract.created.substr(0, 10)} ${contract.created_note}`,
    ]) )
    .forEach(vm => Object.values(vm).forEach(val => console.log(val) ))
}

async function _create() {
  async function displayHelp() {

    console.log("USAGE")
    console.log(`  node.cli create --from 0x123 --message "a test contract" <contract name> <constructor arguments>`)
    console.log(``)
    console.log(`OPTIONS`)
    console.log(`  --from, -f is the sender address`)
    console.log(`  --message, -m is the administrative note about the contract`)
    console.log(`  --owners to set up a multisig contract as owner (requires the contracts to implement Owned)`)
    console.log(`  --json to deserialize every constructor argument as JSON (useful if sending a list)`)
    console.log(`  --owner-index, -i the zero indexed position of the 'owner' in constructor arguments. Default 0 (first)`)
    console.log('')
    console.log('Possible contract templates:')

    const tpls = await getContractArtifacts()
    tpls.filter(tpl => tpl.contractName !== 'Owned')
      .filter(((value, index) => index < 100))
      .forEach(tpl => console.log('  ' + tpl.contractName))

    console.log('')
    console.log(`SEE MORE about the available templates using: node cli.js ${Cmd[Cmd.template]}`)
  }

  if (subcommandNoArgs(argv)) {
    return displayHelp()
  }

  const tpl = argv._[1]
  ok(tpl, "Need a template name")
  const constructorArgs:any[] = argv._.slice(2) || []

  if (tpl && Object.keys(argv).length === 1 && Object.keys(argv._).length === 2) {
    const allArtifacts = await getContractArtifacts()

    const cTpl = allArtifacts.find(cTpl => cTpl.contractName === tpl)
    if (!cTpl) {
      return displayHelp()
    }

    console.log(`${tpl} need the following arguments: `)

    console.log(`  ` +
      (Array.isArray(cTpl.abi) ? cTpl.abi : [])
        .filter(method => method.type === "constructor")
        .map(theConstructor => (Array.isArray(theConstructor.inputs) ? theConstructor.inputs : [])
          .map(input => input.type + " " + input.name)
          .join(', ')
        )
    )
    console.log(`Deploy ${cTpl.contractName} like so:`)
    console.log(`  node cli.js create ${cTpl.contractName} ${
      (Array.isArray(cTpl.abi) ? cTpl.abi : [])
        .filter(method => method.type === "constructor")
        .map(theConstructor => (Array.isArray(theConstructor.inputs) ? theConstructor.inputs : [])
          .map(input => `<${input.type}>`)
          .join(' ')
        )
      }`)
    return
  }

  const msg = argv.m || argv.message || ""
  const from = argv.f || argv.from || await getAccount()
  const ownerIndex = argv.i || argv.ownerIndex || 0
  ok(typeof msg === 'string', `Please leave a note for the contract deployment using --message, -m`)
  ok(from, "requires from; --from -f")
  ok(typeof ownerIndex === 'number', "missing owner index")


  if (argv.json) {
    constructorArgs.forEach(((value, index, array) => {
      array[index] = JSON.parse(value)
    }))
  }

  const multiSigOwners:undefined|string[] = argv.owners
  let multiSigContractDeployed
  ok(multiSigOwners === undefined || (Array.isArray(multiSigOwners) && multiSigOwners.length > 1), "specifying multisig with --owners requires at least 2 owners")
  if (Array.isArray(multiSigOwners)) {
    console.log("Deploying multisig contract for "+multiSigOwners.length + " owners ...")
    multiSigOwners.sort() // important! see SimpleMultiSig.sol
    multiSigContractDeployed = await create('SimpleMultiSig', from, [multiSigOwners.length, multiSigOwners])
    constructorArgs[ownerIndex] = multiSigContractDeployed.options.address
    console.log('')
  }

  console.log(constructorArgs.length > 0 ? `Constructor arguments in applied order (${constructorArgs.length}):` : 'No constructor arguments.')
  constructorArgs
    .map(value => Array.isArray(value) ? JSON.stringify(value) : value + '')
    .forEach(value => console.log('  ' + value))

  const contract = await create(tpl, from, constructorArgs)
  if (!argv.n) {
    await addDeployedContract(tpl, contract.options.address, msg)
  }

  if (multiSigContractDeployed && !argv.n) {
    const msg = `Multisig contract owning ${contract.options.address}`
    await addDeployedContract('SimpleMultiSig', multiSigContractDeployed.options.address, msg)
  }
}

async function _template () {
  const tpls = await getContractArtifacts()

  console.log(`AVAILABLE CONTRACT TEMPLATES`)
  console.log(``)

  tpls.forEach(tpl => {
    console.log('  ' + tpl.contractName)
    console.log('    ' +
      (Array.isArray(tpl.abi) ? tpl.abi : [])
      .filter(method => method.type === "constructor")
      .map(theConstructor => (Array.isArray(theConstructor.inputs) ? theConstructor.inputs : [])
        .map(input => input.type + " " + input.name)
        .join(', ')
      )
    )
    console.log(grey(`    node cli.js create ${tpl.contractName} ${
      (Array.isArray(tpl.abi) ? tpl.abi : [])
        .filter(method => method.type === "constructor")
        .map(theConstructor => (Array.isArray(theConstructor.inputs) ? theConstructor.inputs : [])
          .map(input => `<${input.type}>`)
          .join(' ')
        )
      }`))
  })
}

async function _fund () {
  if (subcommandNoArgs(argv)) {
    console.log("USAGE ")
    console.log("  fund --address <address> --amount <amount>")
    console.log("")
    return
  }

  const address = argv.address || argv.a || argv._[1]
  const amount = argv.amount || argv.m

  ok(amount, 'missing amount (ether); --amount, -m')
  ok(address, 'missing address; --address, -a')
  ok(address.substr(0,2 ) === '0x', 'something is off with address')

  await fund(address, amount)
  console.log("Transaction sent! Be sure to check for confirmations.")
}

async function _step() {
  if (subcommandNoArgs(argv)) {
    console.log('USAGE')
    console.log('  node cli.js step --address <contract address> --number <step number>')
    console.log('')
    return
  }

  const address:string = argv.address || argv.a || argv._[1]
  const number:string = (argv.n || argv.number) + ''
  const from:string = argv.f || argv.from || await getAccount()

  ok(address, 'missing address; --address, -a')
  ok (number, "missing step number; --number, -n")
  ok(from, "missing from; --from, -f")

  await step(number, address, from)
}

async function _activate() {
  if (subcommandNoArgs(argv)) {
    console.log('USAGE')
    console.log('  node cli.js activate --address <contract address>')
    console.log('')
    return
  }

  const address:string = argv.address || argv.a || argv._[1]
  const from:string = argv.f || argv.from || await getAccount()

  ok(address, 'missing address; --address, -a')
  ok(from, "missing from; --from, -f")

  await activate(address, from)
}

async function _setStatus() {
  if (subcommandNoArgs(argv)) {
    console.log('USAGE')
    console.log('  node cli.js set-status --status 0x --number 0 --address <contract address>')
    console.log('')
    return
  }

  const address:string = argv.address || argv.a
  const month:string = argv.month || argv.n || argv.number
  const status:string = argv.status || argv.s
  const from:string = argv.f || argv.from || await getAccount()

  const web3 = getWeb3()
  ok(status, 'missing status; --status, -s')
  ok(web3.utils.isHex(status), 'status must be hex notation')
  const hexStatus:string = '0x' + status.replace('0x', '')
  ok(web3.utils.isHexStrict(hexStatus), 'status must be hex notation - prefixed with 0x')

  ok(address, 'missing address; --address, -a')
  ok(from, "missing from; --from, -f")
  ok(month, "missing month; --month")

  await setStatus(month, hexStatus, address, from)
}

function subcommandNoArgs(argv:ParsedArgs):boolean {
  return (argv.h || argv._.length === 1 && Object.values(argv).length === 1)
}

// router

interface Handler {
  () : Promise<void>
}
const handlers = new Map<Cmd, Handler>()

handlers.set(Cmd.step, _step)
handlers.set(Cmd.pay, _step)

handlers.set(Cmd.activate, _activate)

handlers.set(Cmd.info, _info)
handlers.set(Cmd.status, handlers.get(Cmd.info) as Handler)

handlers.set(Cmd.summary, _summary)

handlers.set(Cmd.add, _add)
handlers.set(Cmd.send, _tx)
handlers.set(Cmd.help, _help)
handlers.set(Cmd.sign, _sign)

handlers.set(Cmd.register, _register)

handlers.set(Cmd.list, _list)
handlers.set(Cmd.ls, handlers.get(Cmd.list) as Handler)

handlers.set(Cmd.create, _create)
handlers.set(Cmd.fund, _fund)

handlers.set(Cmd.template, _template)
handlers.set(Cmd.templates, _template)
handlers.set(Cmd.tpl, _template)

handlers.set(Cmd['set-status'], _setStatus)

handlers.set(Cmd.mk, handlers.get(Cmd.create) as Handler)

const handler = handlers.get(subcommand as any) || handlers.get(Cmd.help) as Handler
ok(handler, "should have found handler")
handler()
  .catch(err => console.error(red(err.toString())))
  .finally(() => stop())

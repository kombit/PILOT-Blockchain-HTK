import minimist = require('minimist')
import chalk from 'chalk'
import { multiSigCall, retrieveKeystore, } from './sigTools.js'
import { keystore } from 'eth-lightwallet'
import { addDeployedContract, getContractArtifacts, getDeployedContracts2, savedContract } from './files.js'
import { create } from './methods/create.js'
import { info, } from './methods/info.js'
import { ParsedArgs } from 'minimist'
import { status } from './methods/status.js'
import { sign } from './methods/sign.js'
import { add } from './methods/add.js'
import { getAccount } from './web3.js'
import { fund } from './methods/fund.js'

const {red, grey} = chalk

const argv = minimist(process.argv.slice(2), {
  string: [
    '_',
    'a', 'address',
    'm', 'multisig',
    'd', 'dest',
    'u',
    'sp', 's',
    'o', 'owners',
    'from', 'f'
  ], // always treat these as strings
})
// console.debug(argv)

enum Cmd {
  help,
  fund,
  info,
  status, er,
  add,
  list, ls,
  register,
  create, mk,
  template, tpl,
  sign,
  send,
}

const subcommand:Cmd|undefined = Cmd[argv._[0]]



async function _help() {
  console.log('USAGE')
  console.log(`  node cli.js <subcommand>`)
  console.log('')
  console.log('SUBCOMMANDS')
  console.log('  '+ Object.keys(Cmd)
    .filter(v => /^\d+$/.test(v) === false)
    .filter(v => v.length > 2) // remove short names
    .filter(value => [
      Cmd[Cmd.help],
      Cmd[Cmd.tpl],
    ].includes(value) == false) // blacklisted
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

  console.assert(destMethod, "missing dest. method; use --method -m")
  console.assert(destAddress, "missing dest. address; use --dest -d")
  console.assert(multisigAddress, "missing multiSig address; use --multisig -u")
  console.assert(from, "requires from; --from -f")

  const sig1 = JSON.parse(argv._[1]) // {"sigV":28,"sigR":"0x7d223c507acf17887340f364f7cf910ec54dfb2f10e08ce5ddc3d60bf9b221b3","sigS":"0x1bdd9f4ba9afd5466b59010746caf55dd396769a1c8a8c001e3ee693276af1d3"}
  const sig2 = JSON.parse(argv._[2]) // {"sigV":28,"sigR":"0x7d223c507acf17887340f364f7cf910ec54dfb2f10e08ce5ddc3d60bf9b221b3","sigS":"0x1bdd9f4ba9afd5466b59010746caf55dd396769a1c8a8c001e3ee693276af1d3"}

  // validate all input
  new Array(sig1, sig2)
    .forEach((sig, index) => console.assert(sig.sigV && sig.sigR && sig.sigS, index +": missing V, R or S", sig))

  multiSigCall(destMethod, sig1, sig2, destAddress, multisigAddress, from)
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

  console.assert(seedPhrase, "need seed phrase --seed -s")
  console.assert(multisigAddress, "missing --multisig -u")
  console.assert(!!password || password === '', "need password")
  console.assert(destMethod, "missing dest. method --method -m")
  console.assert(destAddress, "missing dest. address --dest -d")

  const sig = await sign(destMethod, destAddress, multisigAddress, seedPhrase, password)
  console.log('Signature')
  console.log(JSON.stringify(sig))
  console.log('')
  console.log(`  Use it with node send like so:`)
  console.log(`  ${Cmd[Cmd.send]} '${JSON.stringify(sig)}' <other sig> --dest ${destAddress} --multisig ${multisigAddress}`)
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
  console.assert(networkId)
  console.assert(subcontractAddress, "need sub contract address; --subcontract -s")
  console.assert(targetAddress, "requires address; --address -a")
  console.assert(from, "requires from; --from -f")

  await add(targetAddress, subcontractAddress, from)
}

async function _info () {
  if (subcommandNoArgs(argv)) {
    console.log('USAGE')
    console.log('  node cli.js info <address>')
    return
  }

  const networkId = argv.networkId || '1337'
  const contractAddress:string = argv._[1]
  console.assert(contractAddress, "please provide an address")
  await info(contractAddress, networkId)
}

async function _status() {
  if (argv.h) {
    console.log('USAGE')
    console.log('  node cli.js er der styr på det?')
    return
  }

  // const networkId = argv.networkId || '1337'
  // await info(contractAddress, networkId)
  await status()
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
  if (subcommandNoArgs(argv)) {

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
    return
  }

  const msg = argv.m || argv.message || argv.msg
  const from = argv.f || argv.from || await getAccount()
  const ownerIndex = argv.i || argv.ownerIndex || 0
  console.assert(msg, `Please leave a note for the contract deployment using --message, -m`)
  console.assert(from, "requires from; --from -f")
  console.assert(typeof ownerIndex === 'number', "missing owner index")

  const tpl = argv._[1]
  console.assert(tpl, "Need a template name")
  const constructorArgs:any[] = argv._.slice(2) || []

  if (argv.json) {
    constructorArgs.forEach(((value, index, array) => {
      array[index] = JSON.parse(value)
    }))
  }

  const multiSigOwners:undefined|string[] = argv.owners
  let multiSigContractDeployed
  console.assert(multiSigOwners === undefined || (Array.isArray(multiSigOwners) && multiSigOwners.length > 1), "specifying multisig with --owners requires at least 2 owners")
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
    console.log(grey(`    create ${tpl.contractName} ${
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
    console.log("  fund <address> <amount>")
    console.log("")
    return
  }

  const address = argv._[1]
  const amount = argv._[2]

  console.assert(amount, 'missing amount (ether)')
  console.assert(address, 'missing address')
  console.assert(address.substr(0,2 ) === '0x', 'something is off with address')

  await fund(address, amount)
  console.log("Transaction sent! Be sure to check for confirmations.")
}

function subcommandNoArgs(argv:ParsedArgs):boolean {
  return (argv.h || argv._.length === 1 && Object.values(argv).length === 1)
}

// router

interface Handler {
  () : Promise<void>
}
const handlers = new Map<Cmd, Handler>()

handlers.set(Cmd.info, _info)

handlers.set(Cmd.status, _status)
handlers.set(Cmd.er, handlers.get(Cmd.status) as Handler)

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
handlers.set(Cmd.tpl, handlers.get(Cmd.template) as Handler)

handlers.set(Cmd.mk, handlers.get(Cmd.create) as Handler)

const handler = handlers.get(subcommand as any) || handlers.get(Cmd.help) as Handler
console.assert(handler, "should have found handler")
handler()
  // .catch(err => console.error(red(err.toString())))
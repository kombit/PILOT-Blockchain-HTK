import { ok } from 'assert'
import { join } from 'path'
import * as minimist from 'minimist'

const Web3 = require('web3')

const argv = minimist(process.argv.slice(2), {
  default: {
    'network': 'development',
  }, // always treat these as strings
})
// console.debug(argv)
const network = argv.network
ok(network, "missing network?")
const truffleConfig = require( join(__dirname, '../ethereum/truffle.js' ))

ok(truffleConfig.networks[network], `missing configuration for '${network}'`)

export const networkId = truffleConfig.networks[network].network_id
ok(networkId, "missing network ID")

const {host, port} = truffleConfig.networks[network]
const protocol = (!host || host.includes('127.0.0.1')) ? 'http:' : 'https:'
const provider = `${protocol}//${host}:${port}`

export function getWeb3 () {
  const web3 = new Web3(provider)
  return web3
}

export async function getAccount(index:number = 0) {
  const web3 = getWeb3()
  const accounts = await web3.eth.getAccounts();
  ok(accounts.length > 0, "Unexpected; 0 accounts retrieved via getAccounts()")
  return accounts[index]
}
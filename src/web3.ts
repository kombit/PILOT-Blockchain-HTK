import { ok } from 'assert'
import { join } from 'path'
import * as minimist from 'minimist'

const Web3 = require('web3')

const argv = minimist(process.argv.slice(2), {
  default: {
  },
})
const network = argv.network || process.env.NETWORK || 'development' // defaults to 'development'

const truffleConfig = require( join(__dirname, '../ethereum/truffle.js' ))
ok(truffleConfig.networks[network], `missing configuration for '${network}'`)

export const networkId = truffleConfig.networks[network].network_id
ok(networkId, "missing network ID")

let provider:any

if (network === 'development') {
  const {host, port} = truffleConfig.networks[network]
  provider = `http://${host}:${port}`
}
else {
  provider = truffleConfig.networks[network].provider()
  ok(typeof provider === "object", "should be provider obj here")
}

ok(provider, "missing some setup for provider")

export function stop() {
  try {
    if (provider.engine) {
      // console.log("Attempting to stop provider engine gracefully")
      provider.engine.stop()
    }
  }
  catch (e) {
    console.log(e.message)
  }
}

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
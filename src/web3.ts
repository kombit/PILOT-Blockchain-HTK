const Web3 = require('web3')

export const httpLocalhost7545 = 'http://localhost:7545'

export function getWeb3 () {
  const web3 = new Web3(httpLocalhost7545)
  return web3
}

export async function getBaseAccount () {
  const web3 = new Web3(httpLocalhost7545)

  const accounts = await web3.eth.getAccounts()

  return [web3, accounts[0]]
}


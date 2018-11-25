const Web3 = require('web3')

export const httpLocalhost7545 = 'http://localhost:7545'

export function getWeb3 () {
  const web3 = new Web3(httpLocalhost7545)
  return web3
}

export async function getAccount(index:number = 0) {
  const web3 = getWeb3()
  const accounts = await web3.eth.getAccounts();
  console.assert(accounts.length > 0, "Unexpected; 0 accounts retrieved via getAccounts()")
  return accounts[index]
}
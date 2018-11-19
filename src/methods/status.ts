import { getDeployedContracts2, savedContract } from '../files.js'
import { recursiveWalk } from './info.js'
const Web3 = require('web3')

export async function status() {

  const allContracts:savedContract[] = await getDeployedContracts2()
  const web3 = new Web3('http://localhost:7545')

  allContracts
    .forEach(contract => {
      recursiveWalk(contract.address, web3, `Contract`)
    })
}
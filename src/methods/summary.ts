import { getDeployedContracts2, savedContract } from '../files.js'
import { shorten } from '../visual-helpers.js'
import chalk from 'chalk'
const {grey} = chalk

export async function summary() {
  const allContracts:savedContract[] = await getDeployedContracts2()
  console.log(`SHOWING ALL CONTRACTS (${allContracts.length})`)
  console.log()
  allContracts
    .forEach(contract => {
      console.log(`Contract ${shorten(contract.address)} deployed at ${contract.created.substr(0,10)} - ${contract.created_note}`)
      console.log(grey(`  node cli.js info ${contract.address}`))
    })
}
import { join } from 'path'
import { ok } from 'assert'

const Web3 = require('web3')

export async function add (address:string, subcontractAddress:string, from:string) {
  const web3 = new Web3('http://localhost:7545')
  const instance:any = new web3.eth.Contract(require(join(__dirname,'../../ethereum/build/contracts/IHasSubcontracts.json')).abi,
    address, {
      from: from,
    })

  instance.methods.add(subcontractAddress)
    .send()
    .then(() => {
      const instance:any = new web3.eth.Contract(require(join(__dirname,'../../ethereum/build/contracts/ICommonState.json')).abi,
        address,
        {})
      instance.methods.getSubcontract(0).call().then(val => {
        ok(val.toString().toLowerCase() === subcontractAddress.toLowerCase(), "Was not set correct")
      })
    })
}
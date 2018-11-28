import { join } from 'path'
import { strictEqual } from 'assert'
import { getWeb3 } from '../web3.js'


export async function add (address:string, subcontractAddress:string, from:string, test?:boolean) {
  const web3 = getWeb3()
  const instance:any = new web3.eth.Contract(require(join(__dirname,'../../ethereum/build/contracts/IAccessSubcontracts.json')).abi,
    address, {
      from: from,
    })

    instance.methods.add(subcontractAddress)
      .send()
      .then(() => {
        if (test) {
          instance.methods.getSubcontract("0").call().then(val =>
            strictEqual(val.toString().toLowerCase(), subcontractAddress.toLowerCase(), "Was not set correct")
          )
        }
      })
}
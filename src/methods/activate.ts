import { getWeb3 } from '../web3.js'
import { join } from "path"

export async function activate (address:string, from:string) {
  const web3 = getWeb3()

  const instance = new web3.eth.Contract(require(join(__dirname, `../../ethereum/build/contracts/K1.json`)).abi,
    address,
    {from:from})

  await instance.methods.activate().send()
}
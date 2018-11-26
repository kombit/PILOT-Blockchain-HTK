import { getAccount, getWeb3 } from '../web3.js'
import BigNumber from 'bignumber.js'


export async function fund (address:string, amount:string|BigNumber, fromIndex:number = 0) {
  const web3 = getWeb3()
  const from:string = await getAccount(fromIndex)

  await web3.eth.sendTransaction({
    from: from,
    to: address,
    value: web3.utils.toWei(amount, 'ether'),
  })
}


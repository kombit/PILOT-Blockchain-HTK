import { createSig, retrieveKeystore, txObj } from '../sigTools.js'
const Web3 = require('web3')

export async function sign(destMethod:string, destAddress:string, multisigAddress:string, from:string, seedPhrase:string, password:string):Promise<txObj> {
  const web3 = new Web3('http://localhost:7545')

  return new Promise<txObj>(resolve => {

    const multisigInstance = new web3.eth.Contract(require('../ethereum/build/contracts/SimpleMultiSig').abi,
      multisigAddress,
      {
        from,
      })

    multisigInstance.methods.nonce().call().then(async nonce => {
      console.assert(destAddress, 'missing dest address')

      const [ks, keyFromPw] = await retrieveKeystore(seedPhrase, password)
      ks.generateNewAddress(keyFromPw, 1)
      const [signingAddr] = ks.getAddresses()
      let s:txObj

      s = createSig(ks, signingAddr, keyFromPw, multisigAddress, nonce, destMethod, destAddress)
      resolve(s)
    })
  })
}
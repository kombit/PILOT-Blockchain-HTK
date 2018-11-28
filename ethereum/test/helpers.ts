import BigNumber from 'bignumber.js'

export async function fundContract(from:string, toAddress:string, etherValue:string = "5", msg:string = "Should have sent and received ether") {
  const wei = web3.toWei(etherValue, 'ether')

  const bal1:BigNumber = web3.eth.getBalance(toAddress)

  await web3.eth.sendTransaction({
    from, to: toAddress, value: wei, //gasPrice: web3.toWei(new BigNumber(0.01), 'ether'),
  })

  const bal2:BigNumber = web3.eth.getBalance(toAddress)

  assert.isTrue(bal2.eq(bal1.plus(wei)), msg)
}

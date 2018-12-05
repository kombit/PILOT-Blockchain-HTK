import { shorten } from '../visual-helpers.js'
import chalk from 'chalk'
import { join } from 'path'
import { getWeb3 } from '../web3.js'

const {yellow, red, blue, greenBright} = chalk

export async function info (contractAddress:string, networkId:string) {
  console.log(`CONTRACT STATE INFORMATION`)
  console.log('')

  const web3 = getWeb3()
  await recursiveWalk(contractAddress, web3,`Contract`)
    .catch(err => console.error(red(err)))
}

enum StateNames {
  draft = 1,
  active = 2,
  terminated = 3,
  expired = 4,
}

const stateColours = new Map<StateNames, Function>()
stateColours.set(StateNames.draft, yellow)
stateColours.set(StateNames.active, greenBright)
stateColours.set(StateNames.expired, blue)
stateColours.set(StateNames.terminated, blue)

const colour = (state:number) => {
  const func = stateColours.get(state)
  if (func)
    return func(StateNames[state])
  else return StateNames[state]
}

export async function recursiveWalk(address:string, web3:any, displayName:string, level:number = 0):Promise<any> {
  if (address === '0x0000000000000000000000000000000000000000') return Promise.reject('address was 0x')

  const hasSubcontracts = new web3.eth.Contract(require( join(__dirname, '../../ethereum/build/contracts/IHasSubcontracts.json')).abi, address)
  const accessSubcontracts = new web3.eth.Contract(require( join(__dirname, '../../ethereum/build/contracts/IAccessSubcontracts.json')).abi, address)
  const commonState = new web3.eth.Contract(require( join(__dirname, '../../ethereum/build/contracts/ICommonState.json')).abi, address)
  const k4 = new web3.eth.Contract(require( join(__dirname, '../../ethereum/build/contracts/K4.json')).abi, address)

  const [contractState, numSubContracts] = await Promise.all([
    <Promise<StateNames>>commonState.methods.getState().call(),
    <Promise<number>>hasSubcontracts.methods.countSubcontracts().call(),
  ])

  const list = await getValuesFromArray(k4.methods.payments)
  console.log(`${displayName} (at ${shorten(address)})`)
  console.log(`  State is ${colour(parseInt(contractState.toString(), 10))}`)
  console.log(`  Has ${numSubContracts} subcontracts`)
  console.log('')
  if (list.length > 0) {
    console.log(`  Interval payments (${list.length > 0 ? list.length + " total" : "none"})`)
    list
      .map(val => web3.utils.fromWei(val, 'szabo'))
      .map(val => (val.toString() === '0') ? `Paid (${val.toString() + " pending"})` : val.toString() + " pending")
      .forEach(v => console.log(`    ${v}`))
  }

  for (let i = 0; i < numSubContracts; i++) {
    const subContractAddress = await <Promise<string>>accessSubcontracts.methods.getSubcontract(i.toString()).call()
    await recursiveWalk(subContractAddress, web3, `${' '.repeat(2+level*2)}- subcontract`, level+1)
  }
}

async function getValuesFromArray(method:Function):Promise<string[]> {
  const list = <any[]>[]
  let i = 0
  // here we don't know the length of the array, so we'll just try call(i) until the VM throws an exception
  while (i < 100) {
    let val
    try {
      val = await method(i).call()
      i++
      list.push(val)
    }
    catch (e) {
      // will produce VM Exception
      break
    }
  }

  return list
}
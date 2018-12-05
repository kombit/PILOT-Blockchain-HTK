-- start en lokal blockchain med ganache, og her bruger vi den første addresse på listen 1. part, 2. part laver vi separat

```text
$ npm run ganache
> signing-flow@1.0.0 ganache /Users/julian/work-git/multisig-contracts
> node node_modules/ganache-cli/build/cli.node.js --port 7545 --networkId 1337 --defaultBalanceEther 1000000

Ganache CLI v6.1.8 (ganache-core: 2.2.1)

Available Accounts
==================
(0) 0x921d335007664f3f207032d7146d9f368c0b5e0b (~1000000 ETH)
(1) 0xe791159bb87b5b60ebd4148d6f278dda05d0ccc0 (~1000000 ETH)
```

-- Vi laver en wallet til den 2. part, 'service provider'

```text
$ node cli.js register
Address: 0x04ce9694f04bd6c9dc6c659fda8d884f70b9e330
Seed:    only wrist upper exhibit biology wonder once question sauce animal celery sibling
```

-- Opret en K1 med 1. og 2. ejer, se at vi bruger --owners 

```text
$ node cli.js create K1 0x921d335007664f3f207032d7146d9f368c0b5e0b 0xe791159bb87b5b60ebd4148d6f278dda05d0ccc0 --owners 0x4641304dbfd8f741588100d36bf64438cebfc762 --owners 0xcf19f57ea7307d52d9a6983c6a8e7665246e8913
Deploying multisig contract for 2 owners ...
  deployed SimpleMultiSig to 0x0C3Ce5D1A664639DD29367667a4698C66071523F

Constructor arguments in applied order (2):
  0x0C3Ce5D1A664639DD29367667a4698C66071523F
  0xe791159bb87b5b60ebd4148d6f278dda05d0ccc0
  deployed K1 to 0x9BD87AcA78b77260B01B7E240F1C393D07Ceb64b
```

-- brug sign hos begge parter

```text
$ node cli.js sign --seed "mnemonic words" --dest 0x654 --method activate --multisig 0x231 --from 0x890
{"sigV": 28, "sigR": "0x789", "sigS": "0x456"}
```

-- brug send til at sende transaktionen til K1

```text
$ node cli.js send '{"sigV":28,"sigR":"0x84b","sigS":"0x6a"}' '{"sigV":28,"sigR":"0xaca","sigS":"0x6b0"}' --from 0x123 --dest 0x345 --multisig 0x678
```    

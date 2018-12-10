-- start en lokal blockchain med ganache, og her bruger vi den første addresse på listen 1. part, 2. part laver vi separat

```text
$ npm run ganache
> signing-flow@1.0.0 ganache /Users/julian/work-git/multisig-contracts
> node node_modules/ganache-cli/build/cli.node.js --port 7545 --networkId 1337 --defaultBalanceEther 1000000

Ganache CLI v6.1.8 (ganache-core: 2.2.1)

Available Accounts
==================
(0) 0xed44a2776ce667dd90af100ae768661e88c0c95d (~1000000 ETH)
(1) 0x47d0bba4a5d1de867f7487ec144226ae59ff37c3 (~1000000 ETH)
... 
HD Wallet
==================
Mnemonic: wolf flash type breeze cute alarm perfect permit lake brand burst trouble
```

-- Vi laver en wallet til den 2. part, 'service provider'

```text
$ node cli.js register
Address: 0x04ce9694f04bd6c9dc6c659fda8d884f70b9e330
Seed:    only wrist upper exhibit biology wonder once question sauce animal celery sibling
```

-- Opret en K1 med 1. og 2. ejer, se at vi bruger --owners, og derfor sætter K1 constructorens owner-argument til 0x

```text
$ node cli.js create K1 0x 0x04ce9694f04bd6c9dc6c659fda8d884f70b9e330 --owners 0xed44a2776ce667dd90af100ae768661e88c0c95d --owners 0x04ce9694f04bd6c9dc6c659fda8d884f70b9e330
Deploying multisig contract for 2 owners ...
  deployed SimpleMultiSig to 0x9133ad26d37ca7446e61Fcf4Ac21EEC9235eAe9b

Constructor arguments in applied order (2):
  0x9133ad26d37ca7446e61Fcf4Ac21EEC9235eAe9b
  0x04ce9694f04bd6c9dc6c659fda8d884f70b9e330
  deployed K1 to 0x7ebD2AcAcB58A6cEA388678D61Efb672A839Eb92
```

-- brug sign hos begge parter, 1. part

```text
$ node cli.js sign --seed 'wolf flash type breeze cute alarm perfect permit lake brand burst trouble' --method activate --dest 0x7ebD2AcAcB58A6cEA388678D61Efb672A839Eb92 --multisig 0x9133ad26d37ca7446e61Fcf4Ac21EEC9235eAe9b
Signature
{"sigV":27,"sigR":"0x4a376e5289c5070d534f74417017c395f23742a2fb1eb15f1828f45dd109898c","sigS":"0x4adf6407ff9f3ebc222c5d858ce3b807e0b02b719f9f2c2d8112c5b0c77875db"}

  Use it with node send like so:
  send '{"sigV":27,"sigR":"0x4a376e5289c5070d534f74417017c395f23742a2fb1eb15f1828f45dd109898c","sigS":"0x4adf6407ff9f3ebc222c5d858ce3b807e0b02b719f9f2c2d8112c5b0c77875db"}' <other sig> --dest 0x7ebD2AcAcB58A6cEA388678D61Efb672A839Eb92 --multisig 0x9133ad26d37ca7446e61Fcf4Ac21EEC9235eAe9b
```

-- 2. part 

```text
$ node cli.js sign --seed 'only wrist upper exhibit biology wonder once question sauce animal celery sibling' --method activate --dest 0x7ebD2AcAcB58A6cEA388678D61Efb672A839Eb92 --multisig 0x9133ad26d37ca7446e61Fcf4Ac21EEC9235eAe9b
Signature
{"sigV":28,"sigR":"0xbca27f42c1dbbeb8cf972e675176d8077a8dc4be36bbb617b967bc5abf0a1585","sigS":"0x2e98b3e5523ed20f05eb062b129b0d4208ae2d89766fbe39353539f0f3c87bdd"}

  Use it with node send like so:
  send '{"sigV":28,"sigR":"0xbca27f42c1dbbeb8cf972e675176d8077a8dc4be36bbb617b967bc5abf0a1585","sigS":"0x2e98b3e5523ed20f05eb062b129b0d4208ae2d89766fbe39353539f0f3c87bdd"}' <other sig> --dest 0x7ebD2AcAcB58A6cEA388678D61Efb672A839Eb92 --multisig 0x9133ad26d37ca7446e61Fcf4Ac21EEC9235eAe9b
```

-- brug send til at sende de to signaturer

wrong order
```text
$ node cli.js send '{"sigV":28,"sigR":"0xbca27f42c1dbbeb8cf972e675176d8077a8dc4be36bbb617b967bc5abf0a1585","sigS":"0x2e98b3e5523ed20f05eb062b129b0d4208ae2d89766fbe39353539f0f3c87bdd"}' '{"sigV":27,"sigR":"0x4a376e5289c5070d534f74417017c395f23742a2fb1eb15f1828f45dd109898c","sigS":"0x4adf6407ff9f3ebc222c5d858ce3b807e0b02b719f9f2c2d8112c5b0c77875db"}' --method pause --dest 0x7ebD2AcAcB58A6cEA388678D61Efb672A839Eb92 --multisig 0x9133ad26d37ca7446e61Fcf4Ac21EEC9235eAe9b
```    

```text
$ node cli.js send '{"sigV":28,"sigR":"0xbca27f42c1dbbeb8cf972e675176d8077a8dc4be36bbb617b967bc5abf0a1585","sigS":"0x2e98b3e5523ed20f05eb062b129b0d4208ae2d89766fbe39353539f0f3c87bdd"}' '{"sigV":27,"sigR":"0x4a376e5289c5070d534f74417017c395f23742a2fb1eb15f1828f45dd109898c","sigS":"0x4adf6407ff9f3ebc222c5d858ce3b807e0b02b719f9f2c2d8112c5b0c77875db"}' --method activate --dest 0x7ebD2AcAcB58A6cEA388678D61Efb672A839Eb92 --multisig 0x9133ad26d37ca7446e61Fcf4Ac21EEC9235eAe9b
nonce 0
```

-- Vi starter en lokal ganache og får en liste af automatisk generede accounts

$ npm run ganache

Available Accounts
==================
(0) 0xb48946d203dda86a88ae5c90c2141aff6723fddd (~1000000 ETH)
(1) 0x3920d995bca535136871d47c3624627bf13d35b1 (~1000000 ETH)

-- vi opretter en K2

$ node cli.js create K2 0xea3fb1233e39bbd58448e19175576e228cc99077 0xca5f61eac37ba5051d0e9305a32829923f7f0552
Constructor arguments in applied order (2):
  0xea3fb1233e39bbd58448e19175576e228cc99077
  0xca5f61eac37ba5051d0e9305a32829923f7f0552
  deployed K2 to 0xFfbca8BaB46Db0DAb7F30ef529152acf80b0dd29

  
-- vi opretter en K4

$ node cli.js create K4 0xea3fb1233e39bbd58448e19175576e228cc99077 0xca5f61eac37ba5051d0e9305a32829923f7f0552
Constructor arguments in applied order (2):
  0xea3fb1233e39bbd58448e19175576e228cc99077
  0xca5f61eac37ba5051d0e9305a32829923f7f0552
  deployed K4 to 0xBb7cE1E2D1BEd46ab4921F80aFa91307a7945eCb


-- tilføjer K2 som underkontrakt til K4

$ node cli.js add --subcontract 0xFfbca8BaB46Db0DAb7F30ef529152acf80b0dd29 --address 0xBb7cE1E2D1BEd46ab4921F80aFa91307a7945eCb


-- sæt penge på K4

$ node cli.js fund --address 0x4be1C7E9C2fd1571BA84fe7FfdFc70cAEe8b5e84 -m 1


-- aktiver K4

$ node cli.js activate --address 0x4be1C7E9C2fd1571BA84fe7FfdFc70cAEe8b5e84


-- herefter kan vi betale med step

$ node cli.js step --number 0 --address 0x4be1C7E9C2fd1571BA84fe7FfdFc70cAEe8b5e84


-- Den gik ikke! Kontrakt afhængigheden K2 var nemlig ikke aktiv, som det kræves i kontrakt koden, så vi aktiverer K2

$ node cli.js activate --address 0xFfbca8BaB46Db0DAb7F30ef529152acf80b0dd29


-- og herefter kan vi betale med K4

$ node cli.js step --number 0 --address 0x4be1C7E9C2fd1571BA84fe7FfdFc70cAEe8b5e84

-- indtil alle måneder er betalt..


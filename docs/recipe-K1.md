
-- Vi starter en lokal ganache og får en liste af automatisk generede accounts

$ npm run ganache

Available Accounts
==================
(0) 0xb48946d203dda86a88ae5c90c2141aff6723fddd (~1000000 ETH)
(1) 0x3920d995bca535136871d47c3624627bf13d35b1 (~1000000 ETH)


-- lad os se hvordan man laver en K1

$ node cli.js create K1
K1 need the following arguments:
  address _owner, address _serviceProvider
Deploy K1 like so:
  node cli.js create K1 <address> <address>


-- altså skal vi bruge 2 argumenter til oprettelsen (address _owner, address _serviceProvider), vi vælger nr. 0 som underskriver, nr. 1 som service provider

$ node cli.js create K1 0xea3fb1233e39bbd58448e19175576e228cc99077 0xca5f61eac37ba5051d0e9305a32829923f7f0552 --message "ny kontrakt"
Constructor arguments in applied order (2):
  0xea3fb1233e39bbd58448e19175576e228cc99077
  0xca5f61eac37ba5051d0e9305a32829923f7f0552
  deployed K1 to 0xCA1C7caC964471A87e621A9297598c1ce87a785f


-- lad os se kontrakten i vores liste

$ node cli.js list
CONTRACTS OVERVIEW

  K1
    0xCA1C7caC964471A87e621A9297598c1ce87a785f
    2018-12-04 ny kontrakt
	
	
-- vi starter en truffle console for at aktivere kontrakten uden multisig

node cli.js activate 0xCA1C7caC964471A87e621A9297598c1ce87a785f


-- vi tager dens addresse og bruger til 'info' kommandoen
	
$ node cli.js info 0xCA1C7caC964471A87e621A9297598c1ce87a785f
CONTRACT STATE INFORMATION

Contract (at 0xCA..5f)
  State is active
  Has 0 subcontracts

  Interval payments (12 total)
    60000 pending
    60000 pending
    60000 pending
    60000 pending
    60000 pending
    60000 pending
    60000 pending
    60000 pending
    60000 pending
    60000 pending
    60000 pending
    60000 pending


-- vi kan betale, når kontrakten har penge, her sætter vi penge ind før vi forsøger at betale

$ node cli.js fund --address 0xCA1C7caC964471A87e621A9297598c1ce87a785f --amount 1


-- vi betaler første 2 måneder

$ node cli.js step --number 0 --address 0xCA1C7caC964471A87e621A9297598c1ce87a785f
$ node cli.js step --number 1 --address 0xCA1C7caC964471A87e621A9297598c1ce87a785f
...


-- tjek status igen 

$ node cli.js info 0xCA1C7caC964471A87e621A9297598c1ce87a785f
CONTRACT STATE INFORMATION

Contract (at 0xCA..5f)
  State is active
  Has 0 subcontracts

  Interval payments (12 total)
    Paid (0 pending) 
    Paid (0 pending) 
    60000 pending
    60000 pending
    60000 pending
    60000 pending
    60000 pending
    60000 pending
    60000 pending
    60000 pending
    60000 pending
    60000 pending
    
    
-- men hver 3. måned kræver K1 at en status besked er sat før der løber penge igennem. 

$ node cli.js set-status --address 0xCA1C7caC964471A87e621A9297598c1ce87a785f -m 882c45af101a865c8732fe6b00db47a54cd61a7a23250f7c0021595019be8068


-- nu kan vi betale 3. måned

$ node cli.js step --number 2 --address 0xCA1C7caC964471A87e621A9297598c1ce87a785f

-- indtil der ikke er flere betalinger
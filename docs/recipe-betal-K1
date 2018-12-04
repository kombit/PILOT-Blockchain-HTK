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

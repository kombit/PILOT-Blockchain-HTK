

#### This code base has NOT be reviewed by security experts and MUST therefore NOT be used, unless you are _the_ security expert or l33t h4x0r.


# Usage

Use NodeJS to run `cli.js` from the `dist` folder. You will need to [install dependencies](#Installation and dependencies).

Example:
 1.  `cd dist`
 2.  `node cli.js list`
 3.  Should output `CONTRACTS OVERVIEW ...` (followed by deployed contracts if any)


### Installation and dependencies

 1.  We'll need NodeJS and npm 
 2.  Install the Truffle framework globally 
     `npm install -g truffle`
 3.  Download this codebase, and do a `npm install` in the folder


#### Two sets of tools

There are two packages in this repo: 
The Truffle setup with unit tests, and the cli tool.
 
 They have slightly different 
TypeScript configurations - note the two `tsconfig.json` in `src/` and `ethereum/`.


#### Windows trouble-shooting

#### 1. Programs

Be sure to have the following programs installed and added to your `PATH` variable

  - NodeJS, our runtime, - comes with NPM, the package manager used to download project dependencies
  - Git, used to download some dependencies
  - Python, used to build some dependencies
  
  
Test them by opening _Cmd_ or _Power Shell_, then try printing the versions (newer versions are OK):

`node -v` should output `v8.0.0`

`npm -v` should output `5.6.0` 

`git --version` should output `git version 2.19.1.windows.1`

`python --version` should output `Python 2.7.15`


#### 2. Building dependencies

Before setting up project dependencies with `npm install`, install the `windows-build-tools` globally. 
This will require administrator privilege.

`npm install --global --production windows-build-tools` 

Now try running `npm install` in the project folder.
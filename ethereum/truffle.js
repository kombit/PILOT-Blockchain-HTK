const HDWalletProvider = require("truffle-hdwallet-provider")

const projectId = '1e207f767007497db243a0c87df0f15a'

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "1337" // Match any network id
    },
    ropsten: {
      // 0x3238b049ed6c894225e97616a46e355ca10973a2
      provider: () => new HDWalletProvider("off liquid broom dad kiss silver junior drift scorpion crawl dad demise",
        "https://ropsten.infura.io/v3/" + projectId),
      network_id: '4'
    },
  }
}

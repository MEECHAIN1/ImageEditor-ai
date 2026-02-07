require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 13390,
    },
    localhost: {
      url: "http://0.0.0.0:8080",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    ritual: {
      url: "https://rpc.meechain.run.place",
      chainId: 13390,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};

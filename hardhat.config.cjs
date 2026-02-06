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
    // ใช้สำหรับทดสอบใน memory chain ของ Hardhat
    hardhat: {
      chainId: 1337,
    },
    // ใช้สำหรับทดสอบกับ local Hardhat node
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    // ใช้สำหรับ deploy ไปที่ MeeChain Ritual chain จริง
    ritual: {
      url: "https://rpc.meechain.run.place",
      chainId: 13390,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};

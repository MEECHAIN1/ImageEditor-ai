import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

const config: HardhatUserConfig = {
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
    // Localhost สำหรับเทสไวๆ
    hardhat: {
    },
    // BNB Smart Chain (Mainnet)
    bnb: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    // BNB Smart Chain (Testnet)
    bnb_testnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      chainId: 97,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    // MeeChain (Ritual)
    meechain: {
      url: "https://rpc.meechain.io", // ตรวจสอบ RPC URL ล่าสุดของ MeeChain อีกครั้ง
      chainId: 1996, // ตรวจสอบ Chain ID ล่าสุด
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      gasPrice: "auto",
    },
  },
  // ถ้าต้องการ Verify Code บน Explorer
  etherscan: {
    apiKey: {
      // ใส่ API Key ของแต่ละเชน
      bsc: process.env.BSCSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "meechain",
        chainId: 1996,
        urls: {
          apiURL: "https://explorer.meechain.io/api",
          browserURL: "https://explorer.meechain.io",
        },
      },
    ],
  },
};

export default config;
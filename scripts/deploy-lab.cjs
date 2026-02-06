/**
 * 🚀 MeeChain Smart Contract Deployment Script (V6 Stable)
 * สำหรับใช้งานร่วมกับ Hardhat Framework และ Ethers.js v6
 * ปรับปรุงเพื่อรองรับเครือข่าย Ritual (13390) และการบันทึก Artifacts
 */

const { ethers } = require("hardhat");

async function main() {
  // ดึง ContractFactory ของ MeeChainMissionNFT
  const MeeChainMissionNFT = await ethers.getContractFactory("MeeChainMissionNFT");
  const contract = await MeeChainMissionNFT.deploy({ gasLimit: 5000000 });

  console.log("🚀 Deploying MeeChainMissionNFT...");
  const nft = await MeeChainMissionNFT.deploy();

  // รอจน deploy เสร็จ
  await nft.waitForDeployment();

  console.log("✅ MeeChainMissionNFT deployed to:", await nft.getAddress());
  console.log("💡 ระบบ Frontend จะทำการโหลดค่าใหม่นี้ให้อัตโนมัติเมื่อรันแอป");
  console.log("-".repeat(60) + "\n");
}

// รันสคริปต์
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

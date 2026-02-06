/**
 * 🎮 MeeChain Smart Contract Interaction Script
 * ใช้สำหรับทดสอบการเรียกฟังก์ชัน addMission และ completeMissionAndMint
 */

const hre = require("hardhat");

async function main() {
  const { ethers } = hre;

  // 1. ดึง signer (ผู้ทำพิธี)
  const [deployer] = await ethers.getSigners();
  console.log(`👤 ผู้ทำพิธี (Deployer): ${deployer.address}`);

  // 2. ระบุ address ของสัญญาที่ deploy แล้ว
  const contractAddress = "<YOUR_DEPLOYED_CONTRACT_ADDRESS>"; // 🔑 ใส่ address ที่ได้จาก deploy-lab.cjs

  // 3. โหลด Contract Instance
  const MeeChainMissionNFT = await ethers.getContractFactory("MeeChainMissionNFT");
  const contract = MeeChainMissionNFT.attach(contractAddress);

  console.log(`📡 เชื่อมต่อกับสัญญา MeeChainMissionNFT ที่: ${contractAddress}`);

  // 4. เพิ่มภารกิจใหม่
  const txAdd = await contract.addMission(1, "Genesis Ritual", 100);
  await txAdd.wait();
  console.log("✅ เพิ่มภารกิจใหม่เรียบร้อย: MissionID = 1, Reward = 100 XP");

  // 5. Mint NFT เมื่อทำภารกิจสำเร็จ
  const player = deployer.address; // ใช้ address ของ deployer เป็นตัวทดสอบ
  const ipfsUri = "ipfs://QmExampleMeeChainMetadata"; // 🔑 ใส่ URI จริงของ metadata

  const txMint = await contract.completeMissionAndMint(player, 1, ipfsUri);
  const receipt = await txMint.wait();

  // ดึง tokenId จาก event
  const event = receipt.logs.find(
    log => log.fragment && log.fragment.name === "MissionCompleted"
  );
  if (event) {
    const { args } = event;
    console.log(`🎉 MissionCompleted Event: Player=${args[0]}, MissionID=${args[1]}, TokenID=${args[2]}, IPFS=${args[3]}`);
  } else {
    console.log("⚠️ ไม่พบ MissionCompleted Event ใน transaction");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💀 [INTERACT ERROR]:", error);
    process.exit(1);
  });

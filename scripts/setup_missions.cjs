/**
 * 🛠️ MeeChain Mission Setup Script
 * สคริปต์สำหรับเพิ่มภารกิจเริ่มต้น (Seed Data) ลงใน Smart Contract
 */

const hre = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  console.log("--------------------------------------------------");
  console.log("🧪 เริ่มต้นการตั้งค่าภารกิจสำหรับ MeeChain Lab...");

  // 1. ดึงสัญญาที่ Deploy แล้วมาใช้งาน
  const MeeChainMissionNFT = await hre.ethers.getContractAt("MeeChainMissionNFT", CONTRACT_ADDRESS);

  // 2. เพิ่มภารกิจเริ่มต้น
  console.log("📝 กำลังเพิ่มภารกิจลงในบล็อกเชน...");

  const missions = [
    { id: 1, name: "Genesis Onboarding", xp: 100 },
    { id: 2, name: "IPFS Researcher", xp: 250 },
    { id: 3, name: "MeeBot Evolution", xp: 500 }
  ];

  for (const mission of missions) {
    console.log(`📡 Adding Mission ${mission.id}: ${mission.name}...`);
    const tx = await MeeChainMissionNFT.addMission(mission.id, mission.name, mission.xp);
    await tx.wait();
    console.log(`✅ Mission ${mission.id} added!`);
  }

  console.log("--------------------------------------------------");
  console.log("🎉 การตั้งค่าภารกิจทั้งหมดเสร็จสิ้น!");
  console.log("MeeBot พร้อมสำหรับการประมวลผลภารกิจแล้วครับ");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
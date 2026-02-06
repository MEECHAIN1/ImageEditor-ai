const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  const [deployer] = await ethers.getSigners();

  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // address ที่ deploy แล้ว
  const MeeChainMissionNFT = await ethers.getContractFactory("MeeChainMissionNFT");
  const contract = MeeChainMissionNFT.attach(contractAddress);

  console.log(`📡 เชื่อมต่อกับสัญญา MeeChainMissionNFT ที่: ${contractAddress}`);

  // เพิ่มภารกิจ
  const txAdd = await contract.addMission(1, "Genesis Ritual", 100);
  await txAdd.wait();
  console.log("✅ เพิ่มภารกิจใหม่เรียบร้อย: MissionID = 1, Reward = 100 XP");

  // Mint NFT
  const player = deployer.address;
  const ipfsUri = "ipfs://QmeAxu6FWRU9ZtZi18PSyDxe5zhopN4sL4jwLE7aTJc7qr5";

  const txMint = await contract.completeMissionAndMint(player, 1, ipfsUri);
  const receipt = await txMint.wait();

  // ใช้ interface decode event
  const iface = MeeChainMissionNFT.interface;
  receipt.logs.forEach(log => {
    try {
      const parsed = iface.parseLog(log);
      if (parsed.name === "MissionCompleted") {
        console.log(`🎉 MissionCompleted Event: Player=${parsed.args[0]}, MissionID=${parsed.args[1]}, TokenID=${parsed.args[2]}, IPFS=${parsed.args[3]}`);
      }
    } catch (err) {
      // log ไม่ match event → ข้าม
    }
  });
}

main().catch(err => {
  console.error("💀 [INTERACT ERROR]:", err);
  process.exit(1);
});

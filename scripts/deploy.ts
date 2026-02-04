import { ethers, network } from "hardhat";

async function main() {
  console.log("🚀 Starting deployment process on network:", network.name);

  // 1. โหลด Signer (กระเป๋าที่ใช้ Deploy)
  const [deployer] = await ethers.getSigners();
  const balance = await deployer.getBalance();
  console.log("👨‍💻 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.utils.formatEther(balance));

  // --------------------------------------------------------
  // ✅ Step 2: Deploy MissionSystem
  // --------------------------------------------------------
  console.log("\n📄 Deploying MissionSystem...");
  const MissionSystem = await ethers.getContractFactory("MissionSystem");
  // ถ้า Constructor มี arguments ให้ใส่ในวงเล็บ deploy(...)
  const missionSystem = await MissionSystem.deploy(); 
  await missionSystem.deployed();
  console.log("✅ MissionSystem deployed to:", missionSystem.address);

  // --------------------------------------------------------
  // ✅ Step 3: Deploy BadgeSystem
  // --------------------------------------------------------
  console.log("\n📄 Deploying BadgeSystem...");
  const BadgeSystem = await ethers.getContractFactory("BadgeSystem");
  const badgeSystem = await BadgeSystem.deploy();
  await badgeSystem.deployed();
  console.log("✅ BadgeSystem deployed to:", badgeSystem.address);

  // --------------------------------------------------------
  // ✅ Step 4: System Integration (Link Contracts)
  // --------------------------------------------------------
  console.log("\n🔗 Linking MissionSystem with BadgeSystem...");
  try {
    // สมมติว่า MissionSystem มีฟังก์ชัน setBadgeSystemAddress
    const txLink = await missionSystem.setBadgeSystem(badgeSystem.address);
    console.log("   Waiting for transaction confirmation...");
    await txLink.wait();
    console.log("✅ Linked successfully!");
  } catch (error) {
    console.error("⚠️ Failed to link contracts (Check function name/permissions):", error);
  }

  // --------------------------------------------------------
  // ✅ Step 5: Setup & Initial Mint (Test/UX)
  // --------------------------------------------------------
  console.log("\n🎁 Minting initial 'Welcome Explorer' badge...");
  try {
    const badgeName = "Welcome Explorer";
    const mintTx = await badgeSystem.mintBadge(deployer.address, badgeName);
    await mintTx.wait();
    console.log(`✅ Minted '${badgeName}' for deployer: ${deployer.address}`);
    console.log(`   Tx Hash: ${mintTx.hash}`);
  } catch (error) {
    console.error("⚠️ Failed to mint initial badge:", error);
  }

  console.log("\n🎉 Deployment Complete! -----------------------");
  console.log("Network:", network.name);
  console.log("MissionSystem:", missionSystem.address);
  console.log("BadgeSystem:  ", badgeSystem.address);
  console.log("-----------------------------------------------");
}

// Pattern การรัน Script ของ Hardhat
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
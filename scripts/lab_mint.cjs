/**
 * 🧪 MEECHAIN LAB: EXPERIMENT #01 - FULL FLOW MINTING (JWT EDITION)
 * สคริปต์รวบรวมการอัปโหลด IPFS และการสั่ง Mint บน Smart Contract
 * สัญญาเป้าหมาย: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
 */

const hre = require("hardhat");
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

// 🔑 Pinata Configuration
const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJkYTEwNTM2Ni0wY2JkLTRjZWEtYjcwOS00NWE4ZmZlNTJiOTUiLCJlbWFpbCI6InBvdXJpMTk5MDI4QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI5YWRjMWI5MGU4MGM2MmI2NDUzZiIsInNjb3BlZEtleVNlY3JldCI6ImI1MDZhMjc0NDY2ZjRmZGE3NjVhZjg3N2FkY2IzNjg5N2IyYjljNjNlNjFhODNjMzU3MTRkZDU3MDU2MDU5MWQiLCJleHAiOjE3OTk3MjgzODB9.HFb6NqVc_TzScpsS8gPDS1sB-An5MDtLmHQp05ZdZHk";
const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const GATEWAY = "tan-familiar-impala-721.mypinata.cloud";

async function uploadToIPFS() {
    console.log("\n🛰️ [SYSTEM]: เริ่มต้นกระบวนการจัดการข้อมูล IPFS...");
    const imagePath = path.join('assets', 'genesis_card.png');
    if (!fs.existsSync(imagePath)) {
        throw new Error("❌ ไม่พบไฟล์รูปภาพที่ assets/genesis_card.png");
    }

    let data = new FormData();
    data.append('file', fs.createReadStream(imagePath));

    console.log("🖼️ [LAB]: กำลังส่งภาพ Genesis Card ขึ้นสู่ IPFS...");
    const imgRes = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", data, {
        maxContentLength: 'Infinity',
        headers: {
            'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
            'Authorization': `Bearer ${PINATA_JWT}`
        }
    });

    const imageCID = imgRes.data.IpfsHash;
    console.log(`✅ [SUCCESS]: รูปภาพพร้อมใช้งานที่ CID: ${imageCID}`);

    const metadata = {
        name: "MeeChain Genesis Card #01",
        description: "รางวัลเกียรติยศสำหรับผู้ร่วมวิจัยใน MeeChain Lab (Alpha Phase)",
        image: `ipfs://${imageCID}`,
        attributes: [
            { "trait_type": "Mission", "value": "Genesis Onboarding" },
            { "trait_type": "Researcher", "value": "Thanawat" },
            { "trait_type": "Tier", "value": "Alpha Pioneer" }
        ]
    };

    console.log("📄 [LAB]: กำลังสร้าง Metadata JSON และอัปโหลด...");
    const jsonRes = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", metadata, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${PINATA_JWT}`
        }
    });

    return jsonRes.data.IpfsHash;
}

async function main() {
    const networkName = hre.network.name;
    try {
        const [owner] = await hre.ethers.getSigners();
        console.log("==================================================");
        console.log(`🧪 MEEBOT MASTER LAB [Network: ${networkName.toUpperCase()}]`);
        console.log("==================================================");

        const jsonCID = await uploadToIPFS();
        const ipfsUri = `ipfs://${jsonCID}`;

        console.log("\n📡 [CHAIN]: กำลังเชื่อมต่อกับ Smart Contract...");
        const MeeChainNFT = await hre.ethers.getContractAt("MeeChainMissionNFT", CONTRACT_ADDRESS);

        console.log(`⚡ [EXECUTE]: กำลังสั่ง Mint NFT...`);
        const tx = await MeeChainNFT.completeMissionAndMint(owner.address, 1, ipfsUri);

        console.log("⏳ [WAITING]: กำลังรอการยืนยันบล็อก...");
        const receipt = await tx.wait();

        // ดึง Transaction Hash ที่ถูกต้อง
        const txHash = tx.hash || receipt.transactionHash;

        console.log("\n==================================================");
        console.log("🎯 SUCCESS: การทดลองสำเร็จสมบูรณ์ 100%!");
        console.log(`📍 Contract: ${CONTRACT_ADDRESS}`);
        console.log(`📦 Transaction Hash: ${txHash}`);
        console.log(`💳 NFT Owner: ${owner.address}`);
        console.log("==================================================");
        console.log(`💡 ดูผลลัพธ์: https://${GATEWAY}/ipfs/${jsonCID}`);

    } catch (error) {
        console.error("\n❌ [LAB ERROR]:", error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
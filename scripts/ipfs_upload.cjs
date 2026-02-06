/**
 * 🛰️ MeeChain IPFS Automation Script (Executable Version)
 * สคริปต์สำหรับอัปโหลดรูปภาพและการ์ด Metadata ขึ้น IPFS อัตโนมัติ
 */

const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

// 🔑 สำคัญ: กรุณาเติม API Key จาก Pinata ของคุณที่นี่
const PINATA_API_KEY = "YOUR_PINATA_API_KEY";
const PINATA_SECRET_KEY = "YOUR_PINATA_SECRET_KEY";

/**
 * ฟังก์ชันสำหรับอัปโหลดไฟล์รูปภาพ
 */
async function uploadImageToIPFS(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`❌ ไม่พบไฟล์รูปภาพที่: ${filePath} กรุณาเตรียมไฟล์ภาพไว้ในโฟลเดอร์ assets`);
    }

    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    let data = new FormData();
    data.append('file', fs.createReadStream(filePath));

    const res = await axios.post(url, data, {
        maxContentLength: 'Infinity',
        headers: {
            'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
            'pinata_api_key': PINATA_API_KEY,
            'pinata_secret_api_key': PINATA_SECRET_KEY
        }
    });
    return res.data.IpfsHash;
}

/**
 * ฟังก์ชันสำหรับอัปโหลด Metadata JSON
 */
async function uploadMetadataToIPFS(metadata) {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    const res = await axios.post(url, metadata, {
        headers: {
            'pinata_api_key': PINATA_API_KEY,
            'pinata_secret_api_key': PINATA_SECRET_KEY
        }
    });
    return res.data.IpfsHash;
}

/**
 * กระบวนการหลัก: อัปโหลดรูป -> สร้าง JSON -> อัปโหลด JSON
 */
async function runAutoUpload() {
    try {
        if (PINATA_API_KEY === "YOUR_PINATA_API_KEY") {
            console.log("❌ ERROR: กรุณาใส่ Pinata API Key ในไฟล์ ipfs_upload.js ก่อนรันครับ");
            return;
        }

        console.log("--------------------------------------------------");
        console.log("🧪 MeeBot กำลังเริ่มกระบวนการ IPFS Upload...");
        console.log("--------------------------------------------------");

        // 1. ตรวจสอบและสร้างโฟลเดอร์ assets ถ้ายังไม่มี
        const assetsDir = './assets';
        if (!fs.existsSync(assetsDir)){
            fs.mkdirSync(assetsDir);
            console.log("📁 สร้างโฟลเดอร์ ./assets เรียบร้อย กรุณานำรูป genesis_card.png ไปวางในนั้นครับ");
            return;
        }

        const imagePath = path.join(assetsDir, 'genesis_card.png');

        console.log("🖼️ 1. กำลังอัปโหลดรูปภาพไปยัง IPFS...");
        const imageCID = await uploadImageToIPFS(imagePath);
        console.log(`✅ รูปภาพอัปโหลดสำเร็จ! CID: ${imageCID}`);

        // 2. สร้าง Metadata สำหรับ MeeChain NFT
        const metadata = {
            name: "MeeChain Genesis Card #01",
            description: "รางวัลเกียรติยศสำหรับผู้ร่วมวิจัยใน MeeChain Lab",
            image: `ipfs://${imageCID}`,
            external_url: "https://meechain.io",
            attributes: [
                { "trait_type": "Mission", "value": "Genesis Onboarding" },
                { "trait_type": "Researcher", "value": "Thanawat" },
                { "trait_type": "XP Reward", "value": 100 },
                { "trait_type": "Lab Tier", "value": "Alpha" }
            ]
        };

        // 3. อัปโหลด JSON
        console.log("📄 2. กำลังสร้างและอัปโหลด Metadata JSON...");
        const jsonCID = await uploadMetadataToIPFS(metadata);
        console.log(`✅ Metadata อัปโหลดสำเร็จ! CID: ${jsonCID}`);

        console.log("--------------------------------------------------");
        console.log("🎯 สำเร็จ! MeeBot พร้อมให้คุณนำไป Mint แล้ว:");
        console.log(`URL: ipfs://${jsonCID}`);
        console.log("--------------------------------------------------");
        console.log(`💡 คำสั่งถัดไปใน Lab: /mint ${jsonCID}`);
        console.log("--------------------------------------------------");

    } catch (error) {
        console.error("❌ เกิดข้อผิดพลาดใน Lab กระบวนการหยุดชะงัก:");
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

// 🚀 รันสคริปต์ทันที
runAutoUpload();
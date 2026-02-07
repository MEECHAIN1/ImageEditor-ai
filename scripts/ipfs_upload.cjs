/**
 * 🛰️ MeeChain IPFS Automation Script (Executable Version)
 * สคริปต์สำหรับอัปโหลดรูปภาพและการ์ด Metadata ขึ้น IPFS อัตโนมัติ
 * อัปเดตข้อมูล Pinata API สำหรับคุณธณวัฒน์เรียบร้อยแล้ว
 */

const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

// 🔑 ข้อมูล API จาก Pinata ของคุณธณวัฒน์ (Updated)
const PINATA_API_KEY = "9adc1b90e80c62b6453f";
const PINATA_SECRET_KEY = "b506a274466f4fda765af877adcb36897b2b9c63e61a83c35714dd570560591d";
const PINATA_GATEWAY = "tan-familiar-impala-721.mypinata.cloud";

/**
 * ฟังก์ชันสำหรับอัปโหลดไฟล์รูปภาพ
 */
async function uploadImageToIPFS(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`❌ ไม่พบไฟล์รูปภาพที่: ${filePath} กรุณานำรูปภาพไปวางที่ assets/genesis_card.png`);
    }

    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    let data = new FormData();
    data.append('file', fs.createReadStream(filePath));

    const res = await axios.post(url, data, {
        maxContentLength: 'Infinity',
        headers: {
            'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
            'pinata_api_key': PINATA_MEBOT_API_KEY,
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
        console.log("--------------------------------------------------");
        console.log("🧪 MeeBot Lab: เริ่มกระบวนการ IPFS Upload...");
        console.log("🛰️ Gateway:", PINATA_GATEWAY);
        console.log("--------------------------------------------------");

        const imagePath = path.join('assets', 'genesis_card.png');

        // 1. อัปโหลดรูปภาพ
        console.log("🖼️ 1. กำลังอัปโหลดรูปภาพไปยัง IPFS...");
        const imageCID = await uploadImageToIPFS(imagePath);
        console.log(`✅ รูปภาพอัปโหลดสำเร็จ! CID: ${imageCID}`);

        // 2. สร้าง Metadata สำหรับ MeeChain NFT
        const metadata = {
            name: "MeeChain Genesis Card #01",
            description: "รางวัลเกียรติยศสำหรับผู้ร่วมวิจัยใน MeeChain Lab",
            image: `ipfs://${imageCID}`,
            external_url: `https://${PINATA_GATEWAY}/ipfs/${imageCID}`,
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
        console.log("🎯 สำเร็จ! ข้อมูลสำหรับการ Mint พร้อมแล้ว:");
        console.log(`JSON CID: ${jsonCID}`);
        console.log(`IPFS URL: ipfs://${jsonCID}`);
        console.log(`Gateway Preview: https://${PINATA_GATEWAY}/ipfs/${jsonCID}`);
        console.log("--------------------------------------------------");
        console.log(`💡 ขั้นตอนต่อไปใน Lab: พิมพ์ /mint ${jsonCID} ในแชท MeeBot`);
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

// 🚀 เริ่มทำงานทันที
runAutoUpload();
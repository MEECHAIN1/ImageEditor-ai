import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// แปลง __dirname สำหรับ ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ข้อมูล API (ควรเก็บใน .env เพื่อความปลอดภัย)
const API_KEY = process.env.DNS_API_KEY || "ใส่-API-KEY-ของคุณที่นี่"; 
const API_URL = "https://api.dnsexit.com/dns/lse.jsp";

// โหลดข้อมูล DNS Payload จากไฟล์
const payloadPath = path.join(__dirname, '../dns-payload.json');

async function updateDNS() {
  console.log("🔄 กำลังเริ่มกระบวนการอัปเดต DNS สำหรับ Sapphire Mainnet...");

  if (!fs.existsSync(payloadPath)) {
    console.error("❌ ไม่พบไฟล์ dns-payload.json");
    return;
  }

  const fileData = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));
  const domain = fileData.domain;

  // ตรวจสอบความถูกต้องของ IP ในไฟล์
  if (JSON.stringify(fileData).includes("ใส่_IP_จริง")) {
    console.error("⚠️  แจ้งเตือน: กรุณาแก้ไข IP ในไฟล์ dns-payload.json ให้เป็นค่าจริงก่อนรันสคริปต์");
    return;
  }

  // สร้าง URL สำหรับยิง API (ส่ง Key ผ่าน URL ตามคู่มือ)
  const targetUrl = `${API_URL}?apikey=${API_KEY}&domain=${domain}`;

  console.log(`📡 กำลังส่งข้อมูล DNS Records ไปยัง ${domain}...`);

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fileData) // ส่งเฉพาะ Payload
    });

    const result = await response.json();

    if (result.code === 0 || (result.message && result.message.toLowerCase().includes('success'))) {
      console.log("✅ อัปเดต DNS สำเร็จเรียบร้อย!");
      console.log("📝 Server Response:", result);
    } else {
      console.error("❌ เกิดข้อผิดพลาดจาก Server:", result);
    }
  } catch (error) {
    console.error("❌ การเชื่อมต่อ API ล้มเหลว:", error.message);
  }
}

updateDNS();
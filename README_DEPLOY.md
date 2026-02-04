Deployment Guide 🚀

วิธี Deploy ระบบ MissionSystem และ BadgeSystem

1. ติดตั้ง Dependencies

npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers dotenv


2. ตั้งค่า Environment Variables (.env)

สร้างไฟล์ .env ที่ root folder และใส่ Private Key ของกระเป๋าที่จะใช้ Deploy (ต้องมี Native Token สำหรับจ่ายค่าแก๊ส):

PRIVATE_KEY=your_private_key_without_0x
BSCSCAN_API_KEY=your_bscscan_api_key_optional


3. คำสั่ง Deploy

สำหรับ BNB Chain (Testnet)

npx hardhat run scripts/deploy.ts --network bnb_testnet


สำหรับ MeeChain (Ritual)

npx hardhat run scripts/deploy.ts --network meechain


สำหรับ Localhost (Testing)

npx hardhat run scripts/deploy.ts --network hardhat

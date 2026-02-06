📄 ตัวอย่างไฟล์ Metadata JSON (สำหรับ 1 การ์ด)เซฟไฟล์นี้เป็นนามสกุล .json (เช่น mission_01.json) ก่อนอัปโหลดขึ้น IPFS{
  "name": "MeeChain Genesis Card #01",
  "description": "การ์ดเกียรติยศสำหรับผู้ร่วมบุกเบิก MeeChain ในภารกิจ Onboarding สำเร็จเป็นกลุ่มแรก",
  
  ````
  "image": "ipfs://[CID_OF_YOUR_IMAGE]",
  "external_url": "[https://meechain.io/dashboard](https://meechain.io/dashboard)",
  "background_color": "00f0dc",
  "attributes": [
    {
      "trait_type": "Mission Name",
      "value": "Genesis Onboarding"
    },
    {
      "trait_type": "XP Earned",
      "value": 100
    },
    {
      "trait_type": "Rarity",
      "value": "Legendary"
    },
    {
      "trait_type": "Card Type",
      "value": "Utility"
    },
    {
      "display_type": "boost_percentage",
      "trait_type": "Mining Boost",
      "value": 5
    }
  ]
}
````

🛠 ขั้นตอนการอัปโหลดที่ถูกต้อง (Workflow)เพื่อให้ NFT แสดงผลรูปภาพได้สมบูรณ์ คุณธณวัฒน์ต้องทำตามลำดับนี้ครับ:อัปโหลดรูปภาพการ์ด (.png หรือ .jpg):นำรูปภาพไปอัปโหลดขึ้น IPFS ก่อน (ใช้บริการอย่าง Pinata หรือ NFT.Storage)คุณจะได้ CID ของรูปภาพมา (เช่น QmXo...)นำมาใส่ในช่อง "image": "ipfs://QmXo..." ในไฟล์ JSON ด้านบนอัปโหลดไฟล์ JSON:เมื่อแก้ไฟล์ JSON เสร็จแล้ว ให้อัปโหลดไฟล์ .json นั้นขึ้น IPFS อีกรอบคุณจะได้ CID ของ JSON (เช่น QmZ1...)เรียก Smart Contract:นำ ipfs://[CID_ของ_JSON] ไปใส่ในพารามิเตอร์ ipfsUri ของฟังก์ชัน completeMissionAndMint ในสัญญาที่คุณมีอยู่ครับ💡 คำแนะนำเพิ่มเติมสำหรับ MeeChainAttributes: คุณสามารถเพิ่ม Trait ใหม่ๆ ได้ตามใจชอบ เช่น Level, Special Ability ซึ่ง MeeBot สามารถอ่านค่าเหล่านี้ไปใช้ในเกมหรือระบบสิทธิประโยชน์อื่นๆ ได้Animation: หากการ์ดเป็นวิดีโอหรือ 3D คุณสามารถเพิ่มฟิลด์ "animation_url": "ipfs://..." เข้าไปได้ด้วยครับคุณธณวัฒน์ต้องการให้ผมช่วยเขียน สคริปต์ Node.js สำหรับอัปโหลดไฟล์เหล่านี้ขึ้น IPFS แบบอัตโนมัติ เลยไหมครับ? จะได้ไม่ต้องกดอัปโหลดเองทีละใบ!
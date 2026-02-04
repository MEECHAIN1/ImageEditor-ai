// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title MeeMissionNFT
 * @dev ระบบ NFT สำหรับภารกิจ MeeBot ที่เน้นความโปร่งใสและตรวจสอบได้
 * ใช้กลไก Signature Verification เพื่อเชื่อมโลก Off-chain (MeeBot) กับ On-chain
 */
contract MeeMissionNFT is ERC721URIStorage, AccessControl {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // Role สำหรับคนที่ตรวจสอบภารกิจ (MeeBot Backend)
    bytes32 public constant MISSION_VERIFIER_ROLE = keccak256("MISSION_VERIFIER_ROLE");

    // ตัวนับ Token ID
    uint256 private _nextTokenId;

    // Event เพื่อความโปร่งใส (MeeScan สามารถมาจับ Event นี้ไปแสดงผลได้)
    event MissionCompleted(address indexed user, uint256 indexed missionId, uint256 tokenId, string metadataUri);

    // เก็บสถานะว่า Nonce นี้ถูกใช้ไปหรือยัง (กันการ Replay Attack เอาลายเซ็นเดิมมา Mint ซ้ำ)
    mapping(bytes32 => bool) public executedNonces;

    constructor(address defaultAdmin, address minterBot) ERC721("MeeBot Mission Card", "MEE") {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(MISSION_VERIFIER_ROLE, minterBot); // ให้สิทธิ์ Bot เป็นคนเซ็นรับรอง
    }

    /**
     * @dev ฟังก์ชัน Mint การ์ดรางวัลเมื่อจบภารกิจ
     * @param to ผู้รับเหรียญ (User Wallet)
     * @param missionId รหัสภารกิจ (อ้างอิงในระบบ MeeBot)
     * @param uri IPFS link ของ Metadata การ์ด
     * @param nonce รหัสกันซ้ำ (Unique ID ของ Transaction นี้)
     * @param signature ลายเซ็นจาก MeeBot เพื่อยืนยันว่าภารกิจสำเร็จจริง
     */
    function mintMissionReward(
        address to,
        uint256 missionId,
        string memory uri,
        bytes32 nonce,
        bytes memory signature
    ) public {
        // 1. ตรวจสอบว่า Nonce นี้ยังไม่เคยใช้
        require(!executedNonces[nonce], "MeeMission: Signature already used");

        // 2. ตรวจสอบลายเซ็น (Verify Signature)
        // สร้าง Hash จากข้อมูลที่ส่งมา เพื่อดูว่าตรงกับที่ Bot เซ็นไว้ไหม
        bytes32 hash = keccak256(abi.encodePacked(to, missionId, uri, nonce));
        bytes32 ethSignedMessageHash = hash.toEthSignedMessageHash();
        
        // ดึง Address ของคนเซ็นออกมา
        address signer = ethSignedMessageHash.recover(signature);

        // เช็คว่าคนเซ็นมีสิทธิ์ MISSION_VERIFIER_ROLE หรือไม่
        require(hasRole(MISSION_VERIFIER_ROLE, signer), "MeeMission: Invalid signature");

        // 3. บันทึกสถานะว่าใช้แล้ว & Mint
        executedNonces[nonce] = true;
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        // 4. Emit Event ให้ Explorer รับรู้
        emit MissionCompleted(to, missionId, tokenId, uri);
    }

    // ฟังก์ชันพื้นฐานสำหรับการจัดการ Interface (Solidity requirement)
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
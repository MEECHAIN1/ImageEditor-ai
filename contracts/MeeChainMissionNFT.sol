// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title MeeChainMissionNFT
 * @dev สัญญาสำหรับจัดการภารกิจและการ Mint NFT Card พร้อม Metadata บน IPFS
 */
contract MeeChainMissionNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // โครงสร้างข้อมูลภารกิจ
    struct Mission {
        string name;
        uint256 xpReward;
        bool isActive;
    }

    // เก็บข้อมูลภารกิจตาม ID
    mapping(uint256 => Mission) public missions;
    // ตรวจสอบว่าผู้ใช้ทำภารกิจสำเร็จหรือยัง (User => MissionID => Completed)
    mapping(address => mapping(uint256 => bool)) public userCompletedMissions;

    event MissionCompleted(address indexed user, uint256 missionId, uint256 tokenId, string ipfsUri);

    constructor() ERC721("MeeChain Genesis Card", "MEECARD") Ownable(msg.sender) {}

    /**
     * @dev เพิ่มภารกิจใหม่เข้าระบบ (เฉพาะเจ้าของระบบ)
     */
    function addMission(uint256 missionId, string memory name, uint256 xpReward) public onlyOwner {
        missions[missionId] = Mission(name, xpReward, true);
    }

    /**
     * @dev ฟังก์ชันสำหรับ Mint NFT เมื่อทำภารกิจสำเร็จ
     * @param player ที่อยู่กระเป๋าเงินของผู้เล่น
     * @param missionId รหัสภารกิจที่ทำสำเร็จ
     * @param ipfsUri ลิงก์ Metadata ที่เก็บไว้บน IPFS (เช่น ipfs://Qm...)
     */
    function completeMissionAndMint(
        address player, 
        uint256 missionId, 
        string memory ipfsUri
    ) public onlyOwner returns (uint256) {
        require(missions[missionId].isActive, "Mission is not active");
        require(!userCompletedMissions[player][missionId], "Mission already completed");

        // ทำเครื่องหมายว่าสำเร็จแล้ว
        userCompletedMissions[player][missionId] = true;

        // Mint NFT
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(player, newItemId);
        _setTokenURI(newItemId, ipfsUri);

        emit MissionCompleted(player, missionId, newItemId, ipfsUri);

        return newItemId;
    }

    /**
     * @dev ตรวจสอบว่าผู้ใช้ทำภารกิจสำเร็จหรือไม่
     */
    function hasCompletedMission(address player, uint256 missionId) public view returns (bool) {
        return userCompletedMissions[player][missionId];
    }
}
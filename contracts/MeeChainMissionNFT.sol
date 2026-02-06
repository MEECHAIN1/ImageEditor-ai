        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.20;
        import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
        import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
        import "@openzeppelin/contracts/access/Ownable.sol";

        contract MeeChainMissionNFT is ERC721URIStorage, Ownable {
            uint256 private _tokenIdCounter;

            struct Mission {
                string name;
                uint256 xpReward;
                bool isActive;
            }

            mapping(uint256 => Mission) public missions;
            mapping(address => mapping(uint256 => bool)) public userCompletedMissions;

            event MissionCompleted(address indexed user, uint256 missionId, uint256 tokenId, string ipfsUri);

            constructor() ERC721("MeeChain Genesis Card", "MEECARD") Ownable(msg.sender) {}

            function addMission(uint256 missionId, string memory name, uint256 xpReward) public onlyOwner {
                missions[missionId] = Mission(name, xpReward, true);
            }

            function completeMissionAndMint(
                address player,
                uint256 missionId,
                string memory ipfsUri
            ) public onlyOwner returns (uint256) {
                require(missions[missionId].isActive, "Mission is not active");
                require(!userCompletedMissions[player][missionId], "Mission already completed");

                userCompletedMissions[player][missionId] = true;

                _tokenIdCounter++;
                uint256 newItemId = _tokenIdCounter;
                _mint(player, newItemId);
                _setTokenURI(newItemId, ipfsUri);

                emit MissionCompleted(player, missionId, newItemId, ipfsUri);

                return newItemId;
            }

            function hasCompletedMission(address player, uint256 missionId) public view returns (bool) {
                return userCompletedMissions[player][missionId];
            }
        }
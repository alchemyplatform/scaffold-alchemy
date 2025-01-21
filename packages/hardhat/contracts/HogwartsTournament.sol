//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";
contract HogwartsTournament is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    
    enum HogwartsHouse { Gryffindor, Hufflepuff, Ravenclaw, Slytherin }
    
    mapping(address => bool) private _hasMinted;
    mapping(uint256 => HogwartsHouse) public tokenHouse;
    mapping(HogwartsHouse => uint256) public housePoints;
    mapping(uint256 => bool) public isStunned;
    mapping(uint256 => string) public wizardNames;
    
    event HousePointsUpdated(HogwartsHouse house, uint256 newPoints);
    event NFTMinted(address indexed minter, uint256 tokenId, string tokenURI, HogwartsHouse house, string name);
    event WizardStunned(uint256 tokenId);
    event WizardRevived(uint256 tokenId, uint256 reviverTokenId);

    string private constant GRYFFINDOR_URI = "ipfs://QmGryffindorrHash";
    string private constant HUFFLEPUFF_URI = "ipfs://QmHufflepuffHash";
    string private constant RAVENCLAW_URI = "ipfs://QmRavenclawHash";
    string private constant SLYTHERIN_URI = "ipfs://QmSlytherinHash";

    constructor(address initialOwner) ERC721("Wizard", "WZRD") Ownable(initialOwner) {}

    function safeMint(HogwartsHouse house, string memory wizardName) public {
        require(!_hasMinted[msg.sender], "Address has already minted an NFT");
        require(uint8(house) <= 3, "Invalid house selection");
        require(bytes(wizardName).length > 0, "Wizard name cannot be empty");
        require(bytes(wizardName).length <= 40, "Wizard name too long");
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        
        string memory uri;
        if (house == HogwartsHouse.Gryffindor) {
            uri = GRYFFINDOR_URI;
        } else if (house == HogwartsHouse.Hufflepuff) {
            uri = HUFFLEPUFF_URI;
        } else if (house == HogwartsHouse.Ravenclaw) {
            uri = RAVENCLAW_URI;
        } else {
            uri = SLYTHERIN_URI;
        }
        
        _setTokenURI(tokenId, uri);
        tokenHouse[tokenId] = house;
        wizardNames[tokenId] = wizardName;
        _hasMinted[msg.sender] = true;
        
        housePoints[house] += 3;
        emit HousePointsUpdated(house, housePoints[house]);
        emit NFTMinted(msg.sender, tokenId, uri, house, wizardName);
    }

    function getTokenHouse(uint256 tokenId) public view returns (HogwartsHouse) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenHouse[tokenId];
    }

    function getHousePoints(HogwartsHouse house) public view returns (uint256) {
        return housePoints[house];
    }

    function modifyHousePoints(HogwartsHouse house, uint256 points, bool add) public onlyOwner {
        if (add) {
            housePoints[house] += points;
        } else {
            require(housePoints[house] >= points, "Cannot deduct more points than available");
            housePoints[house] -= points;
        }
        emit HousePointsUpdated(house, housePoints[house]);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function rennervate(uint256 targetTokenId) public {
        require(_ownerOf(targetTokenId) != address(0), "Target wizard does not exist");
        require(isStunned[targetTokenId], "Target wizard is not stunned");
        
        uint256 reviverTokenId;
        bool found = false;
        uint256 totalTokens = _nextTokenId;
        
        for(uint256 i = 0; i < totalTokens; i++) {
            if(ownerOf(i) == msg.sender) {
                reviverTokenId = i;
                found = true;
                break;
            }
        }
        
        require(found, "Must own a wizard NFT to cast Rennervate");
        
        HogwartsHouse reviverHouse = tokenHouse[reviverTokenId];
        HogwartsHouse targetHouse = tokenHouse[targetTokenId];
        require(reviverHouse == targetHouse, "Can only revive wizards from your house");
        
        isStunned[targetTokenId] = false;
        housePoints[reviverHouse] += 5;
        emit HousePointsUpdated(reviverHouse, housePoints[reviverHouse]);
        emit WizardRevived(targetTokenId, reviverTokenId);
    }

    function stupefy(uint256 targetTokenId) public {
        require(balanceOf(msg.sender) > 0, "Must own a wizard NFT to cast Stupefy");
        
        uint256 casterTokenId;
        uint256 totalTokens = _nextTokenId;
        
        for(uint256 i = 0; i < totalTokens; i++) {
            if(ownerOf(i) == msg.sender) {
                casterTokenId = i;
                break;
            }
        }

        require(_ownerOf(targetTokenId) != address(0), "Target wizard does not exist");
        require(!isStunned[targetTokenId], "Wizard is already stunned");
        require(tokenHouse[casterTokenId] != tokenHouse[targetTokenId], "Cannot stun wizards from your own house");
        
        isStunned[targetTokenId] = true;
        HogwartsHouse casterHouse = tokenHouse[casterTokenId];
        housePoints[casterHouse] += 5;
        emit HousePointsUpdated(casterHouse, housePoints[casterHouse]);
        emit WizardStunned(targetTokenId);
    }

    function getWizardName(uint256 tokenId) public view returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return wizardNames[tokenId];
    }

    struct WizardStatus {
        HogwartsHouse house;
        bool stunned;
        string name;
    }

    function getWizardStatus(uint256 tokenId) public view returns (WizardStatus memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return WizardStatus(
            tokenHouse[tokenId],
            isStunned[tokenId],
            wizardNames[tokenId]
        );
    }
}

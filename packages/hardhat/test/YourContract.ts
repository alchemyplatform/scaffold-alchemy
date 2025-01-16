import { expect } from "chai";
import { ethers } from "hardhat";
import { HogwartsTournament } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("HogwartsTournament", function () {
  let hogwartsTournament: HogwartsTournament;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  // Enum values
  const HogwartsHouse = {
    Gryffindor: 0,
    Hufflepuff: 1,
    Ravenclaw: 2,
    Slytherin: 3,
  };

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();
    const HogwartsTournamentFactory = await ethers.getContractFactory("HogwartsTournament");
    hogwartsTournament = (await HogwartsTournamentFactory.deploy(owner.address)) as HogwartsTournament;
    await hogwartsTournament.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await hogwartsTournament.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("Should allow minting with valid parameters", async function () {
      const tx = await hogwartsTournament.connect(addr1).safeMint(HogwartsHouse.Gryffindor, "Harry Potter");

      await expect(tx).to.emit(hogwartsTournament, "NFTMinted").to.emit(hogwartsTournament, "HousePointsUpdated");

      expect(await hogwartsTournament.getWizardName(0)).to.equal("Harry Potter");
      expect(await hogwartsTournament.getTokenHouse(0)).to.equal(HogwartsHouse.Gryffindor);
      expect(await hogwartsTournament.getHousePoints(HogwartsHouse.Gryffindor)).to.equal(3);
    });

    it("Should prevent minting multiple NFTs from same address", async function () {
      await hogwartsTournament.connect(addr1).safeMint(HogwartsHouse.Gryffindor, "Harry Potter");
      await expect(
        hogwartsTournament.connect(addr1).safeMint(HogwartsHouse.Slytherin, "Draco Malfoy"),
      ).to.be.revertedWith("Address has already minted an NFT");
    });

    it("Should validate wizard name length", async function () {
      await expect(hogwartsTournament.safeMint(HogwartsHouse.Gryffindor, "")).to.be.revertedWith(
        "Wizard name cannot be empty",
      );

      await expect(hogwartsTournament.safeMint(HogwartsHouse.Gryffindor, "A".repeat(41))).to.be.revertedWith(
        "Wizard name too long",
      );
    });
  });

  describe("House Points", function () {
    it("Should allow owner to modify house points", async function () {
      await hogwartsTournament.modifyHousePoints(HogwartsHouse.Gryffindor, 50, true);
      expect(await hogwartsTournament.getHousePoints(HogwartsHouse.Gryffindor)).to.equal(50);

      await hogwartsTournament.modifyHousePoints(HogwartsHouse.Gryffindor, 20, false);
      expect(await hogwartsTournament.getHousePoints(HogwartsHouse.Gryffindor)).to.equal(30);
    });

    it("Should prevent non-owners from modifying points", async function () {
      await expect(
        hogwartsTournament.connect(addr1).modifyHousePoints(HogwartsHouse.Gryffindor, 50, true),
      ).to.be.revertedWithCustomError(hogwartsTournament, "OwnableUnauthorizedAccount");
    });

    it("Should prevent deducting more points than available", async function () {
      await expect(hogwartsTournament.modifyHousePoints(HogwartsHouse.Gryffindor, 10, false)).to.be.revertedWith(
        "Cannot deduct more points than available",
      );
    });
  });

  describe("Spells", function () {
    beforeEach(async function () {
      // Mint NFTs for testing spells - make sure they're in different houses
      await hogwartsTournament.connect(addr1).safeMint(HogwartsHouse.Gryffindor, "Harry");
      await hogwartsTournament.connect(addr2).safeMint(HogwartsHouse.Slytherin, "Draco");
    });

    describe("Stupefy", function () {
      it("Should allow stunning another wizard", async function () {
        const tx = await hogwartsTournament.connect(addr1).stupefy(1); // Gryffindor stuns Slytherin
        await expect(tx)
          .to.emit(hogwartsTournament, "WizardStunned")
          .withArgs(1)
          .to.emit(hogwartsTournament, "HousePointsUpdated");
        expect(await hogwartsTournament.isStunned(1)).to.equal(true);
      });

      it("Should require owning a wizard to cast stupefy", async function () {
        const [, , , , otherAcc] = await ethers.getSigners();
        await expect(hogwartsTournament.connect(otherAcc).stupefy(0)).to.be.revertedWith(
          "Must own a wizard NFT to cast Stupefy",
        );
      });
    });

    describe("Rennervate", function () {
      beforeEach(async function () {
        // Have another Gryffindor to help revive
        const [, , , addr3] = await ethers.getSigners();
        await hogwartsTournament.connect(addr3).safeMint(HogwartsHouse.Gryffindor, "Ron");
        // Slytherin stuns Gryffindor
        await hogwartsTournament.connect(addr2).stupefy(0);
      });

      it("Should allow reviving a stunned wizard from same house", async function () {
        const [, , , addr3] = await ethers.getSigners();
        const tx = await hogwartsTournament.connect(addr3).rennervate(0); // Another Gryffindor revives Harry
        await expect(tx).to.emit(hogwartsTournament, "WizardRevived").to.emit(hogwartsTournament, "HousePointsUpdated");
        expect(await hogwartsTournament.isStunned(0)).to.equal(false);
      });
    });
  });

  describe("Token Information", function () {
    beforeEach(async function () {
      await hogwartsTournament.connect(addr1).safeMint(HogwartsHouse.Gryffindor, "Harry Potter");
    });

    it("Should return correct wizard name", async function () {
      expect(await hogwartsTournament.getWizardName(0)).to.equal("Harry Potter");
    });

    it("Should return correct house", async function () {
      expect(await hogwartsTournament.getTokenHouse(0)).to.equal(HogwartsHouse.Gryffindor);
    });

    it("Should revert for non-existent tokens", async function () {
      await expect(hogwartsTournament.getWizardName(99)).to.be.revertedWith("Token does not exist");

      await expect(hogwartsTournament.getTokenHouse(99)).to.be.revertedWith("Token does not exist");
    });
  });
});

import { expect } from "chai";
import { ethers } from "hardhat";
import { Counter } from "../typechain-types";

describe("Counter", function () {
  let counter: Counter;

  before(async () => {
    const counterFactory = await ethers.getContractFactory("Counter");
    counter = (await counterFactory.deploy()) as Counter;
    await counter.waitForDeployment();
  });

  describe("Counter Tests", function () {
    it("Should initialize with x = 10", async function () {
      expect(await counter.x()).to.equal(10);
    });

    it("Should increment x", async function () {
      await counter.increment();
      expect(await counter.x()).to.equal(11);
    });

    it("Should decrement x", async function () {
      await counter.decrement();
      expect(await counter.x()).to.equal(10);
    });
  });
});

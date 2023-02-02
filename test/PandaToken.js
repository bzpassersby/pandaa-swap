const { ethers } = require("hardhat");
const { expect } = require("chai");
require("dotenv").config();

describe("PandaToken", () => {
  let pandaToken;

  beforeEach(async () => {
    // Get contract and deploy contract
    const PandaToken = await ethers.getContractFactory("PandaToken");
    pandaToken = await PandaToken.deploy();
  });

  describe("Deployment", () => {
    it("has correct token name", async () => {
      expect(await pandaToken.name()).to.equal("PandaToken");
    });
    it("has correct token symbol", async () => {
      expect(await pandaToken.symbol()).to.equal("PANDA");
    });
  });
});

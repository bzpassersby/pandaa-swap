// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");
const hre = require("hardhat");
require("dotenv").config();

async function main() {
  // Fetch contract to deploy
  console.log("Preparing deployment...\n");
  const PandaToken = await ethers.getContractFactory("PandaToken");
  const Zoologist = await ethers.getContractFactory("Zoologist");

  // Get signers
  const accounts = await ethers.getSigners();
  console.log(`Account fetched: \n ${accounts[0].address}\n`);

  // Deploy contracts
  const pandaToken = await PandaToken.deploy();
  await pandaToken.deployed();
  console.log(`PANDA deployed to:${pandaToken.address}`);

  const zoologist = await Zoologist.deploy(
    pandaToken.address,
    process.env.DEV_ADDRESS, // Your address where you get PANDA tokens - should be a multisig
    ethers.utils.parseUnits(process.env.TOKENS_PER_BLOCK, 18), // Number of Tokens rewarded per block, e.g.,100
    process.env.START_BLOCK, //Block number when token mining starts
    process.env.BONUS_END_BLOCK //Block when bonus ends
  );
  await zoologist.deployed();
  console.log(`zoologist deployed to:${zoologist.address}`);

  // Make Zoologist contract token owner
  await pandaToken.transferOwnership(zoologist.address);

  // Add liquidity pool for rewards, e.g., "ETH/DAI Pool"
  await zoologist.addToPool(
    process.env.LP_TOKEN_ADDRESS,
    process.env.ALLOCATION_POINT,
    false
  );

  // Add more liquidity pools here upon deployment, or add them manually
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

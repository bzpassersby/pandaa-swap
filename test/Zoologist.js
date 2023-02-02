const { ethers } = require("hardhat");
const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

require("dotenv").config();

describe("Zoologist", () => {
  let pandaToken,
    zoologist,
    lpToken,
    accounts,
    deployer,
    user1,
    transaction,
    result,
    origLastRewardBlock;

  async function deployContractFixture() {
    //get signers
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    user1 = accounts[1];

    //get contracts and deploy contracts
    const PandaToken = await ethers.getContractFactory("PandaToken");
    pandaToken = await PandaToken.deploy();

    const Zoologist = await ethers.getContractFactory("Zoologist");
    zoologist = await Zoologist.deploy(
      pandaToken.address,
      deployer.address, // Your address where you get PANDA tokens - should be a multisig
      ethers.utils.parseUnits(process.env.TOKENS_PER_BLOCK, 18), // Number of Tokens rewarded per block, e.g.,100
      process.env.START_BLOCK, //Block number when token mining starts
      process.env.BONUS_END_BLOCK //Block when bonus ends
    );

    await pandaToken.connect(deployer).transferOwnership(zoologist.address);

    //get and deploy lpToken
    const LpToken = await ethers.getContractFactory("PandaToken");
    lpToken = await LpToken.deploy();
    //Add a new pool for lpToken
    transaction = await zoologist.addToPool(lpToken.address, 10, false);
    result = await transaction.wait();
    origLastRewardBlock = await ethers.provider.getBlockNumber();
    console.log(`original last reward bloack${origLastRewardBlock}`);

    //Transfer initial lpTokens to pool
    transaction = await lpToken.mint(zoologist.address, tokens(1000));
    result = await transaction.wait();

    //Transfer initial lpTokens to user1
    transaction = await lpToken.mint(user1.address, tokens(100));
    result = await transaction.wait();

    //Return variable snapshot
    return {
      deployer,
      user1,
      pandaToken,
      zoologist,
      lpToken,
      origLastRewardBlock,
    };
  }

  describe("Deployment", () => {
    it("has correct token address", async () => {
      const { zoologist } = await loadFixture(deployContractFixture);
      expect(await zoologist.panda()).to.equal(pandaToken.address);
    });
    it("has correct dev address", async () => {
      const { zoologist } = await loadFixture(deployContractFixture);
      expect(await zoologist.devaddr()).to.equal(deployer.address);
    });
    it("has correct number of tokens rewarded per block", async () => {
      const { zoologist } = await loadFixture(deployContractFixture);
      expect(await zoologist.pandaPerBlock()).to.equal(tokens(100));
    });
    it("user1 has correct amount of lpToken", async () => {
      const { lpToken, user1 } = await loadFixture(deployContractFixture);
      let balance = await lpToken.balanceOf(user1.address);
      expect(balance.toString()).to.equal(tokens(100).toString());
    });
  });

  describe("Add pool", () => {
    it("has correct total allocPoint", async () => {
      const { zoologist } = await loadFixture(deployContractFixture);
      expect(await zoologist.totalAllocPoint()).to.equal(10);
    });
    it("has correct lp token address", async () => {
      const { zoologist, lpToken } = await loadFixture(deployContractFixture);

      let pool = await zoologist.poolInfo([0]);
      expect(await pool.lpToken).to.equal(lpToken.address);
    });
    it("has correct lastRewardBlock", async () => {
      const { zoologist, origLastRewardBlock } = await loadFixture(
        deployContractFixture
      );
      let pool = await zoologist.poolInfo([0]);
      expect(await pool.lastRewardBlock).to.equal(origLastRewardBlock);
    });
  });
  describe("Upadte Pool", () => {
    let block, pool, lastRewardBlock;
    async function updatePool() {
      transaction = await zoologist.updatePool(0);
      result = transaction.wait();
      block = await ethers.provider.getBlockNumber();
      console.log(`Current block: ${block} `);
      return { block };
    }

    it("has correct lastRewardBlock", async () => {
      const { zoologist } = await loadFixture(deployContractFixture);
      const { block } = await loadFixture(updatePool);
      pool = await zoologist.poolInfo([0]);
      lastRewardBlock = pool.lastRewardBlock;
      console.log(`lastRewardBlock:${lastRewardBlock}`);
      expect(lastRewardBlock).to.equal(block);
    });
    it("has correct accPandaPerShare", async () => {
      const { zoologist, lpToken, origLastRewardBlock } = await loadFixture(
        deployContractFixture
      );
      const { block } = await loadFixture(updatePool);
      pool = await zoologist.poolInfo([0]);
      let multiplier = block - origLastRewardBlock;
      let pandaReward = multiplier * tokens(process.env.TOKENS_PER_BLOCK);
      console.log(`pandaRewards:${pandaReward}`);
      let balance = await lpToken.balanceOf(zoologist.address);
      console.log(`zoologist balance of lptoken: ${balance}`);
      let accPandaPerShare = Math.round((pandaReward * 1e12) / balance);
      expect(await pool.accPandaPerShare).to.equal(accPandaPerShare);
    });
    it("correctly distribute panda rewards to devs", async () => {
      const { pandaToken, origLastRewardBlock } = await loadFixture(
        deployContractFixture
      );
      const { block } = await loadFixture(updatePool);
      let multiplier = block - origLastRewardBlock;
      console.log(multiplier);
      let devReward = (multiplier * tokens(process.env.TOKENS_PER_BLOCK)) / 10;
      let balance = await pandaToken.balanceOf(deployer.address);
      console.log(balance);
      expect(balance.toString()).to.equal(devReward.toString());
    });
    it("correctly minted panda rewards", async () => {
      const { pandaToken, zoologist, origLastRewardBlock } = await loadFixture(
        deployContractFixture
      );
      const { block } = await loadFixture(updatePool);
      let multiplier = block - origLastRewardBlock;
      console.log(multiplier);
      let pandaReward = multiplier * tokens(process.env.TOKENS_PER_BLOCK);
      let balance = await pandaToken.balanceOf(zoologist.address);
      console.log(balance);
      expect(balance.toString()).to.equal(pandaReward.toString());
    });
  });
  describe("Deposit", () => {
    let balance;
    async function userDeposit() {
      const { user1, zoologist, lpToken } = await loadFixture(
        deployContractFixture
      );
      //1st deposit
      transaction = await lpToken
        .connect(user1)
        .approve(zoologist.address, tokens(1));
      result = transaction.wait();
      transaction = await zoologist.connect(user1).deposit(0, tokens(1));
      result = transaction.wait();
      let userFirstDeposit = await zoologist.userInfo(0, user1.address);
      return { userFirstDeposit };
    }
    async function userDeposit2() {
      const { user1, zoologist, lpToken } = await loadFixture(
        deployContractFixture
      );
      //1st deposit
      transaction = await lpToken
        .connect(user1)
        .approve(zoologist.address, tokens(1));
      result = transaction.wait();
      transaction = await zoologist.connect(user1).deposit(0, tokens(1));
      result = transaction.wait();
      //2nd deposit
      transaction = await lpToken
        .connect(user1)
        .approve(zoologist.address, tokens(2));
      result = transaction.wait();
      transaction = await zoologist.connect(user1).deposit(0, tokens(2));
      result = transaction.wait();
      let userSecondDeposit = await zoologist.userInfo(0, user1.address);
      let poolSecondDeposit = await zoologist.poolInfo([0]);
      let poolSecondAPPS = poolSecondDeposit.accPandaPerShare;
      return { userSecondDeposit, poolSecondAPPS };
    }

    it("1st deposit: has correct rewardDebt assigned to user1", async () => {
      const { userFirstDeposit } = await loadFixture(userDeposit);
      expect(userFirstDeposit.rewardDebt.toString()).to.equal("0");
    });
    it("1st deposit: has correct amount of lpToken deposited to the pool", async () => {
      const { userFirstDeposit } = await loadFixture(userDeposit);
      expect(userFirstDeposit.amount.toString()).to.equal(tokens(1).toString());
    });
    it("2nd deposit: has correct amount of panda rewarded to user1", async () => {
      const { user1, pandaToken } = await loadFixture(deployContractFixture);
      const { userFirstDeposit } = await loadFixture(userDeposit);
      const { poolSecondAPPS } = await loadFixture(userDeposit2);
      let balance = await pandaToken.balanceOf(user1.address);
      let pending = Math.round(
        (userFirstDeposit.amount * poolSecondAPPS) / 1e12
      );
      expect(balance.toString()).to.equal(pending.toString());
    });
  });
  describe("Withdraw", () => {
    async function userDeposit() {
      const { user1, zoologist, lpToken, pandaToken } = await loadFixture(
        deployContractFixture
      );
      //1st deposit
      transaction = await lpToken
        .connect(user1)
        .approve(zoologist.address, tokens(1));
      result = transaction.wait();
      transaction = await zoologist.connect(user1).deposit(0, tokens(1));
      result = transaction.wait();
      let userFirstDeposit = await zoologist.userInfo(0, user1.address);
      let poolFirstDeposit = await zoologist.poolInfo([0]);
      let rewardFirstDeposit = await pandaToken.balanceOf(user1.address);
      return { userFirstDeposit, poolFirstDeposit, rewardFirstDeposit };
    }
    async function userWithdraw() {
      const { user1, zoologist, lpToken, pandaToken } = await loadFixture(
        deployContractFixture
      );
      //1st deposit
      transaction = await lpToken
        .connect(user1)
        .approve(zoologist.address, tokens(1));
      result = transaction.wait();
      transaction = await zoologist.connect(user1).deposit(0, tokens(1));
      result = transaction.wait();

      //Withdraw
      transaction = await zoologist.connect(user1).withdraw(0, tokens(1));
      result = transaction.wait();
      let userWithdraw = await zoologist.userInfo(0, user1.address);
      let poolWithdraw = await zoologist.poolInfo([0]);
      let rewardWithdraw = await pandaToken.balanceOf(user1.address);
      return { userWithdraw, poolWithdraw, rewardWithdraw };
    }
    it("user has correct amount of panda rewards", async () => {
      const { userFirstDeposit } = await loadFixture(userDeposit);
      const { poolWithdraw, rewardWithdraw } = await loadFixture(userWithdraw);
      // user rewardDebt prior to withdraw should equal '0'
      let pending = Math.round(
        userFirstDeposit.amount.mul(poolWithdraw.accPandaPerShare).div(1e12)
      );
      expect(rewardWithdraw.toString()).to.equal(pending.toString());
    });
    it("user has correct amount of lpToken in balance", async () => {
      const { user1, lpToken } = await loadFixture(deployContractFixture);
      let balance = await lpToken.balanceOf(user1.address);
      expect(balance.toString()).to.equal(tokens(100));
    });
  });
  describe("Pending Panda on FrontEnd", () => {
    it("has correct rewards", async () => {
      //load fixtrue from deployment state w/ original reward block
      const { user1, zoologist, lpToken, origLastRewardBlock } =
        await loadFixture(deployContractFixture);
      //1st deposit, call pending Panda function
      transaction = await lpToken
        .connect(user1)
        .approve(zoologist.address, tokens(1));
      result = await transaction.wait();
      transaction = await zoologist.connect(user1).deposit(0, tokens(1));
      result = await transaction.wait();

      let userDepositInfo = await zoologist.userInfo(0, user1.address);
      let userDepositAmount = userDepositInfo.amount;
      let userDepositDebt = userDepositInfo.rewardDebt;

      console.log(userDepositAmount);
      console.log(userDepositDebt);

      let pendingPanda = await zoologist.pendingPanda(0, user1.address);
      console.log(pendingPanda);

      //calcalute user pending reward based on current block number
      let block = await ethers.provider.getBlockNumber();
      console.log(block);
      console.log(origLastRewardBlock);
      let pandaRewardPerShare = Math.round(
        ((block - origLastRewardBlock) *
          tokens(process.env.TOKENS_PER_BLOCK) *
          1e12) /
          tokens(1000) // token balance was not updated to 1001 here because there is no new block after last reward block numnber logged on previous deposit
      );
      console.log(pandaRewardPerShare);
      let pending = Math.round(
        (pandaRewardPerShare / 1e12) * userDepositAmount
      );
      //expect differnce of user PANDA balance to equal calculated user rewards
      expect(pendingPanda.toString()).to.equal(pending.toString());
    });
  });
});

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./PandaToken.sol";
import "hardhat/console.sol";

contract Zoologist is Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    // Info of each user.
    struct UserInfo {
        uint256 amount; // How many LP tokens the user has provided.
        uint256 rewardDebt; // Reward debt. See explanation below.
        //
        // Basically, any point in time, the amount of PANDAs
        // entitled to a user but is pending to be distributed is:
        //
        //   pending reward = (user.amount * pool.accSushiPerShare) - user.rewardDebt
        //
        // Whenever a user deposits or withdraws LP tokens to a pool. Here's what happens:
        //   1. The pool's `accSushiPerShare` (and `lastRewardBlock`) gets updated.
        //   2. User receives the pending reward sent to his/her address.
        //   3. User's `amount` gets updated.
        //   4. User's `rewardDebt` gets updated.
    }

    // Info of each pool.
    struct PoolInfo {
        IERC20 lpToken; // Address of LP token contract.
        uint256 allocPoint; // How many allocation poinst assigned to this pool. PANDAs to distribute per block.
        uint256 lastRewardBlock; // Last block number PANDA distributions occur
        uint256 accPandaPerShare; // Accumulated PANDAs per share, times 1e18. See below.
    }

    // Info of each pool.
    PoolInfo[] public poolInfo;

    // The PANDA TOKEN!
    PandaToken public panda;
    // Dev address
    address public devaddr;
    // Block number when bonus PANDA period ends
    uint256 public bonusEndBlock;
    // PANDA tokens created per block
    uint256 public pandaPerBlock;
    // Bonus mutiplier for early panda keepers
    uint256 public constant BONUS_MULTIPLIER = 10;

    // Info of each user that stakes LP tokens.
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;
    // Total allocation poitns. Must be the sum of all allocation points in all pools.
    uint256 public totalAllocPoint = 0;
    // The block number when PANDA mining starts
    uint256 public startBlock;

    // Events
    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);

    constructor(
        PandaToken _panda,
        address _devaddr,
        uint256 _pandaPerBlock,
        uint256 _startBlock,
        uint256 _bonusEndBlock
    ) {
        panda = _panda;
        devaddr = _devaddr;
        pandaPerBlock = _pandaPerBlock;
        bonusEndBlock = _bonusEndBlock;
        startBlock = _startBlock;
    }

    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    // Add a new lp to the pool. Can only be called by the owner.
    // DO NOT add the same LP token more than once. Rewards will be messed up if you do.
    function addToPool(
        IERC20 _lpToken,
        uint256 _allocPoint,
        bool _withUpdate
    ) public onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }
        uint256 lastRewardBlock = block.number > startBlock
            ? block.number
            : startBlock;
        totalAllocPoint = totalAllocPoint.add(_allocPoint);
        poolInfo.push(PoolInfo(_lpToken, _allocPoint, lastRewardBlock, 0));
    }

    // Update reward variables of the given pool to be up-to-date. This is triggered by user deposit/withdraw functions.
    function updatePool(uint256 _pid) public {
        // Fetch pool
        PoolInfo storage pool = poolInfo[_pid];
        // Fetch and check lastrewardblock
        // Step 1:If current block equals lastRewardBlock, return-no rewards and updates needed
        if (block.number <= pool.lastRewardBlock) {
            return;
        }
        // Step 2: makesure LP balance is not equal to 0 in pool. No rewards if there's no staked LP tokens in the pool.
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (lpSupply == 0) {
            pool.lastRewardBlock = block.number;
            return;
        }
        // Calculate PANDA rewards accumulated  based on block counts, allocPoint, bous reward multiplier
        uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
        uint256 pandaReward = multiplier
            .mul(pandaPerBlock)
            .mul(pool.allocPoint)
            .div(totalAllocPoint);
        // Distribute PANDA rewards to devs based on set porortion
        panda.mint(devaddr, pandaReward.div(10));
        // Mint Remaining PANDA rewards to zoologist. Rewards are not distributed to users until users deposit/withdraw LP tokens staked.
        panda.mint(address(this), pandaReward);
        // update pool reward variables based on calculation
        pool.accPandaPerShare = pool
            .accPandaPerShare
            .add(pandaReward)
            .mul(1e12)
            .div(lpSupply);
        pool.lastRewardBlock = block.number;
    }

    //Return reward multiplier for Panda rewards over the given _from to _to block.
    function getMultiplier(uint256 _from, uint256 _to)
        public
        view
        returns (uint256)
    {
        //if within bonus period
        if (_to <= bonusEndBlock) {
            return (_to.sub(_from)).mul(BONUS_MULTIPLIER);
        }
        //if outside bonus period
        if (_from >= bonusEndBlock) {
            return _to.sub(_from);
        }
        // if partially within bonus period
        else {
            return
                bonusEndBlock.sub(_from).mul(BONUS_MULTIPLIER).add(_to).sub(
                    bonusEndBlock
                );
        }
    }

    function deposit(uint256 _pid, uint256 _amount) public {
        // Fetch correct pool
        PoolInfo storage pool = poolInfo[_pid];
        // Fetch user info
        UserInfo storage user = userInfo[_pid][msg.sender];
        // Fetch latest pool rewards variables
        updatePool(_pid);
        // Step 1: Calcuate and distribute rewards to user
        // If user has LP tokens staked in the pool , calculate pending rewards. Distribute rewards to user IF user is owed rewards.
        if (user.amount > 0) {
            uint256 pending = user
                .amount
                .mul(pool.accPandaPerShare)
                .div(1e12)
                .sub(user.rewardDebt);
            if (pending > 0) {
                safePandaTransfer(msg.sender, pending);
            }
            // //Transfer lptokens to zoologist
            pool.lpToken.safeTransferFrom(msg.sender, address(this), _amount);
            // // Update userInfo
            user.amount = user.amount.add(_amount);
            user.rewardDebt = user.amount.mul(pool.accPandaPerShare).div(1e12);
            // // Emit Deposit event
            emit Deposit(msg.sender, _pid, _amount);
        }
        // // if user doens't have LP tokens in the pool before, set rewardDebt to '0', and deposit tokens
        else {
            //Transfer lptokens to zoologist
            pool.lpToken.safeTransferFrom(msg.sender, address(this), _amount);
            user.amount = user.amount.add(_amount);
            user.rewardDebt = 0;
        }
    }

    //Safe Panda transfer function, just in case rounding errors causes pool to not have enough Pandas.
    function safePandaTransfer(address _to, uint256 _amount) internal {
        //Check total Pandas zoologist have to distribute
        uint256 pandaBal = panda.balanceOf(address(this));
        // Distribute panda rewards
        if (_amount > pandaBal) {
            panda.transfer(_to, pandaBal);
        } else {
            panda.transfer(_to, _amount);
        }
    }

    // Update reward variables for all pools. Be careful of gas spending!
    function massUpdatePools() public {
        uint256 length = poolInfo.length;
        //cycle through each pool and run updatePool function
        for (uint256 pid = 0; pid < length; ++pid) {
            updatePool(pid);
        }
    }

    //View function to see pending Pandas on frontend
    function pendingPanda(uint256 _pid, address _user)
        external
        view
        returns (uint256)
    {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_user];
        uint256 accPandaPerShare = pool.accPandaPerShare;
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));

        if (block.number > pool.lastRewardBlock && lpSupply != 0) {
            uint256 multiplier = getMultiplier(
                pool.lastRewardBlock,
                block.number
            );
            console.log(multiplier);
            uint256 pandaReward = pandaPerBlock
                .mul(multiplier)
                .mul(pool.allocPoint)
                .div(totalAllocPoint);
            accPandaPerShare = accPandaPerShare.add(
                pandaReward.mul(1e12).div(lpSupply)
            );
        }
        return user.amount.mul(accPandaPerShare).div(1e12).sub(user.rewardDebt);
    }

    // Withdraw LP tokens from MasterChef.
    function withdraw(uint256 _pid, uint256 _amount) public {
        //Fetch pool id
        PoolInfo storage pool = poolInfo[_pid];
        //Fetch user
        UserInfo storage user = userInfo[_pid][msg.sender];
        //require user has enought amount to withdraw
        require(user.amount >= _amount, "withdraw: not good");
        //Update pool info to get pending panda rewards
        updatePool(_pid);
        //calculte pending rewards for user;
        uint256 pending = user.amount.mul(pool.accPandaPerShare).div(1e12).sub(
            user.rewardDebt
        );
        if (pending > 0) {
            //Send rewards to user;
            safePandaTransfer(msg.sender, pending);
            //Update user reward debt
            user.rewardDebt = user.amount.mul(pool.accPandaPerShare).div(1e12);
        }
        if (_amount > 0) {
            //SafeTransfer to withdraw funds
            pool.lpToken.safeTransfer(msg.sender, _amount);
            //update user amount
            user.amount = user.amount.sub(_amount);
            //Emit a withdraw event
            emit Withdraw(msg.sender, _pid, _amount);
        }
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// PandaToken with Governance.
contract PandaToken is ERC20("PandaToken", "PANDA"), Ownable {
    // @notice Creates `_amount` token to `_to`. Must only be called by the owner (Zoologist).
    function mint(address _to, uint256 _amount) public {
        _mint(_to, _amount);
    }
}

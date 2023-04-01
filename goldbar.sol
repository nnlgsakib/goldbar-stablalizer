// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";

contract GoldBar is ERC20, Ownable, ERC20Snapshot {
    uint256 private _price;
    mapping(address => bool) private _lockedAccounts;
    mapping(address => bool) private _blockedAccounts;

    constructor() ERC20("GoldBar", "GOLD") {
        _mint(msg.sender, 1000000000 * 10 ** decimals());
    }
    
    function setPrice(uint256 price) external onlyOwner {
        _price = price;
    }
    
    function getPrice() external view returns (uint256) {
        return _price;
    }
    
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
    
    function mint(address account, uint256 amount) external onlyOwner {
        _mint(account, amount);
    }
    
    function lockAccount(address account) external onlyOwner {
        _lockedAccounts[account] = true;
    }
    
    function unlockAccount(address account) external onlyOwner {
        _lockedAccounts[account] = false;
    }
    
    function isAccountLocked(address account) external view returns (bool) {
        return _lockedAccounts[account];
    }
    
    function blockAccount(address account) external onlyOwner {
        _blockedAccounts[account] = true;
    }
    
    function unblockAccount(address account) external onlyOwner {
        _blockedAccounts[account] = false;
    }
    
    function isAccountBlocked(address account) external view returns (bool) {
        return _blockedAccounts[account];
    }
    
    function transfer(address recipient, uint256 amount) public virtual override(ERC20) returns (bool) {
        require(!_blockedAccounts[msg.sender], "Your account has been blocked");
        require(!_lockedAccounts[msg.sender], "Your account has been locked");
        require(!_lockedAccounts[recipient], "Recipient account has been locked");
        return super.transfer(recipient, amount);
    }
    
    function transferFrom(address sender, address recipient, uint256 amount) public virtual override(ERC20) returns (bool) {
        require(!_blockedAccounts[sender], "Sender account has been blocked");
        require(!_lockedAccounts[sender], "Sender account has been locked");
        require(!_lockedAccounts[recipient], "Recipient account has been locked");
        return super.transferFrom(sender, recipient, amount);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override(ERC20, ERC20Snapshot) {
        super._beforeTokenTransfer(from, to, amount);
        // add your own logic here
    }

    function snapshot() external returns (uint256) {
        return _snapshot();
    }
}

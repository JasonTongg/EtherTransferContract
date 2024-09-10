// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Transfer {
    uint256 transactionCount;

    struct transactionStructs {
        address from;
        address to;
        uint256 amount;
        string message;
    }

    event addTransactionEvent (
        address from,
        address to,
        uint256 amount,
        string message
    );

    event transferEvent (address from, address to, uint256 amount);

    transactionStructs[] public transactionList;

    function addTransaction(address _to, uint256 _amount, string calldata _message) public {
        require(_amount > 0, "Transfer amount must be more than 0 ether");
        
        transactionList.push(transactionStructs({
            from: msg.sender,
            to: _to,
            amount: _amount,
            message: _message
        }));

        transactionCount++;

        emit addTransactionEvent(msg.sender, _to, _amount, _message);
    }

    function transferEther(address payable _to) public payable {
        require(msg.value > 0, "Transfer amount must be more than 0 ether");

        (bool success, ) = _to.call{value: msg.value}("");
        require(success, "Transfer failed");

        emit transferEvent(msg.sender, _to, msg.value);
    }

    function getTransactions() public view returns(transactionStructs[] memory) {
        return transactionList;
    }

    function getTransactionCount() public view returns(uint256) {
        return transactionCount;
    }
}

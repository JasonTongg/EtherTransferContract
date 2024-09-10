const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Transfer Contract", function () {
  let Transfer, transfer, owner, addr1, addr2;

  // Deploy the contract before running the tests
  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners(); // Get the default signers (owner and others)
    const Transfer = await ethers.getContractFactory("Transfer"); // Load the contract factory
    transfer = await Transfer.deploy(); // Deploy the contract, no need to call .deployed()
  });

  it("should add a new transaction", async function () {
    const initialCount = await transfer.getTransactionCount(); // Get the initial transaction count

    const toAddress = addr1.address;
    const amount = ethers.parseEther("1.0"); // 1 ETH in wei
    const message = "Test transaction";

    // Add a new transaction
    await transfer.addTransaction(toAddress, amount, message);

    // Fetch all transactions
    const transactions = await transfer.getTransactions();
    const finalCount = await transfer.getTransactionCount();

    // Check if the transaction is added correctly
    expect(finalCount).to.equal(initialCount + BigInt(1));
    expect(transactions.length).to.equal(1);

    const transaction = transactions[0];

    expect(transaction.from).to.equal(owner.address); // msg.sender should be the owner
    expect(transaction.to).to.equal(toAddress);
    expect(transaction.amount.toString()).to.equal(amount.toString());
    expect(transaction.message).to.equal(message);
  });

  it("should emit addTransactionEvent when a transaction is added", async function () {
    const toAddress = addr1.address;
    const amount = ethers.parseEther("1.0"); // 1 ETH in wei
    const message = "Test transaction";

    // Expect the event to be emitted with the correct arguments
    await expect(transfer.addTransaction(toAddress, amount, message))
      .to.emit(transfer, "addTransactionEvent")
      .withArgs(owner.address, toAddress, amount, message);
  });

  it("should revert if the amount is 0", async function () {
    const toAddress = addr1.address;
    const amount = ethers.parseEther("0.0"); // 0 ETH
    const message = "Test transaction with 0 ETH";

    // Expect the transaction to fail with the correct error message
    await expect(
      transfer.addTransaction(toAddress, amount, message)
    ).to.be.revertedWith("Transfer amount must be more then 0 ether...");
  });

  it("should return all transaction list", async function () {
    const beforeTransactions = await transfer.getTransactions();
    const toAddress = addr1.address;
    const amount = ethers.parseEther("0.01");
    const message = "Testing Message";

    await transfer.addTransaction(toAddress, amount, message);

    const afterTransaction = await transfer.getTransactions();

    expect(beforeTransactions.length + 1).to.equal(afterTransaction.length);

    const lastTransaction = afterTransaction[afterTransaction.length - 1];
    expect(lastTransaction.from).to.equal(owner.address);
    expect(lastTransaction.to).to.equal(toAddress);
    expect(lastTransaction.amount.toString()).to.equal(amount.toString());
    expect(lastTransaction.message).to.equal(message);
  });

  it("should get current transaction count", async function () {
    const beforeTransactionCount = await transfer.getTransactionCount();

    const toAddress = addr1.address;
    const amount = ethers.parseEther("0.01");
    const message = "Testing Message";

    await transfer.addTransaction(toAddress, amount, message);

    const afterTransactionCount = await transfer.getTransactionCount();

    expect(beforeTransactionCount + BigInt(1)).to.equal(afterTransactionCount);
  });

  it("should transfe from address 1 to addres 2", async function () {
    const addr1Balance = await ethers.provider.getBalance(owner.address);
    const addr2Balance = await ethers.provider.getBalance(addr1.address);
    const amount = ethers.parseEther("0.01");

    const tx = await transfer.transferEther(addr1.address, {
      value: amount,
    });

    const receipt = await tx.wait();
    const gasUsed = receipt.gasUsed; // This should be defined
    const gasPrice = receipt.effectiveGasPrice || receipt.gasPrice; // Use either effectiveGasPrice or fallback to gasPrice
    const gasCost = gasUsed * BigInt(gasPrice);

    const afterAddr1Balance = await ethers.provider.getBalance(owner.address);
    const afterAddr2Balance = await ethers.provider.getBalance(addr1.address);

    expect(addr1Balance - BigInt(amount) - BigInt(gasCost)).to.equal(
      afterAddr1Balance
    );
    expect(addr2Balance + BigInt(amount)).to.equal(afterAddr2Balance);

    await expect(tx)
      .to.emit(transfer, "transferEvent")
      .withArgs(owner.address, addr1.address, amount);
  });

  it("Should revert if transaction failed due to insufficient balance", async function () {
    const ownerBalance = await ethers.provider.getBalance(owner.address);
    const amount = ownerBalance - ethers.parseEther("0.1");

    await expect(
      transfer.transferEther(addr1.address, { value: amount })
    ).to.be.revertedWith("Insufficient Balance...");
  });
});

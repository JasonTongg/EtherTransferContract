const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const ContractModule = buildModule("ContractModule", (m) => {
  const transfer = m.contract("Transfer");

  return { transfer };
});

module.exports = ContractModule;

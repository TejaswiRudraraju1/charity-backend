const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const DonationRegistry = await ethers.getContractFactory("DonationRegistry");
  const registry = await DonationRegistry.deploy();
  await registry.deployed();

  console.log("DonationRegistry deployed to:", registry.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

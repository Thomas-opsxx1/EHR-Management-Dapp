// Import the Hardhat Runtime Environment
const hre = require("hardhat");

async function main() {
  // Initial balance to set for the contract (in Ether)
  const initBalance = hre.ethers.utils.parseEther("1"); // Initial balance of 1 ETH
  const Assessment = await hre.ethers.getContractFactory("EHRManagement");
  const assessment = await Assessment.deploy(initBalance);


  await assessment.deployed();

  console.log(`Contract deployed to: ${assessment.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

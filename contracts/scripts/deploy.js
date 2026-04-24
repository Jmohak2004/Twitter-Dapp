const { ethers } = require("hardhat");

async function main() {
  const DecentralizedTwitter = await ethers.getContractFactory("DecentralizedTwitter");
  const twitter = await DecentralizedTwitter.deploy();
  await twitter.waitForDeployment();
  const address = await twitter.getAddress();
  console.log("DecentralizedTwitter deployed to:", address);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

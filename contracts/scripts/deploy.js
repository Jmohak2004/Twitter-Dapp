const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  if (hre.network.name === "sepolia") {
    if (!process.env.SEPOLIA_PRIVATE_KEY || String(process.env.SEPOLIA_PRIVATE_KEY).replace(/^0x/, "").length < 32) {
      console.error(
        "\nSet SEPOLIA_PRIVATE_KEY in contracts/.env (64 hex chars, optional 0x prefix). That account pays gas. Never commit this file.\n"
      );
      process.exit(1);
    }
  }

  const [deployer] = await ethers.getSigners();
  const net = await ethers.provider.getNetwork();
  const chainId = Number(net.chainId);

  console.log("Network:", hre.network.name, "chainId:", chainId);
  console.log("Deployer:", deployer.address);

  const DecentralizedTwitter = await ethers.getContractFactory("DecentralizedTwitter");
  const twitter = await DecentralizedTwitter.deploy();
  await twitter.waitForDeployment();
  const address = await twitter.getAddress();
  console.log("DecentralizedTwitter deployed to:", address);

  const repoRoot = path.join(__dirname, "..", "..");
  const clientEnv = path.join(repoRoot, "client", ".env");
  const serverEnv = path.join(repoRoot, "server", ".env");

  upsertEnvKey(clientEnv, "VITE_CONTRACT_ADDRESS", address);
  upsertEnvKey(serverEnv, "CONTRACT_ADDRESS", address);
  ensureServerPort(serverEnv);

  if (chainId === 11155111) {
    upsertEnvKey(clientEnv, "VITE_PREFERRED_CHAIN_ID", "11155111");
    console.log("Set client VITE_PREFERRED_CHAIN_ID=11155111 (Sepolia)");
  } else if (chainId === 31337) {
    upsertEnvKey(clientEnv, "VITE_PREFERRED_CHAIN_ID", "31337");
    console.log("Set client VITE_PREFERRED_CHAIN_ID=31337 (local Hardhat)");
  }

  console.log("Updated", path.relative(repoRoot, clientEnv));
  console.log("Updated", path.relative(repoRoot, serverEnv));
  console.log("\nRestart the Vite dev server (npm run dev) so the client picks up .env changes.");
}

/**
 * @param {string} file
 * @param {string} key
 * @param {string} value
 */
function upsertEnvKey(file, key, value) {
  let content = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  const re = new RegExp(`^${key}=.*$`, "m");
  const line = `${key}=${value}`;
  if (re.test(content)) {
    content = content.replace(re, line);
  } else {
    const sep = content.length > 0 && !content.endsWith("\n") ? "\n" : "";
    content = (content + sep + line + "\n").replace(/^\n+/, "");
  }
  fs.writeFileSync(file, content);
}

/** Ensure PORT=5001 exists in server .env (first-time only). */
function ensureServerPort(file) {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, "utf8");
  if (!/^PORT=/m.test(content)) {
    fs.writeFileSync(file, "PORT=5001\n" + content);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

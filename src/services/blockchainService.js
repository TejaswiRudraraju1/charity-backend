const { ethers } = require("ethers");
const path = require("path");
const fs = require("fs");

// Lazy-loaded contract instance
let donationRegistry;

function getContract() {
  if (donationRegistry) return donationRegistry;

  // Support both new and legacy env names for convenience
  const rpcUrl = process.env.ETH_RPC_URL || process.env.ETH_RPC;
  const privateKey = process.env.ETH_PRIVATE_KEY;
  const contractAddress =
    process.env.DONATION_REGISTRY_ADDRESS || process.env.CONTRACT_ADDRESS;

  if (!rpcUrl || !privateKey || !contractAddress) {
    console.warn(
      "⚠️ Blockchain env vars missing (ETH_RPC_URL/ETH_RPC / ETH_PRIVATE_KEY / DONATION_REGISTRY_ADDRESS/CONTRACT_ADDRESS). Skipping on-chain record."
    );
    return null;
  }

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    const artifactPath = path.join(
      __dirname,
      "../../blockchain/artifacts/contracts/DonationRegistry.sol/DonationRegistry.json"
    );

    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    donationRegistry = new ethers.Contract(
      contractAddress,
      artifact.abi,
      wallet
    );
    return donationRegistry;
  } catch (err) {
    console.error("Failed to init DonationRegistry contract:", err.message);
    return null;
  }
}

/**
 * Record a donation hash on-chain. Best-effort: failures won't break the request.
 * @param {Object} params
 * @param {string} params.entityId - e.g. donationId
 * @param {string} params.hash - hex string 0x...
 */
async function recordDonationOnChain({ entityId, hash }) {
  const contract = getContract();
  if (!contract) return null;

  try {
    // DonationRegistry.record(string entity, string entityId, bytes32 hash)
    const tx = await contract.record("donation", entityId, hash);
    const receipt = await tx.wait();
    return receipt.transactionHash;
  } catch (err) {
    console.error("recordDonationOnChain error:", err.message);
    return null;
  }
}

module.exports = {
  recordDonationOnChain,
};



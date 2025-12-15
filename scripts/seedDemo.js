// Simple seeding script to create demo NGOs, volunteers, causes and a test donation
// Run with: node scripts/seedDemo.js  (backend must be running on http://localhost:5000)

const axios = require("axios");
require("dotenv").config();

const API_BASE = process.env.SEED_API_BASE || "http://localhost:5000";

async function registerUser({ name, email, password, role }) {
  try {
    const res = await axios.post(`${API_BASE}/api/auth/register`, {
      name,
      email,
      password,
      role,
    });
    console.log(`✅ Registered ${role} ${email}`);
    return res.data;
  } catch (err) {
    if (err.response && err.response.status === 409) {
      console.log(`ℹ️ User already exists: ${email}, logging in instead`);
      const login = await axios.post(`${API_BASE}/api/auth/login`, {
        email,
        password,
      });
      return login.data;
    }
    console.error(
      `❌ Failed to register ${email}:`,
      err.response?.data || err.message
    );
    throw err;
  }
}

async function createCause(token, payload) {
  const res = await axios.post(`${API_BASE}/api/causes`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`✅ Created cause "${payload.title}"`);
  return res.data.cause;
}

async function createAndVerifyDonation(token, causeId, amount) {
  const intent = await axios.post(
    `${API_BASE}/api/donations/create`,
    { causeId, amount },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  console.log(
    `✅ Created donation intent orderId=${intent.data.payment.orderId}`
  );

  const verify = await axios.post(`${API_BASE}/api/donations/verify`, {
    donationId: intent.data.donationId,
    status: "SUCCESS",
    txDetails: {
      provider: "paytm-sandbox-demo",
      orderId: intent.data.payment.orderId,
      mock: true,
    },
  });

  const d = verify.data.donation;
  console.log(
    `✅ Verified donation amount=${d.amount}, hash=${d.hash}, onChainTx=${d.onChainTx}`
  );
  return d;
}

async function main() {
  console.log("🚀 Seeding demo NGOs, causes, and a test donation...");

  // 1) Register NGOs
  const ngos = [
    {
      name: "GreenHope Foundation",
      email: "ngo.greenhope@example.com",
      password: "Password123!",
    },
    {
      name: "EduLift Trust",
      email: "ngo.edulift@example.com",
      password: "Password123!",
    },
    {
      name: "HealthBridge NGO",
      email: "ngo.healthbridge@example.com",
      password: "Password123!",
    },
  ];

  const ngoResults = [];
  for (const ngo of ngos) {
    const { user, token } = await registerUser({
      ...ngo,
      role: "ngo",
    });
    ngoResults.push({ user, token });
  }

  // 2) Create causes for each NGO
  const causes = [];
  const causePayloads = [
    {
      title: "Plant 500 native trees in Bangalore",
      description:
        "Community-driven plantation drive focusing on native species in peri-urban areas.",
      requiredAmount: 50000,
      location: "Bengaluru, Karnataka",
      volunteersRequired: 40,
    },
    {
      title: "Sponsor digital kits for 50 rural students",
      description:
        "Provide tablets and internet access for government school students.",
      requiredAmount: 120000,
      location: "Anantapur, Andhra Pradesh",
      volunteersRequired: 20,
    },
    {
      title: "Free weekend health camp",
      description:
        "Mobile health camp providing basic checkups and medicines in underserved areas.",
      requiredAmount: 80000,
      location: "Hyderabad, Telangana",
      volunteersRequired: 30,
    },
    {
      title: "Women self-help skill training",
      description:
        "Skill development workshops for women-led SHGs (tailoring and micro-entrepreneurship).",
      requiredAmount: 100000,
      location: "Mysuru, Karnataka",
      volunteersRequired: 25,
    },
  ];

  let causeIndex = 0;
  for (const ngo of ngoResults) {
    // Each NGO gets at least one cause
    const basePayload = causePayloads[causeIndex % causePayloads.length];
    causes.push(await createCause(ngo.token, basePayload));
    causeIndex++;

    // First NGO gets an extra cause to populate the list more
    if (ngo === ngoResults[0]) {
      const extraPayload = causePayloads[causeIndex % causePayloads.length];
      causes.push(await createCause(ngo.token, extraPayload));
      causeIndex++;
    }
  }

  // 3) Register a volunteer and make a test donation into the first cause
  const { user: volUser, token: volToken } = await registerUser({
    name: "Demo Volunteer",
    email: "vol.demo@example.com",
    password: "Password123!",
    role: "volunteer",
  });
  console.log("✅ Demo volunteer ready:", volUser.email);

  const targetCause = causes[0];
  console.log(
    `ℹ️ Creating test donation into cause "${targetCause.title}" (${targetCause._id})`
  );

  await createAndVerifyDonation(volToken, targetCause._id, 500);

  console.log(
    "✅ Seeding complete. You can now log in as NGOs/volunteer using the seeded accounts."
  );
  console.log("NGO emails:", ngos.map((n) => n.email).join(", "));
  console.log("Volunteer email: vol.demo@example.com");
}

main().catch((err) => {
  console.error("Seed script failed:", err.message);
  process.exit(1);
});



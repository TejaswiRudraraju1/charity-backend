const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

// register
async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success:false, message: "name, email and password required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ success:false, message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role: role || "volunteer" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    const safeUser = { id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };

    return res.status(201).json({ success:true, user: safeUser, token });
  } catch (err) {
    console.error("auth.register err:", err);
    return res.status(500).json({ success:false, message: "Server error" });
  }
}

// login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success:false, message: "email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success:false, message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ success:false, message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    const safeUser = { id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };

    return res.json({ success:true, user: safeUser, token });
  } catch (err) {
    console.error("auth.login err:", err);
    return res.status(500).json({ success:false, message: "Server error" });
  }
}

module.exports = { register, login };

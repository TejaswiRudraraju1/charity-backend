const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

function verifyToken(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ success:false, message: "No token provided" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, role, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ success:false, message: "Invalid token" });
  }
}

// role guard: usage app.get('/foo', authRole('ngo'), handler)
function authRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success:false, message: "Not authenticated" });
    if (req.user.role !== role) return res.status(403).json({ success:false, message: "Forbidden" });
    next();
  };
}

module.exports = { verifyToken, authRole };

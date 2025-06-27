const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]; // Bearer <token>
  const token = authHeader && authHeader.split(" ")[1]; // Extract token part

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to the request
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(403).json({ error: "Invalid or expired token." });
  }
};

module.exports = authenticateToken;

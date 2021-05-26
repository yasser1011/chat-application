const jwt = require("jsonwebtoken");
require("dotenv").config();

function auth(req, res, next) {
  try {
    const token = req.headers["x-auth-token"];
    if (!token) {
      return res.status(401).json({ msg: "not allowed" });
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) {
      return res.status(401).json({ msg: "token verification failed" });
    }
    req.user = verified.id;
    next();
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

module.exports = { auth };

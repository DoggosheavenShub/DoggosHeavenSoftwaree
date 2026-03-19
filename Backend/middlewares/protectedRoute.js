const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.protectedRoute = async (req, res, next) => {
  try {
    const token = req?.headers["authorization"]?.trim() || req?.query?.token || null;

    if (!token) {
      return res.status(401).json({ success: false, status: 401, message: "Unauthorized - Access" });
    }

    const decoded = jwt.decode(token);
    if (!decoded) {
      return res.status(401).json({ success: false, status: 401, message: "Invalid token format" });
    }

    const exp = decoded.exp;
    if (exp && exp < Math.floor(Date.now() / 1000)) {
      return res.status(401).json({ success: false, status: 401, message: "Session expired, please log in again" });
    }

    const verifiedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!verifiedToken) {
      return res.status(401).json({ success: false, status: 401, message: "Unauthorized - Access" });
    }

    const user = await User.findOne({
      email: verifiedToken?.userEmail || verifiedToken?.email,
    }).select("-password");

    if (!user) {
      return res.status(401).json({ success: false, message: "No such user exist unauthorised access" });
    }

    req.user = user;
    req.userRole = user.role;
    req.userId = user._id;

    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
    }
    next();
  };
};

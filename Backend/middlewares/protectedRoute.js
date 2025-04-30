const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.protectedRoute = async (req, res, next) => {
  try {
    const token = req?.headers["authorization"]?.trim()||null
    
    if (!token) {
      return res
        .status(401)
        .json({ success: false,status:401, message: "Unauthorized - Access" });
    }
    
    const exp = jwt.decode(token).exp;

    if (exp && exp < Math.floor(Date.now() / 1000)) {
      return res
        .status(401)
        .json({success:false,status:401,message: "Session expired, please log in again" });
    }
   
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!decoded) {
      return res
        .status(401)
        .json({ success: false,status:401, message: "Unauthorized - Access" });
    }

    const user = await User.findOne({
      email: decoded?.userEmail,
    }).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "No such user exist unauthorised access",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const User = require("../models/user");
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcrypt");
const SubscriptionPlan=require("../models/subscriptionPlan");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || "" 
    );

    if (!user || !isPasswordCorrect) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken(user?.email);

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
	  token
    });

  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({success:false, message: "Internal Server Error" });
  }
};

const User = require("../models/user");
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcrypt");


exports.signUp = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and password are required"
      });
    }

    // Validate role
    if (role && role !== 'admin' && role !== 'staff' && role !== 'customer') {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'admin', 'staff' or 'customer'"
      });
    }

    const userRole = role || 'staff';

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address"
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: userRole,
      isActive: true,
      createdAt: new Date()
    });

    // Create customer profile if needed (optional)
    // const customer = await Customer.create({
    //   user_id: user._id,
    //   wallet_balance: 0,
    //   total_pets: 0
    // });

    return res.status(201).json({
      success: true,
      message: `${userRole === 'staff' ? 'Staff' : 'Admin'} account created successfully`,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.log("Error in register controller:", error.message);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};


exports.adminSignUp = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: "Full name, email, and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User with this email already exists" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'admin',
    });

    return res.status(201).json({
      success: true,
      message: "Admin account created successfully",
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role }
    });

  } catch (error) {
    console.log("Error in admin register controller:", error.message);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
exports.updateProfile = async (req, res) => {
  try {
    const token = req?.headers["authorization"]?.trim();
    if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

    const jwt = require("jsonwebtoken");
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    const { fullName, phone } = req.body;
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, message: "Full name is required" });
    }
    if (phone && !/^[0-9]{10}$/.test(phone.trim())) {
      return res.status(400).json({ success: false, message: "Phone number must be exactly 10 digits" });
    }

    const user = await User.findOneAndUpdate(
      { email: decoded.userEmail || decoded.email },
      { fullName: fullName.trim(), phone: phone?.trim() || "" },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: { id: user._id, fullName: user.fullName, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (error) {
    console.log("Error in updateProfile:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const token = req?.headers["authorization"]?.trim();
    if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

    const jwt = require("jsonwebtoken");
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: "Both current and new password are required" });

    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });

    const user = await User.findOne({ email: decoded.userEmail || decoded.email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.log("Error in changePassword:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    // console.log(email, password, role);


    // Find user with email and role
    const user = await User.findOne({ email: email.toLowerCase().trim(), role });

    // console.log(user);

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found with this role" });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!isPasswordCorrect) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }

    // Generate token with role information
    const token = generateToken(user?.email, user?.role, user?._id);

    // Prepare response data
    let responseData = {
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      id: user._id
    };

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: responseData,
      token
    });

  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

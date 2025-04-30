const jwt = require("jsonwebtoken");

const generateToken = (email) => {
  const token = jwt.sign({userEmail:email}, process.env.JWT_SECRET_KEY, {
    expiresIn: "4h",
  });
  return token
};

module.exports = generateToken;

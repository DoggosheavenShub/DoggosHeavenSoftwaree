const express = require('express');
const { login, signUp, adminSignUp, changePassword } = require('../controllers/authController');

const router = express.Router();

router.post("/login", login);
router.post("/signup", signUp);
router.post("/admin-signup", adminSignUp);
router.put("/changepassword", changePassword);

module.exports = router;
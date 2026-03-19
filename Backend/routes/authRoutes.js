const express =require('express');
const { login, signUp, adminSignUp } = require('../controllers/authController');

const router=express.Router();

router.post("/login", login);
router.post("/signup", signUp);
router.post("/admin-signup", adminSignUp);

module.exports=router
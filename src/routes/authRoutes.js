const express = require('express');
const router = express.Router();
const { registerUser,getUserProfile, loginUser } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

//Base route: /api/auth

router.post('/register-user', registerUser); 
router.post('/login-user', loginUser); 

router.get('/user-profile', protect, getUserProfile); 

module.exports = router;
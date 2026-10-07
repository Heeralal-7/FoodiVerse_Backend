const express = require('express');
const router = express.Router();
const { registerUser,getUserProfile } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

//Base route: /api/auth

router.post('/register-user', registerUser); 

router.get('/user-profile', protect, getUserProfile); 

module.exports = router;
const express = require('express');
const router = express.Router();
const { registerUser,getUserProfile, loginUser, updateUserProfile } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { profileUpload } = require('../middlewares/multer');

//Base route: /api/auth

router.post('/register-user', registerUser); 
router.post('/login-user', loginUser); 

router.get('/user-profile', protect, getUserProfile); 
router.put('/user-profile/update', protect,profileUpload,updateUserProfile); 

module.exports = router;
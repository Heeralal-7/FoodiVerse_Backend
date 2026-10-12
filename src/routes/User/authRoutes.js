const express = require('express');
const router = express.Router();
const { registerUser,getUserProfile, loginUser, updateUserProfile } = require('../../controllers/User/authController');
const { protect } = require('../../middlewares/authMiddleware');
const { profileUpload } = require('../../middlewares/multer');

//Base route: /api/auth

router.post('/register-user', registerUser); 
router.post('/login-user', loginUser); 

router.get('/user-profile',protect('user'), getUserProfile); 
router.put('/user-profile/update', protect('user'),profileUpload,updateUserProfile); 

module.exports = router;
const User = require('../../models/usersModel');
const bcrypt = require('bcryptjs');
const generateToken = require('../../utils/generateToken');
const { deleteFile } = require('../../utils/fileHandler'); 


// Register a new user / admin / vendor / driver
// @route POST /api/auth/register-user
const registerUser = async (req, res) => {
  try {
    // 1. 'role' ko bhi destructure karein
    const { name, email, password, phone, role } = req.body;

    // 2. Validate user input
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields',
      });
    }

    // 3. Check if user already exists (Clean email & phone check)
    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone.trim();

    const userExists = await User.findOne({
      $or: [{ email: cleanEmail }, { phone: cleanPhone }],
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or phone number',
      });
    }

    // 4. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create new user with ROLE
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      phone: cleanPhone,
      role: role || 'user', // 👈 Agar role pass kiya hai toh wo save hoga, nahi toh 'user'
    });

    // 6. Generate token
    const token = generateToken(user._id, user.role);

    // 7. Send response (role ke sath)
    res.status(201).json({
      success: true,
      message: `${user.role.toUpperCase()} registered successfully!`,
      token: token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role, // 👈 Response me role dikhega
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

const getUserProfile = async (req, res) => {
    try {
  
      const user = await User.findById(req.user._id)
        .select('-password');
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
  
      res.status(200).json({
        success: true,
        data: user
      });
  
    } catch (error) {
  
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
  
    }
  };
  const loginUser = async (req, res) => {
    try {
      const { email, phone, password } = req.body;
  

      if (!password || (!email && !phone)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide password and either email or phone number',
        });
      }
  
      // 2. Query criteria
      const queryConditions = [];
      if (email) queryConditions.push({ email: email.toLowerCase().trim() });
      if (phone) queryConditions.push({ phone: phone.trim() });
  
      // 3. User ko find karein
      const user = await User.findOne({ $or: queryConditions });
  
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials! User not found.',
        });
      }
  
      // 4. Check karein ki user account Active hai ya nahi
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been deactivated. Please contact support.',
        });
      }
  
      // 5. Password Compare karein (bcrypt.compare)
      const isPasswordMatch = await bcrypt.compare(password, user.password);
  
      if (!isPasswordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials! Password does not match.',
        });
      }
  
      // 6. JWT Token generate karein
      const token = generateToken(user._id, user.role);
  
      // 7. Success Response bhejein (Password hata kar)
      return res.status(200).json({
        success: true,
        message: 'Login successful!',
        token,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profileImage: user.profileImage,
          assignedTabs: user.assignedTabs, // Sub-Admin dashboard ke access ke liye
        },
      });
  
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Server error during login',
        error: error.message,
      });
    }
  };
    
  // @desc    Update User Profile
  // @route   PUT /api/auth/profile
  // @access  Private (JWT Token Required)
  const updateUserProfile = async (req, res) => {
    try {
      // 1. Current logged-in user ko find karein
      const user = await User.findById(req.user._id);
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }
  
      // 2. Normal text fields update karein (agar request me bheje gaye hon)
      if (req.body.name) user.name = req.body.name.trim();
      if (req.body.phone) user.phone = req.body.phone.trim();
  
      if (req.file) {
        // Purani photo delete karein
        if (user.profileImage) {
          deleteFile(user.profileImage);
        }
      
        // Windows path fix ('\') aur 'public/' ko remove karke clean path banana:
        const cleanPath = req.file.path.replace(/\\/g, '/').replace(/^public\//, '');
        
        user.profileImage = cleanPath; // Ab DB me 'uploads/profiles/...' save hoga
      }
  
      // 4. Password update (agar user ne naya password bheja ho)
      if (req.body.password) {
        if (req.body.password.length < 6) {
          return res.status(400).json({
            success: false,
            message: 'Password must be at least 6 characters long',
          });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }
  
      // 5. Database me save karein
      const updatedUser = await user.save();
  
      // 6. Response return karein (Password chhod kar)
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully!',
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role,
          profileImage: updatedUser.profileImage,
        },
      });
  
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Server error while updating profile',
        error: error.message,
      });
    }
  };
           



module.exports = {
    registerUser,
    getUserProfile,
    loginUser,
    updateUserProfile
}
const User = require('../models/usersModel');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

//     Register a new user
// @route  POST /api/auth/register-user
const registerUser = async (req, res) => {

try {
    //get data from request body
    const{ name, email, password, phone } = req.body;

    //Validate user input
    if(!name||!email||!password||!phone){
        return res.status(400).json({
            message: 'Please fill all fields'
        })
    }

    //check if user already exists

    const userExists = await User.findOne({ $or: [{ email:email.toLowerCase().trim() }, { phone }] });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //create new user
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone
    });

    // generate token
    const token = generateToken(user._id, user.role);

    //send response
    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token: token,
        data: {
            id:user._id,
            name:user.name,
            email:user.email,
            phone:user.phone
        },
    });

}  catch (error) {
    res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
    });
}
}

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
    
  


module.exports = {
    registerUser,
    getUserProfile,
    loginUser
}
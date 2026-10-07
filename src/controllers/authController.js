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

    const userExists = await User.findOne({ email, phone });
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

module.exports = {
    registerUser,
    getUserProfile
}
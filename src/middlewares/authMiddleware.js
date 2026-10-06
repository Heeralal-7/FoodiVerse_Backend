// src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/usersModel');

// 1. Protect Route (Verify JWT Token)
const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123');

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user || !req.user.isActive) {
        return res.status(401).json({ success: false, message: 'User account not active or not found' });
      }
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided' });
  }
};

// 2. Role Based Authorization (e.g. authorizeRoles('admin', 'vendor'))
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user.role}) is not allowed to access this resource`,
      });
    }
    next();
  };
};

// 3. Dynamic Sub-Admin Tab Permission Middleware
// action can be: 'canView' | 'canAdd' | 'canEdit' | 'canDelete'
const checkTabPermission = (tabId, action = 'canView') => {
  return (req, res, next) => {
    // Super Admin ke paas full access hota hai
    if (req.user.role === 'admin') {
      return next();
    }

    // Sub-Admin Permission Verification
    if (req.user.role === 'subadmin') {
      const permission = req.user.assignedTabs.find((t) => t.tabId === tabId);

      if (permission && permission[action]) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: `Permission Denied: You do not have '${action}' access to this section.`,
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Unauthorized access',
    });
  };
};

module.exports = { protect, authorizeRoles, checkTabPermission };
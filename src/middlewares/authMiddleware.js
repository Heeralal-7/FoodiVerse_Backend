// src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/usersModel');
const Tab = require('../models/tabModel'); // Global tab status check ke liye

/**
 * 1. PROTECT MIDDLEWARE (Role / Model Type Verification)
 * Usage Examples:
 *   protect('user')
 *   protect('vendor')
 *   protect('driver')
 *   protect(['admin', 'subadmin'])
 */
const protect = (allowedRoles = []) => {
  return async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        token = req.headers.authorization.split(' ')[1];

        // Development mode me token expire na ho (optional)
        const verifyOptions = process.env.NODE_ENV === 'development' ? { ignoreExpiration: true } : {};
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'foodiverse_secret_key_2026_super_safe', verifyOptions);

        // Fetch user from DB
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
          return res.status(401).json({ success: false, message: 'User not found or deleted' });
        }

        // Account Active Check
        if (user.isActive === false) {
          return res.status(403).json({ success: false, message: 'Account is deactivated. Please contact admin.' });
        }

        // Role / Model Matching Logic
        if (allowedRoles && allowedRoles.length > 0) {
          const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

          // Superadmin / Main Admin ko har jagah bypass milta hai
          const isAdmin = ['admin', 'superadmin'].includes(user.role);

          if (!isAdmin && !rolesArray.includes(user.role)) {
            return res.status(403).json({
              success: false,
              message: `Access Denied: Only [${rolesArray.join(', ')}] can access this resource. Your role is '${user.role}'`,
            });
          }
        }

        req.user = user;
        next();
      } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        return res.status(401).json({ success: false, message: 'Not authorized, invalid or expired token' });
      }
    } else {
      return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }
  };
};

/**
 * 2. DYNAMIC TAB ACCESS CHECK (PHP / SQL Style Tab IDs like 1, 5, 16...)
 * Usage Example:
 *   checkRoleAccess(16) // Tab 16 = Food Items
 */
const checkRoleAccess = (tabId, requiredAction = 'canView') => {
  return async (req, res, next) => {
    try {
      // 1. Superadmin / Main Admin bypass
      if (['admin', 'superadmin'].includes(req.user.role)) {
        return next();
      }

      // 2. Global Tab Status Check (Admin ne global tab band toh nahi kiya?)
      const globalTab = await Tab.findOne({ tabId: Number(tabId), isActive: true });
      if (!globalTab) {
        return res.status(403).json({
          success: false,
          message: 'This module is temporarily disabled by Admin',
        });
      }

      // 3. Sub-admin Permission Check
      if (req.user.role === 'subadmin') {
        const assignedTabs = req.user.assignedTabs || [];

        // Check if assignedTabs array has numbers [1, 5, 16] OR objects [{ tabId: 16, canView: true }]
        const tabPermission = assignedTabs.find((t) => {
          if (typeof t === 'number') return t === Number(tabId);
          return t.tabId === Number(tabId);
        });

        if (!tabPermission) {
          return res.status(403).json({
            success: false,
            message: 'Access Denied: You do not have permission for this module.',
          });
        }

        // Agar object format me action permissions hain (canAdd, canEdit, etc.)
        if (typeof tabPermission === 'object' && tabPermission[requiredAction] === false) {
          return res.status(403).json({
            success: false,
            message: `Access Denied: You do not have '${requiredAction}' permission for this tab.`,
          });
        }

        return next(); // Subadmin permission granted
      }

      return res.status(403).json({
        success: false,
        message: 'Access Denied: Unauthorized role for this section.',
      });
    } catch (error) {
      console.error("Tab Access Check Error:", error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  };
};

/**
 * 3. LOCATION FILTER HELPER (City / Area filtering for Vendors/Drivers/Orders)
 */
const getLocationFilter = (req) => {
  if (['admin', 'superadmin'].includes(req.user.role)) return {};

  const access = req.user.locationAccess || {};
  let filter = {};

  if (access.city) filter['city'] = access.city;
  if (access.state) filter['state'] = access.state;
  if (access.pincode) filter['pincode'] = access.pincode;

  return filter;
};

module.exports = {
  protect,
  checkRoleAccess,
  getLocationFilter,
};
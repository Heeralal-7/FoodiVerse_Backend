// src/routes/admin/foodRoutes.js
const express = require('express');
const router = express.Router();

const {
  createFood,
  getAllFoods,
  getFoodById,
  updateFood,
  deleteFood,
  toggleFoodStatus,
} = require('../../controllers/admin/foodController');

const { protect, checkRoleAccess } = require('../../middlewares/authMiddleware');
const { foodUpload } = require('../../middlewares/multer');

// Tab ID 16 = Food Items (seedTabs.js ke according)

// Base route: /api/admin/foods

// 1. Create Food
router.post(
  '/create',
  protect(['admin', 'subadmin']),
  checkRoleAccess(16, 'canAdd'),
  foodUpload,
  createFood
);

// 2. Get All Foods (View)
router.get(
  '/all',
  protect(['admin', 'subadmin']),
  checkRoleAccess(16, 'canView'),
  getAllFoods
);

// 3. Get Single Food Details
router.get(
  '/detail/:id',
  protect(['admin', 'subadmin']),
  checkRoleAccess(16, 'canView'),
  getFoodById
);

// 4. Update Food
router.put(
  '/update/:id',
  protect(['admin', 'subadmin']),
  checkRoleAccess(16, 'canEdit'),
  foodUpload,
  updateFood
);

// 5. Delete Food
router.delete(
  '/:id',
  protect(['admin', 'subadmin']),
  checkRoleAccess(16, 'canDelete'),
  deleteFood
);

// 6. Toggle Status (Active / Inactive)
router.patch(
  '/:id/toggle-status',
  protect(['admin', 'subadmin']),
  checkRoleAccess(16, 'canEdit'),
  toggleFoodStatus
);

module.exports = router;
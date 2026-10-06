// src/middlewares/multer.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Helper to auto-create directory if not exists
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// Common file filter (Images only or Image + PDF for docs)
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith('image/') ||
    file.mimetype === 'application/pdf'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only Image and PDF files are allowed!'), false);
  }
};

// ----------------------------------------------------
// 1. FOOD & DISHES UPLOAD CONFIGURATION
// ----------------------------------------------------
const foodDir = 'public/uploads/foods';
ensureDir(foodDir);

const foodUploads = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, foodDir),
    filename: (req, file, cb) =>
      cb(null, `food-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
  }),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'galleryImages', maxCount: 5 },
]);

// ----------------------------------------------------
// 2. VENDOR / RESTAURANT PROFILE & KYC UPLOADS
// ----------------------------------------------------
const vendorDir = 'public/uploads/vendors';
ensureDir(vendorDir);

const vendorUploads = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, vendorDir),
    filename: (req, file, cb) =>
      cb(null, `vendor-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
  }),
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).fields([
  { name: 'logo', maxCount: 1 },
  { name: 'bannerImage', maxCount: 1 },
  { name: 'fssaiCertificate', maxCount: 1 },
  { name: 'gstCertificate', maxCount: 1 },
  { name: 'menuCardImages', maxCount: 10 },
  { name: 'restaurantImages', maxCount: 10 },
]);

// ----------------------------------------------------
// 3. DRIVER / RIDER KYC UPLOADS
// ----------------------------------------------------
const driverDir = 'public/uploads/drivers';
ensureDir(driverDir);

const driverUploads = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, driverDir),
    filename: (req, file, cb) =>
      cb(null, `driver-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
  }),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'drivingLicense', maxCount: 1 },
  { name: 'rcBook', maxCount: 1 },
  { name: 'aadhaarOrIdProof', maxCount: 1 },
]);

// ----------------------------------------------------
// 4. APP / WEB BANNERS & PROMOTIONS
// ----------------------------------------------------
const bannerDir = 'public/uploads/banners';
ensureDir(bannerDir);

const bannerUploads = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, bannerDir),
    filename: (req, file, cb) =>
      cb(null, `banner-${Date.now()}${path.extname(file.originalname)}`),
  }),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('bannerImage');

module.exports = {
  foodUploads,
  vendorUploads,
  driverUploads,
  bannerUploads,
};
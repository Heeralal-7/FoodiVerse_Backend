// src/models/foodVendor.js 
const mongoose = require('mongoose'); 

const restaurantSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Vendor ID is required for a restaurant'],
      index: true,
    },
    branchName: { type: String, default: 'Main Branch' },
    outletCode: { type: String, trim: true },
    restaurantName: { type: String, required: true },
    fssaiLicense: { type: String, required: true },
    gstNumber: { type: String },
    cuisines: [String], // ['North Indian', 'Chinese', 'Biryani']
    bannerImage: { type: String },
    openingTime: { type: String, default: '10:00 AM' },
    closingTime: { type: String, default: '11:00 PM' },

    // 📍 GeoJSON Location Format (Mandatory for Distance calculation)
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    address: {
      street: String,
      city: String,
      pincode: String,
    },

    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      bankName: String,
    },
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ⚡ 2dsphere index for geospatial queries
restaurantSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Restaurant', restaurantSchema);
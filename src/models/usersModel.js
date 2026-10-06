const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, default: '' },
    profileImage: { type: String, default: '' },

    // Core Roles
    role: {
      type: String,
      enum: ['user', 'vendor', 'driver', 'subadmin', 'admin'],
      default: 'user',
    },

    // Sub-admin RBAC (Assigned Tab IDs array)
    assignedTabs: [
      {
        tabId: { type: Number },
        canView: { type: Boolean, default: true },
        canAdd: { type: Boolean, default: false },
        canEdit: { type: Boolean, default: false },
        canDelete: { type: Boolean, default: false },
      },
    ],

    isActive: { type: Boolean, default: true },
    addresses: [
      {
        street: String,
        city: String,
        state: String,
        pincode: String,
        isDefault: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
const restaurantSchema = new mongoose.Schema({
    owner: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    restaurantName: { type: String, required: true },
    fssaiLicense: { type: String, required: true },
    gstNumber: { type: String },
    cuisines: [String], // ['North Indian', 'Chinese', 'Biryani']
    bannerImage: { type: String },
    openingTime: { type: String, default: '10:00 AM' },
    closingTime: { type: String, default: '11:00 PM' },
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      bankName: String,
    },
    isApproved: { type: Boolean, default: false } // Admin approval
  }, { timestamps: true });
  
  module.exports = mongoose.model('Restaurant', restaurantSchema);
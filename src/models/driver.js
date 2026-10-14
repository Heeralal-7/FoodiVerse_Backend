const driverSchema = new mongoose.Schema({
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    vehicleType: { type: String, enum: ['Bike', 'Scooter', 'Cycle'], default: 'Bike' },
    vehicleNumber: { type: String, required: true },
    drivingLicenseNumber: { type: String, required: true },
    drivingLicenseImage: { type: String },
    isOnline: { type: Boolean, default: false }, // Shift on/off
    currentLocation: {
      latitude: Number,
      longitude: Number,
    },
    isApproved: { type: Boolean, default: false }
  }, { timestamps: true });
  
  module.exports = mongoose.model('Driver', driverSchema);
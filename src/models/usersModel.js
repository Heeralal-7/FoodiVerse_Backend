const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin', 'rider'], default: 'customer' },
    phone: { type: String },
    addresses: [{
      street: String,
      city: String,
      pincode: String,
      isDefault: Boolean
    }]
  }, { timestamps: true });
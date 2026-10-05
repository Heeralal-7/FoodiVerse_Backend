const foodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    image: { type: String, required: true }, // Cloudinary URL
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    isVeg: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    prepTime: { type: String, default: '20-30 mins' }
  }, { timestamps: true });
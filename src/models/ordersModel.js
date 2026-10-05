const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
      food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food' },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    deliveryAddress: { type: Object, required: true },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    orderStatus: { 
      type: String, 
      enum: ['Placed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'], 
      default: 'Placed' 
    },
    paymentMethod: { type: String, enum: ['COD', 'Online'], required: true }
  }, { timestamps: true });
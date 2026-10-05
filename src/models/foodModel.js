const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide food name'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Please provide food price'],
    },
    image: {
      type: String,
      required: [true, 'Please provide food image URL'],
    },
    category: {
      type: String,
      required: [true, 'Please provide food category'], // e.g. Pizza, Burger, Desserts
      trim: true,
    },
    isVeg: {
      type: Boolean,
      default: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    prepTime: {
      type: String,
      default: '20-30 mins',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Food', foodSchema);
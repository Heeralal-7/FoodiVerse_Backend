// src/controllers/admin/foodController.js
const Food = require('../../models/foodModel');
const { deleteFile } = require('../../utils/fileHandler');

// 1. CREATE FOOD ITEM
// @route   POST /api/admin/foods/create
const createFood = async (req, res) => {
  try {
    const { name, description, price, category, isVeg, prepTime } = req.body;

    // Validation
    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, and category are required!',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Food image is required!',
      });
    }

    // Clean image path (public/ hata kar)
    const imagePath = req.file.path.replace(/\\/g, '/').replace(/^public\//, '');

    const food = await Food.create({
      name: name.trim(),
      description: description || '',
      price: Number(price),
      category: category.trim(),
      image: imagePath,
      isVeg: isVeg === 'true' || isVeg === true,
      prepTime: prepTime || '20-30 mins',
      isAvailable: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Food item created successfully!',
      data: food,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error creating food item',
      error: error.message,
    });
  }
};

// 2. GET ALL FOOD ITEMS (With Search, Filter & Pagination)
// @route   GET /api/admin/foods/all
const getAllFoods = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category, isVeg, isAvailable } = req.query;

    let filter = {};

    // Search by Name
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    // Category Filter
    if (category) {
      filter.category = category;
    }

    // Veg / Non-Veg Filter
    if (isVeg !== undefined) {
      filter.isVeg = isVeg === 'true';
    }

    // Status Filter (Available or Not)
    if (isAvailable !== undefined) {
      filter.isAvailable = isAvailable === 'true';
    }

    const skip = (Number(page) - 1) * Number(limit);

    const foods = await Food.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalRecords = await Food.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: foods,
      pagination: {
        totalRecords,
        currentPage: Number(page),
        totalPages: Math.ceil(totalRecords / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error fetching foods',
      error: error.message,
    });
  }
};

// 3. GET SINGLE FOOD BY ID
// @route   GET /api/admin/foods/detail/:id
const getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found!',
      });
    }

    return res.status(200).json({
      success: true,
      data: food,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error fetching food details',
      error: error.message,
    });
  }
};

// 4. UPDATE FOOD ITEM (With auto-delete old image)
// @route   PUT /api/admin/foods/update/:id
const updateFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found!',
      });
    }

    // Text fields update
    if (req.body.name) food.name = req.body.name.trim();
    if (req.body.description !== undefined) food.description = req.body.description;
    if (req.body.price) food.price = Number(req.body.price);
    if (req.body.category) food.category = req.body.category.trim();
    if (req.body.prepTime) food.prepTime = req.body.prepTime;
    if (req.body.isVeg !== undefined) food.isVeg = req.body.isVeg === 'true' || req.body.isVeg === true;

    // Nayi photo aayi ho toh purani photo delete karo
    if (req.file) {
      if (food.image) {
        deleteFile(food.image);
      }
      food.image = req.file.path.replace(/\\/g, '/').replace(/^public\//, '');
    }

    const updatedFood = await food.save();

    return res.status(200).json({
      success: true,
      message: 'Food item updated successfully!',
      data: updatedFood,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error updating food item',
      error: error.message,
    });
  }
};

// 5. DELETE FOOD ITEM (Auto-delete image from disk)
// @route   DELETE /api/admin/foods/:id
const deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found!',
      });
    }

    // Server se photo delete karein
    if (food.image) {
      deleteFile(food.image);
    }

    await Food.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Food item deleted successfully along with its image!',
      deletedId: req.params.id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error deleting food item',
      error: error.message,
    });
  }
};

// 6. TOGGLE ACTIVE / AVAILABLE STATUS (1-Click Switch)
// @route   PATCH /api/admin/foods/:id/toggle-status
const toggleFoodStatus = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found!',
      });
    }

    // Status toggle (true ko false, false ko true)
    food.isAvailable = !food.isAvailable;
    await food.save();

    return res.status(200).json({
      success: true,
      message: `Food item is now ${food.isAvailable ? 'Available (Active)' : 'Unavailable (Inactive)'}`,
      data: {
        _id: food._id,
        name: food.name,
        isAvailable: food.isAvailable,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error toggling food status',
      error: error.message,
    });
  }
};

module.exports = {
  createFood,
  getAllFoods,
  getFoodById,
  updateFood,
  deleteFood,
  toggleFoodStatus,
};
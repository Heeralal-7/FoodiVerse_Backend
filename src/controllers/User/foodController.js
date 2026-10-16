// src/controllers/User/foodController.js
const Restaurant = require('../../models/foodVendor');
const Food = require('../../models/foodModel');
const {
  calculateDeliveryTime,
  calculateDeliveryFee,
} = require('../../utils/distanceHelper');

// @desc    Get foods from nearest restaurants based on user lat/long
// @route   POST /api/user/foods/nearby
// @access  Public
const getNearbyFoods = async (req, res) => {
  try {
    const { latitude, longitude, radiusInKm = 10, category, isVeg, sortBy } = req.body;

    // 1. Validation
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and Longitude are required!',
      });
    }

    const userLat = Number(latitude);
    const userLong = Number(longitude);
    const maxDistanceInMeters = Number(radiusInKm) * 1000;

    // 2. Nearest Restaurants fetch karein ($geoNear)
    const nearbyRestaurants = await Restaurant.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [userLong, userLat], // [Longitude, Latitude]
          },
          distanceField: 'distanceInMeters',
          maxDistance: maxDistanceInMeters,
          spherical: true,
          query: { isActive: true, isApproved: true },
        },
      },
      {
        $project: {
          _id: 1,
          restaurantName: 1,
          bannerImage: 1,
          address: 1,
          distanceInKm: {
            $round: [{ $divide: ['$distanceInMeters', 1000] }, 1],
          },
        },
      },
    ]);

    if (!nearbyRestaurants || nearbyRestaurants.length === 0) {
      return res.status(200).json({
        success: true,
        message: `No active restaurants found within ${radiusInKm} km.`,
        data: [],
      });
    }

    // 3. Distance Helper ka use karke Restaurant Map taiyar karein
    const restaurantMap = {};
    const restaurantIds = nearbyRestaurants.map((resto) => {
      const distance = resto.distanceInKm;
      const eta = calculateDeliveryTime(distance);      // 👈 Helper Call
      const fee = calculateDeliveryFee(distance);        // 👈 Helper Call

      restaurantMap[resto._id.toString()] = {
        name: resto.restaurantName,
        distanceInKm: distance,
        distanceText: `${distance} km`,
        deliveryTime: eta.text,
        deliveryFee: `₹${fee}`,
      };

      return resto._id;
    });

    // 4. Food filter build karein
    const foodFilter = {
      restaurant: { $in: restaurantIds },
      isAvailable: true,
    };

    if (category) foodFilter.category = category;
    if (isVeg !== undefined) foodFilter.isVeg = isVeg === 'true' || isVeg === true;

    // 5. Foods find karein
    const foods = await Food.find(foodFilter).lean();

    // 6. Food data me Restaurant info, Distance, ETA aur Fee merge karein
    let foodsWithDetails = foods.map((food) => {
      const resto = restaurantMap[food.restaurant.toString()] || {};
      return {
        ...food,
        restaurantName: resto.name || 'Unknown Restaurant',
        distance: resto.distanceText || 'N/A',
        distanceInKm: resto.distanceInKm || 0,
        deliveryTime: resto.deliveryTime || '30-40 mins',
        deliveryFee: resto.deliveryFee || '₹30',
      };
    });

    // 7. Dynamic Sorting
    if (sortBy === 'price_low') {
      foodsWithDetails.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_high') {
      foodsWithDetails.sort((a, b) => b.price - a.price);
    } else {
      // Default: Nearest distance first
      foodsWithDetails.sort((a, b) => a.distanceInKm - b.distanceInKm);
    }

    return res.status(200).json({
      success: true,
      totalItemsFound: foodsWithDetails.length,
      data: foodsWithDetails,
    });
  } catch (error) {
    console.error('Error fetching nearby foods:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching nearby foods',
      error: error.message,
    });
  }
};

module.exports = { getNearbyFoods };
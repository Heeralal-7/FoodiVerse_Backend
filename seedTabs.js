// seedTabs.js
require('dotenv').config();
const mongoose = require('mongoose');
const Tab = require('./src/models/tabModel');
const dns = require('dns');

//  ISP DNS block ko bypass karne ke liye ye line lagayein
dns.setServers(['8.8.8.8', '8.8.4.4']);

const foodTabsData = [
  // ── Level 1 Main Tabs ──
  { tabId: 1, name: "Dashboard", slug: "dashboard", parentId: 0, subParentId: 0, isActive: true },
  { tabId: 2, name: "User Management", slug: "users", parentId: 0, subParentId: 0, isActive: true },
  { tabId: 3, name: "Vendors (Restaurants)", slug: "vendors", parentId: 0, subParentId: 0, isActive: true },
  { tabId: 4, name: "Delivery Partners (Drivers)", slug: "drivers", parentId: 0, subParentId: 0, isActive: true },
  { tabId: 5, name: "Order Management", slug: "orders", parentId: 0, subParentId: 0, isActive: true },
  { tabId: 6, name: "Menu & Food Catalog", slug: "food_catalog", parentId: 0, subParentId: 0, isActive: true },
  { tabId: 7, name: "Offers & Coupons", slug: "promotions", parentId: 0, subParentId: 0, isActive: true },
  { tabId: 8, name: "Finance & Payouts", slug: "finance", parentId: 0, subParentId: 0, isActive: true },
  { tabId: 9, name: "Sub-Admin & Roles", slug: "subadmin_roles", parentId: 0, subParentId: 0, isActive: true },
  { tabId: 10, name: "App & Web Banners", slug: "banners", parentId: 0, subParentId: 0, isActive: true },
  { tabId: 11, name: "Settings & Charges", slug: "settings", parentId: 0, subParentId: 0, isActive: true },
  { tabId: 12, name: "Notifications", slug: "notifications", parentId: 0, subParentId: 0, isActive: true },
  { tabId: 13, name: "Reviews & Ratings", slug: "reviews", parentId: 0, subParentId: 0, isActive: true },
  { tabId: 14, name: "Cancellations & Refunds", slug: "refunds", parentId: 0, subParentId: 0, isActive: true },

  // ── Sub-Tabs: Menu & Catalog (Parent: 6) ──
  { tabId: 15, name: "Categories", slug: "food_categories", parentId: 6, subParentId: 0, isActive: true },
  { tabId: 16, name: "Food Items", slug: "food_items", parentId: 6, subParentId: 0, isActive: true },
  { tabId: 17, name: "Add-ons & Combos", slug: "food_addons", parentId: 6, subParentId: 0, isActive: true },
  { tabId: 18, name: "Dietary Tags (Veg/NonVeg/Vegan)", slug: "dietary_tags", parentId: 6, subParentId: 0, isActive: true },

  // ── Sub-Tabs: Vendors / Restaurants (Parent: 3) ──
  { tabId: 19, name: "All Restaurants", slug: "all_restaurants", parentId: 3, subParentId: 0, isActive: true },
  { tabId: 20, name: "Pending KYC Approvals", slug: "vendor_kyc", parentId: 3, subParentId: 0, isActive: true },
  { tabId: 21, name: "Commission & Margins", slug: "vendor_commissions", parentId: 3, subParentId: 0, isActive: true },
  { tabId: 22, name: "Restaurant Timing & Slot", slug: "vendor_slots", parentId: 3, subParentId: 0, isActive: true },

  // ── Sub-Tabs: Drivers (Parent: 4) ──
  { tabId: 23, name: "Active Drivers", slug: "active_drivers", parentId: 4, subParentId: 0, isActive: true },
  { tabId: 24, name: "Driver Document KYC", slug: "driver_kyc", parentId: 4, subParentId: 0, isActive: true },
  { tabId: 25, name: "Driver Shift & Tracking", slug: "driver_tracking", parentId: 4, subParentId: 0, isActive: true },

  // ── Sub-Tabs: Settings & Delivery (Parent: 11) ──
  { tabId: 26, name: "Delivery Radius & Charges", slug: "delivery_charges", parentId: 11, subParentId: 0, isActive: true },
  { tabId: 27, name: "Minimum Order Value", slug: "min_order_value", parentId: 11, subParentId: 0, isActive: true },
  { tabId: 28, name: "Website Master Settings", slug: "web_settings", parentId: 11, subParentId: 0, isActive: true },
  { tabId: 29, name: "Tax & GST Configuration", slug: "tax_settings", parentId: 11, subParentId: 0, isActive: true }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    await Tab.deleteMany({});
    console.log("Old Tabs Cleared.");

    await Tab.insertMany(foodTabsData);
    console.log(`✅ ${foodTabsData.length} FoodiVerse Tabs Seeded Successfully!`);

    process.exit();
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
};

seedDB();
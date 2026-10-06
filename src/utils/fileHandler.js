// src/utils/fileHandler.js
const fs = require('fs');
const path = require('path');

/**
 * Purani file delete karne ke liye helper
 * @param {String|Array} filePaths - Local database mein save kiya gaya path (e.g. 'public/uploads/foods/food-123.jpg')
 */
const deleteFile = (filePaths) => {
  if (!filePaths) return;

  const paths = Array.isArray(filePaths) ? filePaths : [filePaths];

  paths.forEach((filePath) => {
    if (typeof filePath !== 'string') return;

    // Root directory se path nikalna
    const fullPath = path.join(process.cwd(), filePath);

    if (fs.existsSync(fullPath)) {
      fs.unlink(fullPath, (err) => {
        if (err) {
          console.error(`❌ Error deleting file: ${filePath}`, err);
        } else {
          console.log(`🗑️ Successfully deleted file: ${filePath}`);
        }
      });
    }
  });
};

module.exports = { deleteFile };
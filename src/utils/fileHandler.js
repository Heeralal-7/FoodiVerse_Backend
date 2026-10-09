// src/utils/fileHandler.js
const fs = require('fs');
const path = require('path');

const deleteFile = (filePaths) => {
  if (!filePaths) return;

  const paths = Array.isArray(filePaths) ? filePaths : [filePaths];

  paths.forEach((filePath) => {
    if (typeof filePath !== 'string') return;

    // Agar path me 'public' nahi hai toh 'public' prepend karein
    const relativePath = filePath.startsWith('public')
      ? filePath
      : path.join('public', filePath);

    const fullPath = path.join(process.cwd(), relativePath);

    if (fs.existsSync(fullPath)) {
      fs.unlink(fullPath, (err) => {
        if (err) {
          console.error(`❌ Error deleting file: ${filePath}`, err);
        } else {
          console.log(`🗑️ Successfully deleted old file: ${filePath}`);
        }
      });
    }
  });
};

module.exports = { deleteFile };
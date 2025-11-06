// Function to compare two datetime strings
const compareTimes = (timeA, timeB) => {
  const a = new Date(timeA);
  const b = new Date(timeB);

  const diffMs = b - a;
  const diffSec = Math.floor(diffMs / 1000);

  if (diffMs > 0) {
    // timeB is after timeA
    console.log(`${diffSec} seconds after`);
    return true
  } else if (diffMs < 0) {
    // timeB is before timeA
    console.log(`${Math.abs(diffSec)} seconds before`);
  } else {
    console.log('Same time');
  }
    return false
};

const fs = require('fs');
const path = require('path');

function readAndDeleteJsonFiles(dirPath, matchValue, currChannelId) {
  fs.readdir(dirPath, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      if (path.extname(file) === '.json') {
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            console.error(`Error reading file ${file}:`, err);
            return;
          }

          try {
            const json = JSON.parse(data);
            if (json.channelId !== currChannelId) {
              // console.log(`Skipping file ${file} as it does not match the current channel ID.`);
              return;
            }
            const found = Object.values(json).some(val => val === matchValue);

            if (found) {
              fs.unlink(filePath, err => {
                if (err) {
                  console.error(`Error deleting file ${file}:`, err);
                } else {
                  console.log(`Deleted file ${file}`);
                }
              });
            }
          } catch (parseErr) {
            console.error(`Invalid JSON in file ${file}:`, parseErr);
          }
        });
      }
    });
  });
}




module.exports = {compareTimes,readAndDeleteJsonFiles}

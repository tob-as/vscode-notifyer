const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "..", "com.approval-deck.sdPlugin");
const destDir = srcDir; // Assets stay in place

// Ensure assets directory exists in bin
const binAssetsDir = path.join(srcDir, "bin", "assets");
if (!fs.existsSync(binAssetsDir)) {
  fs.mkdirSync(binAssetsDir, { recursive: true });
}

// Copy alert sound if it exists
const alertSrc = path.join(srcDir, "assets", "alert.wav");
const alertDest = path.join(binAssetsDir, "alert.wav");

if (fs.existsSync(alertSrc)) {
  fs.copyFileSync(alertSrc, alertDest);
  console.log("Copied alert.wav to bin/assets/");
} else {
  console.log("Note: No alert.wav found in assets/. System beep will be used.");
}

console.log("Asset copy complete.");

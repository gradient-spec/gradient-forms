const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const inputPath = 'C:\\Users\\ARYAN PANDEY\\.gemini\\antigravity-ide\\brain\\860b40f3-3010-4071-9561-827e8bd69a1f\\media__1786760422059.png';
const outputPath = 'd:\\DESKTOP\\Desktop\\HACKATHONS\\GRADIENT FORMS\\public\\logo-transparent.png';

fs.createReadStream(inputPath)
  .pipe(new PNG())
  .on('parsed', function() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = (this.width * y + x) << 2;
        const r = this.data[idx];
        const g = this.data[idx + 1];
        const b = this.data[idx + 2];

        // Check if pixel is white / light background
        if (r > 210 && g > 210 && b > 210) {
          const brightness = (r + g + b) / 3;
          if (brightness > 235) {
            this.data[idx + 3] = 0; // Fully transparent background
          } else {
            // Anti-aliased edge smoothing
            const alpha = Math.round(((235 - brightness) / 25) * 255);
            this.data[idx + 3] = Math.max(0, Math.min(255, alpha));
          }
        }
      }
    }

    const publicDir = path.dirname(outputPath);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    this.pack().pipe(fs.createWriteStream(outputPath)).on('finish', () => {
      console.log('Successfully created public/logo-transparent.png!');
    });
  });

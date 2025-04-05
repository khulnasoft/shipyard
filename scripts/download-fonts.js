const https = require('https');
const fs = require('fs');
const path = require('path');

const fonts = [
  { name: 'Cutive Mono', filename: 'CutiveMono-Regular.woff2' },
  { name: 'Francois One', filename: 'FrancoisOne-Regular.woff2' },
  { name: 'Podkova', filename: 'Podkova-Medium.woff2' },
  { name: 'Roboto', filename: 'Roboto-Light.woff2' },
  { name: 'Sniglet', filename: 'Sniglet-Regular.woff2' },
  { name: 'VT323', filename: 'VT323-Regular.woff2' },
  { name: 'Audiowide', filename: 'Audiowide-Regular.woff2' },
  { name: 'Shrikhand', filename: 'Shrikhand-Regular.woff2' },
];

const weatherIcon = {
  name: 'WeatherIcons.woff2',
  url: 'https://erikflowers.github.io/weather-icons/font/weathericons-regular-webfont.woff2',
};

const downloadFile = (url, outputPath) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        fs.unlink(outputPath, () => {});
        return reject(`❌ Failed to download ${url} — Status code: ${res.statusCode}`);
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded: ${path.basename(outputPath)}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {});
      reject(`❌ Error downloading ${url}: ${err.message}`);
    });
  });
};

const getGoogleFontsCss = (fontName) => {
  const formatted = fontName.replace(/ /g, '+');
  return `https://fonts.googleapis.com/css2?family=${formatted}&display=swap`;
};

const fetchCss = (url) => {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', (err) => reject(err));
  });
};

const extractWoff2Url = (css) => {
  const match = css.match(/url\((https:\/\/[^)]+\.woff2)\)/);
  return match ? match[1] : null;
};

const downloadGoogleFont = async (font, outputDir) => {
  const cssUrl = getGoogleFontsCss(font.name);
  try {
    const css = await fetchCss(cssUrl);
    const woff2Url = extractWoff2Url(css);
    if (!woff2Url) {
      console.error(`❌ No .woff2 URL found for ${font.name}`);
      return;
    }
    const fontPath = path.join(outputDir, font.filename);
    await downloadFile(woff2Url, fontPath);
  } catch (err) {
    console.error(`❌ Failed to download ${font.name}:`, err);
  }
};

const downloadAllFonts = async () => {
  const fontsDir = path.join(__dirname, '..', 'public', 'fonts');
  const widgetDir = path.join(__dirname, '..', 'public', 'widget-resources');

  fs.mkdirSync(fontsDir, { recursive: true });
  fs.mkdirSync(widgetDir, { recursive: true });

  for (const font of fonts) {
    await downloadGoogleFont(font, fontsDir);
  }

  try {
    const weatherIconPath = path.join(widgetDir, weatherIcon.name);
    await downloadFile(weatherIcon.url, weatherIconPath);
  } catch (err) {
    console.error(`❌ Error downloading ${weatherIcon.name}:`, err);
  }
};

downloadAllFonts();

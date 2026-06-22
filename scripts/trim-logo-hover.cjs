const sharp = require('sharp');
sharp('public/images/soapfactory-logo-hover.png')
  .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 10 })
  .webp({ quality: 90 })
  .toFile('public/images/soapfactory-logo-hover.webp')
  .then(i => console.log(`trimmed: ${i.width}x${i.height} ${(i.size/1024).toFixed(0)}kb`))
  .catch(e => console.error(e));

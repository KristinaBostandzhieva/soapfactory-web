const sharp = require('sharp');
sharp('public/images/soapfactory-logo-hover.png')
  .webp({ quality: 90 })
  .toFile('public/images/soapfactory-logo-hover.webp')
  .then(i => console.log(`done: ${i.width}x${i.height} ${(i.size/1024).toFixed(0)}kb`));

const sharp = require('sharp');
const dir = 'public/images/hero-carousel';
const files = ['100natural-bg', 'bestseller-bg', 'ecological-bg'];
Promise.all(files.map(f =>
  sharp(`${dir}/${f}.png`).webp({ quality: 90 }).toFile(`${dir}/${f}.webp`)
    .then(info => console.log(`${f}.webp -> ${info.width}x${info.height} ${(info.size/1024).toFixed(0)}kb`))
)).catch(e => console.error(e));

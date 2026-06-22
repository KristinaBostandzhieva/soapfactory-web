const sharp = require('sharp');
Promise.all([
  sharp('public/images/SF-logo.webp').metadata(),
  sharp('public/images/soapfactory-logo-hover.webp').metadata(),
]).then(([a, b]) => {
  console.log('SF-logo.webp:', a.width, 'x', a.height);
  console.log('soapfactory-logo-hover.webp:', b.width, 'x', b.height);
});

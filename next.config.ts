const withPWA = require('next-pwa')({
  dest: 'public', // папка, куда будет помещён service-worker
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  output: 'export',
  // Твои другие настройки Next.js
});

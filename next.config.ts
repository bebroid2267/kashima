const withPWA = require('next-pwa')({
  dest: 'public', // папка, куда будет помещён service-worker
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

module.exports = withPWA({
  // Твои другие настройки Next.js
  experimental: {
    serverActions: {
      allowedOrigins: ["mishanep.store", "localhost:3000"],
    },
  },
});

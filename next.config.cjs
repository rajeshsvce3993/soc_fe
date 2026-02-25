const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve ||= {};
    config.resolve.alias ||= {};
    config.resolve.alias['@'] = path.resolve(__dirname, 'client/src');
    config.resolve.alias['@shared'] = path.resolve(__dirname, 'shared');
    return config;
  }
};

module.exports = nextConfig;

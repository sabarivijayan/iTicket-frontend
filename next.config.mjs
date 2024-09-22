/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'image.tmdb.org'], // Add 'image.tmdb.org' to allow images from TMDB
  },
};

export default nextConfig;

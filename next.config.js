/** @type {import('next').NextConfig} */

const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com'
            },
            {
                protocol: 'https',
                hostname: 'placehold.co'
            },
        ]
    },
    experimental: {
        missingSuspenseWithCSRBailout: false,
    },
}

module.exports = nextConfig
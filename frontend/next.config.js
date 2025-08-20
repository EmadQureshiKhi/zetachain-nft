/** @type {import('next').NextConfig} */
const nextConfig = {
    // Configure external image domains
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'via.placeholder.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
    webpack: (config, { isServer }) => {
        // Ignore pino-pretty warnings
        config.resolve.fallback = {
            ...config.resolve.fallback,
            'pino-pretty': false,
        };

        // Ignore specific modules that cause warnings
        config.externals = config.externals || [];
        if (isServer) {
            config.externals.push('pino-pretty');
        }

        return config;
    },
    // Suppress specific warnings
    onDemandEntries: {
        // period (in ms) where the server will keep pages in the buffer
        maxInactiveAge: 25 * 1000,
        // number of pages that should be kept simultaneously without being disposed
        pagesBufferLength: 2,
    },
    // Experimental features
    experimental: {
        // Suppress hydration warnings
        suppressHydrationWarning: true,
    },
};

module.exports = nextConfig;
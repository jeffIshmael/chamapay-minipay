/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@neynar/nodejs-sdk', 'wagmi', 'viem'],
    images:{
        domains: ['ipfs.io'],

    }
};

export default nextConfig;

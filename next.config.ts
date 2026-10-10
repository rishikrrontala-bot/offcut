import type { NextConfig } from "next";
const config: NextConfig = {
  webpack: (config, {isServer}) => { if(!isServer) config.resolve.fallback = {...config.resolve.fallback, fs:false, path:false, crypto:false}; config.resolve.alias = {...config.resolve.alias, sharp: false, "onnxruntime-node": false}; return config; },
  async headers() { return [{source: "/:path*", headers: [{key: "X-Content-Type-Options", value: "nosniff"}, {key: "Referrer-Policy",value:"no-referrer"}, {key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=()"}]}]; }
};
export default config;

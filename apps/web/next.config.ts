import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  transpilePackages: ["@winnow/ui", "@winnow/core"],
};

export default withNextIntl(nextConfig);

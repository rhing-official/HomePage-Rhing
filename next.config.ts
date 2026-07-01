import type { NextConfig } from "next";
import path from "path"; // 追加

const nextConfig: NextConfig = {
  turbopack: {
    // path.resolve(__dirname) を使うことで現在のディレクトリを絶対パスに変換します
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
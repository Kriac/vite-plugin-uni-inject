import { defineConfig } from "vite";
import { uniAutoPages, uniInject } from "vite-plugin-uni-inject";
import uni from "@dcloudio/vite-plugin-uni";

export default defineConfig(() => {
  return {
    plugins: [
      uniAutoPages({
        dir: "pages",
        subPackages: ["subPackages/tutorial"],
        dts: "./types/uni-pages.d.ts",
      }),
      uniInject({
        path: "./components/inject.vue",
      }),
      uni(),
    ],
  };
});

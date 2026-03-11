import { defineConfig } from "vite";
import { uniAutoPages, uniInject } from "vite-plugin-uni-inject";
import uni from "@dcloudio/vite-plugin-uni";

export default defineConfig(() => {
  return {
    plugins: [
      uniAutoPages({
        dts: "./types/uni-pages.d.ts",
        dir: "pages",
        subPackages: ["subPackages/tutorial"],
      }),
      uniInject({
        path: "./components/inject.vue",
      }),
      uni(),
    ],
  };
});

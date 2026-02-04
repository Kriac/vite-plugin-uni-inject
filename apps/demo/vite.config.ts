import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import uniInject from "vite-plugin-uni-inject";

export default defineConfig(() => {
  return {
    plugins: [
      uniInject({
        injectPath: "./components/inject.vue",
      }),
      uni(),
    ],
  };
});

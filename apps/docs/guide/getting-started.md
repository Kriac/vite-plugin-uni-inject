# 快速开始

Vite-plugin-uni-inject 是一个轻量级的 uniapp 注入增强插件，旨在为 uniapp 项目提供更舒适的开发体验，目前有以下几个插件：

- `uniInject`：把公共 SFC 片段注入到每个页面中，适合全局 toast 等组件挂载。
- `uniAutoPages`：自动维护 `src/pages.json`，并提供 `definePage` 页面宏定义。

## 安装

::: code-group

```sh [pnpm]
pnpm add -D vite-plugin-uni-inject
```

```sh [npm]
npm i -D vite-plugin-uni-inject
```

```sh [yarn]
yarn add -D vite-plugin-uni-inject
```

:::

## 配置

### vite.config.ts

```ts
import { defineConfig } from "vite";
import { uniAutoPages, uniInject } from "vite-plugin-uni-inject";
import uni from "@dcloudio/vite-plugin-uni";

export default defineConfig({
  plugins: [
    uniAutoPages({
      dts: "./types/uni-pages.d.ts",
      subPackages: ["sub-packages/tutorial"],
    }),
    uniInject({
      path: "./components/inject.vue",
    }),
    uni(),
  ],
});
```

## 使用

如果你在开发过程中遇到了什么问题，或者有更好的建议，欢迎提交 issue 与我们讨论。

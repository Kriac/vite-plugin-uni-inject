# 快速开始

`vite-plugin-uni-inject` 面向 uni-app + Vite 项目，当前提供两个插件：

- `uniInject`：把公共 SFC 片段注入到每个页面中，适合全局 toast、公共弹窗、埋点初始化等页面级能力。
- `uniAutoPages`：扫描页面文件，自动维护 `src/pages.json`，并为 `definePage` 与路由路径生成类型声明。

## 适用场景

当项目里的每个页面都需要挂载同一份页面级内容，或者不想手动维护 `pages.json` 时，可以使用这个插件组合：

- 用 `uniInject` 注入公共组件、全局提示容器、页面级初始化逻辑。
- 用 `uniAutoPages` 让页面文件结构成为 `pages.json` 的来源。
- 用 `definePage` 把页面样式配置放回页面文件本身。

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

## 配置插件

在 `vite.config.ts` 中引入插件。推荐顺序是 `uniAutoPages()`、`uniInject()`、`uni()`，让自动生成后的 `pages.json` 能被注入插件读取。

```ts
import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import { uniAutoPages, uniInject } from "vite-plugin-uni-inject";

export default defineConfig({
  plugins: [
    uniAutoPages({
      dts: "./types/uni-pages.d.ts",
      mainPackage: "pages",
      subPackages: ["subPackages/tutorial"],
    }),
    uniInject({
      path: "./components/inject.vue",
    }),
    uni(),
  ],
});
```

## 下一步

接入插件后，可以按下面的顺序继续阅读：

- [页面注入](/guide/inject)：准备注入文件，了解注入范围与执行方式。
- [自动 pages](/guide/auto-pages)：用页面文件结构生成 `pages.json`，并使用 `definePage` 声明页面配置。
- [配置项](/guide/options)：查看两个插件的完整选项、默认值和使用建议。

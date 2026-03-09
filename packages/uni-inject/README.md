# vite-plugin-uni-inject

利用 Vite 插件机制，解决 uniapp 项目中无法使用公共组件的问题。

## 功能特点

- 干净的注入任何代码，没有多余的结构。
- 支持注入 `<page-meta/>` 这种只能放在页面第一个位置的标签节点。
- 自动识别所有 `page.json` 中的 vue 文件并注入，无需维护注入页面表。

## 如何使用

原理就是通过 vite 插件机制，在构建过程中自动注入 inject.vue 中的代码。

### 安装依赖

```bash
pnpm i -D vite-plugin-uni-inject
```

### vite.config.ts

```ts
import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import uniInject from "vite-plugin-uni-inject";

// 如果有重写 page.json 文件的插件，请确保写在 uniInject 之前
export default defineConfig(() => {
  return {
    plugins: [uniInject(), uni()],
  };
});
```

## 报告错误

欢迎提交 issue 与我们讨论。

# vite-plugin-uni-inject

利用 Vite 插件机制，实现自动注入代码，解放你的双手。

## 功能特点

- 干净的注入任何代码，没有多余的结构。
- 支持注入 `<page-meta/>` 这种只能放在页面第一个位置的标签节点。
- 支持基于文件路由的 `page.json` 自动生成并注入，无需手动维护页面表。

## 如何使用

### 安装依赖

```bash
pnpm i -D vite-plugin-uni-inject
```

### vite.config.ts

```ts
import { defineConfig } from "vite";
import { uniAutoPages, uniInject } from "vite-plugin-uni-inject";
import uni from "@dcloudio/vite-plugin-uni";

// 如果有重写 page.json 文件的插件，请确保写在 uniInject 之前
export default defineConfig(() => {
  return {
    plugins: [uniAutoPages(), uniInject(), uni()],
  };
});
```

### 独立插件说明

- `uniAutoPages(options)`：负责扫描文件路由并补全 `src/pages.json` 。
- `uniInject(options)`：负责注入 `App.inject.vue`（或自定义文件）到页面文件。

## 报告错误

欢迎提交 issue 与我们讨论。

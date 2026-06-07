# 页面注入

`uniInject` 用来把一份公共 SFC 内容注入到每个页面中。它适合承载那些每个页面都需要出现、但不想在页面文件里重复书写的内容。

## 创建注入文件

默认情况下，插件会从 `src/App.inject.vue` 读取注入内容。也可以通过 `path` 指定其他位置，例如 `src/components/inject.vue`：

```vue
<script setup lang="ts">
import { sayHelloInject } from "@/libs/utils";

console.log(sayHelloInject());
</script>

<template>
  <t-toast ref="t-toast" />
</template>
```

然后在 `vite.config.ts` 中配置：

```ts
import { uniInject } from "vite-plugin-uni-inject";

export default defineConfig({
  plugins: [
    uniInject({
      path: "./components/inject.vue",
    }),
  ],
});
```

`path` 是相对于 `src` 目录的路径。

## 注入规则

`uniInject` 会读取 `src/pages.json`，只处理其中声明过的页面：

- 主包 `pages` 中的页面会被处理。
- 分包 `subPackages` 中的页面会被处理。
- 没有出现在 `pages.json` 里的普通 Vue 组件不会被处理。

注入时会分别处理 SFC 中的两个区域：

| 区域             | 行为                                       |
| ---------------- | ------------------------------------------ |
| `<template>`     | 注入文件的模板内容会放到页面模板内容之前。 |
| `<script setup>` | 注入文件的脚本内容会放到页面脚本内容之前。 |

如果注入脚本和页面脚本里都有 `import`，插件会把 `import` 语句整理到 `<script setup>` 顶部，避免导入语句夹在普通逻辑中间。

## 常见用途

- 在所有页面挂载全局 toast、dialog、loading 等组件容器。
- 注入页面级埋点、调试输出或初始化逻辑。
- 注入类似 `<page-meta />` 这类需要出现在页面模板前部的节点。

## 注意事项

- 如果注入文件不存在，插件会跳过处理。
- 如果 `src/pages.json` 不存在，插件会跳过处理。
- 注入内容会进入每个页面，请避免放置会重复注册全局副作用的逻辑。
- 插件只处理已有 `<template>` 或 `<script setup>` 的对应区域，不会为页面创建缺失的 SFC 区块。

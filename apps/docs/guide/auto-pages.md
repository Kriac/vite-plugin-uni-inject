# 自动 pages

`uniAutoPages` 会扫描页面目录下的 `.vue` 文件，并把扫描结果写回 `src/pages.json`。它适合把文件结构作为页面路由的主要来源，减少手动维护页面表的成本。

## 文件路由

假设项目结构如下：

```txt
src/
├─ pages/
│  ├─ index/index.vue
│  └─ more/test.vue
└─ subPackages/
   └─ tutorial/
      └─ pages/index/index.vue
```

配置 `mainPackage` 与 `subPackages`：

```ts
import { uniAutoPages } from "vite-plugin-uni-inject";

export default defineConfig({
  plugins: [
    uniAutoPages({
      mainPackage: "pages",
      subPackages: ["subPackages/tutorial"],
      dts: "./types/uni-pages.d.ts",
    }),
  ],
});
```

插件会生成类似的 `pages.json`：

```json
{
  "pages": [
    {
      "path": "pages/index/index"
    },
    {
      "path": "pages/more/test"
    }
  ],
  "subPackages": [
    {
      "root": "subPackages/tutorial",
      "pages": [
        {
          "path": "pages/index/index"
        }
      ]
    }
  ]
}
```

`pages.json` 中已有的其他顶层配置会被保留，例如 `globalStyle`、`easycom` 等。

## definePage 页面配置

在页面的 `<script setup>` 或普通 `<script>` 中调用 `definePage`，可以把页面级配置写在页面文件旁边：

```vue
<script setup lang="ts">
definePage({
  home: true,
  style: {
    disableScroll: true,
    navigationBarTitleText: "首页",
  },
});
</script>
```

`definePage` 支持的字段：

| 字段    | 说明                                                                    |
| ------- | ----------------------------------------------------------------------- |
| `home`  | 标记页面为首页，仅主包页面生效。被标记的页面会移动到 `pages` 首位。     |
| `style` | 写入页面的 `style` 配置，字段与 uni-app `pages.json` 页面样式保持一致。 |

构建时插件会从页面源码中移除 `definePage` 的导入语句和调用语句，避免运行时产生不存在的宏调用。

::: tip
`definePage` 的配置需要是可静态求值的对象字面量。不要在配置对象里依赖运行时变量。
:::

## 路由类型声明

开启 `dts` 后，插件会生成声明文件：

```ts
import type { DefinePageConfig } from "vite-plugin-uni-inject";

export type RoutePath = "/pages/index/index" | "/pages/more/test";

declare global {
  function definePage(config: DefinePageConfig): void;
}
```

把生成文件放入 `tsconfig.json` 的 `include` 范围后，就可以在页面中直接使用 `definePage`，也可以在业务代码中复用 `RoutePath` 类型。

## 生成时机

`uniAutoPages` 在 Vite 配置解析完成后扫描文件并写入结果。只要页面文件结构发生变化，重新启动或重新执行构建即可同步 `pages.json` 与类型声明。

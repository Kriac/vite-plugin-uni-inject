# 文件路由

`uniAutoPages` 会把页面文件结构转换成 `src/pages.json` 中的页面配置，让页面新增、删除和迁移都能通过文件系统同步。

## 页面目录

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

## 生成结果

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

## 生成时机

仅在 Vite 配置解析完成后，启动项目时触发，若页面文件结构发生变化，只需要重新启动或重新执行构建即可同步 `pages.json`。

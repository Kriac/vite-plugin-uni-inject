# 文件路由

`uniAutoPages` 会把页面文件结构转换成 `src/pages.json` 中的页面配置，让页面新增、删除和迁移都能通过文件系统同步。

## 使用示例

假设项目结构如下：

```txt
src/
├─ pages/
│  ├─ index/index.vue
│  └─ more/test.vue
└─ sub-packages/
   └─ tutorial/
    └─ views/
      └─ index/index.vue
```

通过 `pageDirs` 指定要扫描的页面目录，通过 `subPackages` 可以声明分包根目录：

```ts
import { uniAutoPages } from "vite-plugin-uni-inject";

export default defineConfig({
  plugins: [
    uniAutoPages({
      dts: "./types/uni-pages.d.ts",
      pageDirs: ["pages", "views"],
      subPackages: ["sub-packages/tutorial"],
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
      "root": "sub-packages/tutorial",
      "pages": [
        {
          "path": "views/index/index"
        }
      ]
    }
  ]
}
```

每个页面目录都会被递归扫描，因此目录名称和内部层级不受限制。

`pages.json` 中已有的其他顶层配置会被保留，例如 `globalStyle`、`easycom` 等。

## 生成时机

默认情况下，只要页面文件结构发生变化，正常跑一次项目就会自动生成。

### 缓存机制

插件会通过独立的缓存文件记录上次生成的内容，避免重复写入导致文件变更。

### 强制重新生成

如果发现由于缓存导致页面配置未按预期更新，可以通过以下方式清除缓存重新生成：

- 移除插件生成的 `.d.ts` 文件（推荐）
- 移除 `node_modules/.vite/vite-plugin-uni-inject` 的缓存目录

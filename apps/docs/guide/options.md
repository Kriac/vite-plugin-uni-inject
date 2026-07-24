# 配置项

## uniInject

| 字段   | 类型     | 默认值             | 说明                                   |
| ------ | -------- | ------------------ | -------------------------------------- |
| `path` | `string` | `"App.inject.vue"` | 相对于 `src` 目录的注入 SFC 文件路径。 |

示例：

```ts
uniInject({
  path: "./components/inject.vue",
});
```

## uniAutoPages

| 字段          | 类型       | 默认值             | 说明                                                                       |
| ------------- | ---------- | ------------------ | -------------------------------------------------------------------------- |
| `dts`         | `string`   | `"uni-pages.d.ts"` | 相对于 `src` 目录的类型声明输出路径。传入空字符串可关闭生成。              |
| `pageDirs`    | `string[]` | `["pages"]`        | 页面目录名或相对路径列表。插件会在 `src` 下递归匹配并扫描其中的 Vue 文件。 |
| `subPackages` | `string[]` | `[]`               | 分包根目录列表，用于扫描并归类对应分包中的页面。                           |

示例：

```ts
uniAutoPages({
  dts: "./types/uni-pages.d.ts",
  pageDirs: ["pages"],
  subPackages: ["sub-packages/tutorial"],
});
```

## 插件顺序

如果同时使用两个插件，请按下面的顺序放置：

```ts
export default defineConfig({
  plugins: [uniAutoPages(), uniInject(), uni()],
});
```

这样 `uniAutoPages` 会先补齐 `pages.json`，`uniInject` 再根据最新页面表决定要注入哪些页面，最后交给 `@dcloudio/vite-plugin-uni` 处理 uni-app 编译。

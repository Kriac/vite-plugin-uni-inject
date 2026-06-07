# 配置项

这里汇总 `vite-plugin-uni-inject` 暴露的两个插件选项。

## uniInject

`uniInject` 负责读取注入 SFC，并把其中的模板与脚本注入到页面文件中。

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

`uniAutoPages` 负责扫描页面文件、写入 `pages.json`，并生成类型声明。

| 字段          | 类型       | 默认值             | 说明                                                          |
| ------------- | ---------- | ------------------ | ------------------------------------------------------------- |
| `dts`         | `string`   | `"uni-pages.d.ts"` | 相对于 `src` 目录的类型声明输出路径。传入空字符串可关闭生成。 |
| `mainPackage` | `string`   | `"pages"`          | 主包页面目录。                                                |
| `subPackages` | `string[]` | `[]`               | 分包根目录列表。插件会扫描每个分包下的 `mainPackage` 目录。   |

示例：

```ts
uniAutoPages({
  dts: "./types/uni-pages.d.ts",
  mainPackage: "pages",
  subPackages: ["subPackages/tutorial"],
});
```

## 推荐顺序

如果同时使用两个插件，推荐按下面的顺序放置：

```ts
export default defineConfig({
  plugins: [uniAutoPages(), uniInject(), uni()],
});
```

这样 `uniAutoPages` 会先补齐 `pages.json`，`uniInject` 再根据最新页面表决定要注入哪些页面，最后交给 `@dcloudio/vite-plugin-uni` 处理 uni-app 编译。

## 使用建议

- `uniAutoPages`、`uniInject` 都应放在 `@dcloudio/vite-plugin-uni` 之前。
- 分包中的 `definePage({ home: true })` 不会把分包页面提升为应用首页。
- 如果只需要页面注入，可以只启用 `uniInject`，但需要自行维护 `pages.json`。
- 如果只需要自动维护页面表，可以只启用 `uniAutoPages`。
- 注入内容会进入每个页面，请避免在注入文件中放置会重复创建全局副作用的逻辑。

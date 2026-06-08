# definePage

在页面的 `<script setup>` 中使用 `definePage` 宏，可以把页面级配置写在文件内部维护。

## 基础用法

::: tip
`definePage` 的配置需要是可静态求值的对象字面量。不要在配置对象里依赖运行时变量。
:::

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

## 生成结果

插件会生成类似的 `pages.json`：

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "disableScroll": true,
        "navigationBarTitleText": "首页"
      }
    }
  ]
}
```

## 支持字段

| 字段    | 说明                                                                    |
| ------- | ----------------------------------------------------------------------- |
| `home`  | 标记页面为首页，仅主包页面生效。被标记的页面会移动到 `pages` 首位。     |
| `style` | 写入页面的 `style` 配置，字段与 uni-app `pages.json` 页面样式保持一致。 |

## 使用限制

注意：分包中的 `definePage({ home: true })` 配置不会把分包页面提升为应用首页。仅主包页面可以通过 `home` 调整首页顺序。

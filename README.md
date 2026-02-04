# vite-plugin-uni-inject

利用 Vite 插件机制，解决 uniapp 项目中无法使用公共组件的问题。

## 使用

如果你在开发过程中遇到了什么问题，或者有更好的建议，欢迎提交 issue 与我们讨论。

### 安装

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

## 贡献

感谢你考虑为该项目做贡献！我们欢迎社区成员的贡献，以帮助改进和扩展该项目。

## 执照

本项目采用 MIT 许可证，详细内容请见 [LICENSE](LICENSE) 文件。

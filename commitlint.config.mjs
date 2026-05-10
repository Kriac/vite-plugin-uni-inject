import config from "@kriac/lint-kit/commitlint";

export default config({
  scopes: [
    {
      name: "示例项目",
      value: "demo",
    },
    {
      name: "注入插件",
      value: "inject",
    },
  ],
});

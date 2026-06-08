import { defineConfig } from "vitepress";

const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
const base = isGithubActions && repo ? `/${repo}/` : "/";

export default defineConfig({
  base,
  title: "Vite-plugin-uni-inject",
  description:
    "一个轻量级的 uniapp 注入增强插件，旨在为 uniapp 项目提供更舒适的开发体验。",
  lang: "zh-CN",
  themeConfig: {
    search: {
      provider: "local",
    },
    nav: [
      {
        text: "指南",
        link: "/guide/getting-started",
      },
    ],
    sidebar: [
      {
        text: "介绍",
        items: [
          {
            text: "快速开始",
            link: "/guide/getting-started",
          },
        ],
      },
      {
        text: "核心能力",
        collapsed: false,
        items: [
          {
            text: "全局注入",
            link: "/guide/inject",
          },
          {
            text: "文件路由",
            link: "/guide/file-routing",
          },
          {
            text: "definePage",
            link: "/guide/define-page",
          },
          {
            text: "路由类型",
            link: "/guide/route-types",
          },
        ],
      },
      {
        text: "配置参考",
        collapsed: false,
        items: [
          {
            text: "uniInject",
            link: "/guide/options#uniinject",
          },
          {
            text: "uniAutoPages",
            link: "/guide/options#uniautopages",
          },
        ],
      },
    ],
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/kriac/vite-plugin-uni-inject",
      },
    ],
    outline: {
      label: "本页目录",
    },
    docFooter: {
      prev: "上一篇",
      next: "下一篇",
    },
    footer: {
      copyright: "Copyright © 2024-present Kriac. All rights reserved.",
      message: "Released under the MIT License.",
    },
  },
});

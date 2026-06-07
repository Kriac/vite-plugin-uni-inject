import { defineConfig } from "vitepress";

const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
const base = isGithubActions && repo ? `/${repo}/` : "/";

export default defineConfig({
  base,
  title: "Vite-plugin-uni-inject",
  description:
    "一个轻量级的 uniapp 页面注入插件，旨在为 uniapp 项目提供自动注入代码的功能。",
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
        text: "指南",
        items: [
          {
            text: "快速开始",
            link: "/guide/getting-started",
          },
          {
            text: "页面注入",
            link: "/guide/inject",
          },
          {
            text: "自动 pages",
            link: "/guide/auto-pages",
          },
          {
            text: "配置项",
            link: "/guide/options",
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

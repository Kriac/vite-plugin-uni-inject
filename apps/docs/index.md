---
layout: home

hero:
  name: Vite-plugin-uni-inject
  text: 一个轻量级的 uniapp 注入增强插件
  tagline: 旨在为 uniapp 项目提供更舒适的开发体验。
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 在 GitHub 上查看
      link: https://github.com/kriac/vite-plugin-uni-inject

features:
  - title: 全局注入
    details: 把统一的 template 与 script setup 内容注入到 pages.json 声明的页面，适合全局生效组件。
    link: /guide/inject
    linkText: 了解注入能力
  - title: 文件路由
    details: 根据主包与分包文件夹自动维护 src/pages.json，减少手动增删页面时的配置同步成本。
    link: /guide/file-routing
    linkText: 了解文件路由
  - title: 页面定制
    details: 支持在页面文件内声明 definePage 宏，更好的维护页面的独立配置。
    link: /guide/define-page
    linkText: 了解页面定制
  - title: 类型安全
    details: 每个插件均提供了相应的类型声明，能够更好的提供代码补全功能。
    link: /guide/getting-started
    linkText: 快速开始
  - title: 插件分离
    details: 多个插件可按需导入，只用你想要的。
    link: /guide/getting-started
    linkText: 快速开始
  - title: 极致轻量
    details: 仅包含 AST 解析所需的最小依赖，打包后体积控制在 1 MB 以内。
    link: /guide/getting-started
    linkText: 快速开始
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: linear-gradient(120deg, #bd34fe 30%, #41d1ff);
}

.VPHero {
  padding: 18px;
  filter: drop-shadow(-2px 4px 6px rgb(0 0 0 / 20%));
}
</style>

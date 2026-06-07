---
layout: home

hero:
  name: Vite-plugin-uni-inject
  text: 为 uni-app 页面提供注入能力与 pages.json 自动维护。
  tagline: 在页面里复用全局组件、自动生成路由配置，并用 definePage 声明页面级配置。
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 在 GitHub 上查看
      link: https://github.com/kriac/vite-plugin-uni-inject

features:
  - title: 页面注入
    details: 把统一的 template 与 script setup 内容注入到 pages.json 声明的页面，适合全局 toast、公共弹窗和页面级初始化。
    link: /guide/inject
    linkText: 了解注入能力
  - title: 自动 pages
    details: 根据主包与分包页面文件自动维护 src/pages.json，减少手动增删页面时的配置同步成本。
    link: /guide/auto-pages
    linkText: 查看文件路由
  - title: definePage 宏
    details: 在页面文件内声明 home 与 style，构建时写入 pages.json，并自动移除源码中的宏调用。
    link: /guide/auto-pages#definepage-页面配置
    linkText: 配置页面样式
  - title: 类型声明
    details: 生成 definePage 与 RoutePath 类型声明，让页面配置和业务跳转路径都有更清晰的类型提示。
    link: /guide/auto-pages#路由类型声明
    linkText: 查看类型生成
  - title: 分包友好
    details: 支持按分包 root 扫描页面，自动写入 subPackages，并让页面注入覆盖主包与分包页面。
    link: /guide/options
    linkText: 查看配置项
  - title: 轻量集成
    details: 以 Vite 插件形式接入 uni-app 项目，推荐在 @dcloudio/vite-plugin-uni 之前完成配置生成和页面注入。
    link: /guide/getting-started
    linkText: 开始接入
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

import type { PluginOptions, UniPage, UniPagesJson } from "./types";
import { parse } from "@vue/compiler-sfc";
import fs from "fs";
import path from "path";

export default function (opts?: PluginOptions) {
  const { injectPath = "App.inject.vue" } = opts || {};

  const pageSet = new Set<string>();
  let injectTemplate = "";
  let injectScriptSetup = "";

  return {
    name: "vite-plugin-uni-inject",
    enforce: "pre" as const,

    // 插件初始化
    configResolved(config: { root: string }) {
      const srcRoot = path.resolve(config.root, "src");

      // 读取 inject 文件
      const injPath = path.join(srcRoot, injectPath);
      if (!fs.existsSync(injPath)) {
        return;
      }
      const content: string = fs.readFileSync(injPath, "utf-8");
      const { descriptor } = parse(content);
      if (descriptor.template) {
        injectTemplate = descriptor.template.content.trim();
      }
      if (descriptor.scriptSetup) {
        injectScriptSetup = descriptor.scriptSetup.content.trim();
      }

      // 读取 pages.json 文件
      const pagesJsonPath = path.join(srcRoot, "pages.json");
      if (!fs.existsSync(pagesJsonPath)) {
        return;
      }

      // 收集页面文件
      const pagesJsonContent: string = fs.readFileSync(pagesJsonPath, "utf-8");
      const pagesJson: UniPagesJson = JSON.parse(pagesJsonContent);
      const collectPages = (pages: UniPage[], rootDir = ""): void => {
        pages.forEach((page) => {
          const pageVuePath = path.join(srcRoot, rootDir, `${page.path}.vue`);
          pageSet.add(path.normalize(pageVuePath));
        });
      };
      collectPages(pagesJson.pages);
      const subPackages = pagesJson.subPackages ?? [];
      subPackages.forEach((sub) => {
        collectPages(sub.pages, sub.root);
      });
    },

    // 处理页面文件
    transform(code: string, id: string) {
      if (!id.endsWith(".vue")) {
        return;
      }

      const normalizedId = path.normalize(id);
      if (!pageSet.has(normalizedId)) {
        return;
      }

      const { descriptor } = parse(code);
      let newCode = code;

      // 注入 template
      if (injectTemplate && descriptor.template) {
        const tplContent = descriptor.template.content.trim();
        const injectedTemplate = `${injectTemplate}\n${tplContent}`.trim();
        newCode =
          newCode.slice(0, descriptor.template.loc.start.offset) +
          `\n${injectedTemplate}\n` +
          newCode.slice(descriptor.template.loc.end.offset);
      }

      // 注入 script setup
      if (injectScriptSetup && descriptor.scriptSetup) {
        const start = descriptor.scriptSetup.loc.start.offset;
        newCode =
          newCode.slice(0, start) +
          `\n${injectScriptSetup}\n` +
          newCode.slice(start);
      }

      return {
        code: newCode,
        map: null,
      };
    },
  };
}

import type { InjectPluginOptions, UniPagesJson, UniPage } from "./types";
import { parse } from "@babel/parser";
import { parse as parseSFC } from "@vue/compiler-sfc";
import fs from "fs";
import path from "path";
import MagicString from "magic-string";

/**
 * 注入代码插件
 */
export default function uniInject(opts?: InjectPluginOptions) {
  const { path: injectPath = "App.inject.vue" } = opts || {};

  // 页面集合
  const pageSet = new Set<string>();

  // 注入内容
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

      // 读取 pages.json 文件
      const pagesJsonPath = path.join(srcRoot, "pages.json");
      if (!fs.existsSync(pagesJsonPath)) {
        return;
      }

      // 保存注入内容
      const content = fs.readFileSync(injPath, "utf-8");
      const { descriptor } = parseSFC(content);
      if (descriptor.template) {
        injectTemplate = descriptor.template.content.trim();
      }
      if (descriptor.scriptSetup) {
        injectScriptSetup = descriptor.scriptSetup.content.trim();
      }

      // 收集页面文件
      const pagesJsonContent = fs.readFileSync(pagesJsonPath, "utf-8");
      const pagesJson: UniPagesJson = JSON.parse(pagesJsonContent);
      const subPackages = pagesJson.subPackages ?? [];
      const collectPages = (pages: UniPage[], rootDir = ""): void => {
        pages.forEach((page) => {
          const pageVuePath = path.join(srcRoot, rootDir, `${page.path}.vue`);
          pageSet.add(path.normalize(pageVuePath));
        });
      };
      collectPages(pagesJson.pages);
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

      let newCode = code;

      const { descriptor } = parseSFC(code);

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
          `\n${injectScriptSetup}` +
          newCode.slice(start);
      }

      const { descriptor: newDescriptor } = parseSFC(newCode);

      // 处理 script setup
      if (newDescriptor.scriptSetup) {
        const start = newDescriptor.scriptSetup.loc.start.offset;
        const end = newDescriptor.scriptSetup.loc.end.offset;
        const scriptCode = newDescriptor.scriptSetup.content;

        const s = new MagicString(scriptCode);
        const ast = parse(scriptCode, {
          sourceType: "module",
          plugins: ["typescript"],
        });

        const imports: string[] = [];
        for (const node of ast.program.body) {
          if (node.type === "ImportDeclaration") {
            imports.push(scriptCode.slice(node.start!, node.end!));
            s.remove(node.start!, node.end! + 1);
          }
        }
        if (imports.length) {
          s.prepend("\n" + imports.join("\n"));
        }

        newCode = newCode.slice(0, start) + s.toString() + newCode.slice(end);
      }

      return {
        code: newCode,
      };
    },
  };
}

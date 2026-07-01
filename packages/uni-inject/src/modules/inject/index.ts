import type { InjectPluginOptions, UniPage, UniPagesJson } from "../../types";
import { parse } from "@babel/parser";
import { parse as parseSFC } from "@vue/compiler-sfc";
import fs from "fs";
import path from "path";

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
        const ast = parse(scriptCode, {
          sourceType: "module",
          plugins: ["typescript"],
        });

        // 收集 import 语句
        const imports: { code: string; end: number; start: number }[] = [];
        for (const node of ast.program.body) {
          if (
            node.type === "ImportDeclaration" &&
            typeof node.start === "number" &&
            typeof node.end === "number"
          ) {
            imports.push({
              code: scriptCode.slice(node.start, node.end),
              start: node.start,
              end: node.end,
            });
          }
        }

        // 将注入的 import 放到最前面
        let nextScriptCode = scriptCode;
        if (imports.length) {
          const ranges = [...imports].sort((a, b) => {
            return b.start - a.start;
          });
          for (const { start: rangeStart, end: rangeEnd } of ranges) {
            let removeEnd = rangeEnd;
            if (nextScriptCode.startsWith("\r\n", removeEnd)) {
              removeEnd += 2;
            } else if (nextScriptCode[removeEnd] === "\n") {
              removeEnd += 1;
            }
            nextScriptCode =
              nextScriptCode.slice(0, rangeStart) +
              nextScriptCode.slice(removeEnd);
          }
          nextScriptCode = `\n${imports
            .map((item) => {
              return item.code;
            })
            .join("\n")}${nextScriptCode}`;
        }

        newCode = newCode.slice(0, start) + nextScriptCode + newCode.slice(end);
      }

      return {
        code: newCode,
      };
    },
  };
}

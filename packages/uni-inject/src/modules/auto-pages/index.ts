import type {
  AutoPagesPluginOptions,
  DefinePageConfig,
  UniPage,
  UniPagesJson,
} from "../../types";
import { parse as parseBabel } from "@babel/parser";
import { parse as parseSFC } from "@vue/compiler-sfc";
import fs from "fs";
import path from "path";

// 读取 pages.json 文件
function readPagesJson(pagesJsonPath: string) {
  if (!fs.existsSync(pagesJsonPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(pagesJsonPath, "utf-8")) as UniPagesJson;
}

// 路径统一转换为 posix 风格
function toPosixPath(value: string) {
  return value.replace(/\\/g, "/");
}

// 规范化目录路径：去除首尾斜杠，并转换为 posix 风格
function normalizeDir(value: string) {
  return toPosixPath(value).replace(/^\/+|\/+$/g, "");
}

// 递归收集指定目录下的全部文件
function walkFiles(dirPath: string, filePaths: string[] = []) {
  if (!fs.existsSync(dirPath)) {
    return filePaths;
  }
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, filePaths);
      continue;
    }
    filePaths.push(fullPath);
  }
  return filePaths;
}

/** 解析数据 */
interface VueAnalysis {
  config: DefinePageConfig | null;
  stripRanges: { end: number; start: number }[];
}

// 解析 vue 文件：提取 definePage 配置 + 收集剥离代码区间
function analyzeVueFile(filePath: string): null | VueAnalysis {
  const content = fs.readFileSync(filePath, "utf-8");
  if (!content.includes("definePage")) {
    return null;
  }
  const stripRanges: VueAnalysis["stripRanges"] = [];
  const { descriptor } = parseSFC(content);
  const blocks = [descriptor.scriptSetup, descriptor.script].filter(
    (b): b is NonNullable<typeof b> => Boolean(b),
  );
  let config: DefinePageConfig | null = null;
  for (const block of blocks) {
    const src = block.content;
    if (!src.includes("definePage")) {
      continue;
    }
    let ast;
    try {
      ast = parseBabel(src, { sourceType: "module", plugins: ["typescript"] });
    } catch {
      continue;
    }
    const base = block.loc.start.offset;
    for (const node of ast.program.body) {
      if (typeof node.start !== "number" || typeof node.end !== "number") {
        continue;
      }
      if (node.type === "ImportDeclaration") {
        const hit = node.specifiers.some(
          (s) =>
            s.type === "ImportSpecifier" &&
            s.imported.type === "Identifier" &&
            s.imported.name === "definePage",
        );
        if (hit) {
          stripRanges.push({ start: base + node.start, end: base + node.end });
        }
        continue;
      }
      if (
        node.type !== "ExpressionStatement" ||
        node.expression.type !== "CallExpression" ||
        node.expression.callee.type !== "Identifier" ||
        node.expression.callee.name !== "definePage"
      ) {
        continue;
      }
      stripRanges.push({ start: base + node.start, end: base + node.end });
      const arg = node.expression.arguments[0];
      if (
        config ||
        !arg ||
        typeof arg.start !== "number" ||
        typeof arg.end !== "number"
      ) {
        continue;
      }
      const argSrc = src.slice(arg.start, arg.end);
      try {
        config = new Function(`return (${argSrc})`)() as DefinePageConfig;
      } catch (err) {
        console.warn(
          `[uni-auto-pages] 解析 definePage 配置失败 (${filePath}): ${(err as Error).message}`,
        );
      }
    }
  }
  if (!stripRanges.length && !config) {
    return null;
  }
  return {
    config,
    stripRanges,
  };
}

// 收集指定目录下的文件路由与对应的分析结果
function collectFileRoutes(srcRoot: string, routeDirs: string[]) {
  const routeSet = new Set<string>();
  const analysisMap = new Map<string, VueAnalysis>();
  for (const dir of routeDirs) {
    for (const filePath of walkFiles(path.resolve(srcRoot, dir))) {
      if (!filePath.endsWith(".vue")) continue;
      const route = toPosixPath(path.relative(srcRoot, filePath).slice(0, -4));
      routeSet.add(route);
      const result = analyzeVueFile(filePath);
      if (result) {
        analysisMap.set(route, result);
      }
    }
  }
  return {
    routes: Array.from(routeSet).sort(),
    analysisMap,
  };
}

// 获取需要扫描的目录列表
function getScanDirs(dir: string, subPackages: string[]) {
  const dirSet = new Set<string>();
  const mainDir = normalizeDir(dir);
  if (mainDir) {
    dirSet.add(mainDir);
  }
  for (const subRoot of subPackages) {
    const sub = normalizeDir(subRoot);
    if (!sub) {
      continue;
    }
    dirSet.add(mainDir ? `${sub}/${mainDir}` : sub);
  }
  return Array.from(dirSet);
}

// 根据文件结构构建页面项配置
function buildPages(
  routes: string[],
  analysisMap: Map<string, VueAnalysis>,
  toFullRoute: (route: string) => string,
) {
  return routes.map((route): UniPage => {
    const cfg = analysisMap.get(toFullRoute(route))?.config;
    if (!cfg) {
      return {
        path: route,
      };
    }
    return {
      path: route,
      ...cfg,
      home: undefined,
    };
  });
}

// 获取基于文件路由的 pages.json 配置
function getPagesByFileRoute(
  routes: string[],
  analysisMap: Map<string, VueAnalysis>,
  pagesJson: UniPagesJson,
  subPackageRoots: string[],
) {
  const mainRoutes: string[] = [];
  const subRouteMap = new Map<string, string[]>();

  // 将路由按主包/分包进行分类
  const normalizedSubRoots = subPackageRoots.map(normalizeDir);
  for (const route of routes) {
    const matchedRoot = normalizedSubRoots.find((root) =>
      route.startsWith(root + "/"),
    );
    if (matchedRoot) {
      const list = subRouteMap.get(matchedRoot) ?? [];
      list.push(route.slice(matchedRoot.length + 1));
      subRouteMap.set(matchedRoot, list);
    } else {
      mainRoutes.push(route);
    }
  }

  // 将主包中标记了 home 的页面移到首位
  const homeRoute = mainRoutes.find((r) => {
    return analysisMap.get(r)?.config?.home === true;
  });
  if (homeRoute) {
    mainRoutes.splice(mainRoutes.indexOf(homeRoute), 1);
    mainRoutes.unshift(homeRoute);
  }

  // 构建新的 pages.json 配置，并比较是否有变化
  const merged: UniPagesJson = {
    ...pagesJson,
    pages: buildPages(mainRoutes, analysisMap, (r) => r),
    subPackages: normalizedSubRoots.map((root) => ({
      root,
      pages: buildPages(
        subRouteMap.get(root) ?? [],
        analysisMap,
        (r) => `${root}/${r}`,
      ),
    })),
  };
  const changed =
    JSON.stringify({ pages: merged.pages, subPackages: merged.subPackages }) !==
    JSON.stringify({
      pages: pagesJson.pages ?? [],
      subPackages: pagesJson.subPackages ?? [],
    });

  return {
    merged,
    changed,
  };
}

// 生成路由类型声明文件
function buildRouteDts(routes: string[]) {
  const routeUnion = routes.map((r) => `  | "/${r}"`).join("\n");
  return `import type { DefinePageConfig } from "vite-plugin-uni-inject";

// Auto-generated by vite-plugin-uni-inject. Do not edit.

/** 提取路径 */
export type ExtractPath<T extends string, Prefix extends string> = T extends \`\${Prefix}\${infer P}\` ? P : never;

/** 路由路径 */
export type RoutePath = ${routeUnion};

declare global {
  /**
   * Vue \`<script setup>\` 宏定义 uniapp 页面级配置。
   */
  function definePage(config: DefinePageConfig): void;
}
`;
}

/**
 * 自动补全 pages.json 插件
 */
export default function uniAutoPages(opts?: AutoPagesPluginOptions) {
  const {
    dir = "pages",
    subPackages = [],
    dts = "uni-pages.d.ts",
  } = opts || {};

  // 页面分析结果
  const pageAnalysis = new Map<string, null | VueAnalysis>();

  return {
    name: "vite-plugin-uni-auto-pages",
    enforce: "pre" as const,

    // 插件初始化
    configResolved(config: { root: string }) {
      const srcRoot = path.resolve(config.root, "src");

      // 读取当前 pages.json 文件
      const pagesJsonPath = path.join(srcRoot, "pages.json");
      const pagesJson = readPagesJson(pagesJsonPath);
      if (!pagesJson) {
        return;
      }

      // 收集文件路由与分析结果
      pageAnalysis.clear();
      const { routes, analysisMap } = collectFileRoutes(
        srcRoot,
        getScanDirs(dir, subPackages),
      );
      for (const route of routes) {
        const abs = path.normalize(path.join(srcRoot, `${route}.vue`));
        pageAnalysis.set(abs, analysisMap.get(route) ?? null);
      }

      // 生成新的 pages.json 配置
      const { merged, changed } = getPagesByFileRoute(
        routes,
        analysisMap,
        pagesJson,
        subPackages,
      );
      if (changed) {
        fs.writeFileSync(pagesJsonPath, JSON.stringify(merged, null, 2) + "\n");
      }
      if (changed && dts) {
        const dtsContent = buildRouteDts(routes);
        fs.writeFileSync(path.join(srcRoot, dts), dtsContent);
      }
    },

    // 处理页面文件
    transform(code: string, id: string) {
      if (!id.endsWith(".vue")) {
        return;
      }

      // 获取分析结果，若无剥离区间则跳过
      const analysis = pageAnalysis.get(path.normalize(id.split("?")[0]));
      if (!analysis?.stripRanges.length) {
        return;
      }

      // 剥离代码区间，并处理可能残留的空行
      let newCode = code;
      const ranges = [...analysis.stripRanges].sort(
        (a, b) => b.start - a.start,
      );
      for (const { start, end } of ranges) {
        let removeEnd = end;
        if (newCode.startsWith("\r\n", removeEnd)) {
          removeEnd += 2;
        } else if (newCode[removeEnd] === "\n") {
          removeEnd += 1;
        }
        newCode = newCode.slice(0, start) + newCode.slice(removeEnd);
      }

      return {
        code: newCode,
        map: null,
      };
    },
  };
}

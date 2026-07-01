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

// 提取 definePage 配置，收集剥离代码区间
function analyzeVueContent(
  content: string,
  filePath: string,
): null | VueAnalysis {
  if (!content.includes("definePage")) {
    return null;
  }
  const stripRanges: VueAnalysis["stripRanges"] = [];
  const { descriptor } = parseSFC(content);
  const blocks = [descriptor.scriptSetup, descriptor.script].filter(
    (b): b is NonNullable<typeof b> => {
      return Boolean(b);
    },
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
        const hit = node.specifiers.some((s) => {
          return (
            s.type === "ImportSpecifier" &&
            s.imported.type === "Identifier" &&
            s.imported.name === "definePage"
          );
        });
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
        console.warn(`解析失败(${filePath}): ${(err as Error).message}`);
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

// 收集文件路由与分析结果
function collectFileRoutes(srcRoot: string, routeDirs: string[]) {
  const routeSet = new Set<string>();
  const analysisMap = new Map<string, VueAnalysis>();
  for (const dir of routeDirs) {
    for (const filePath of walkFiles(path.resolve(srcRoot, dir))) {
      if (!filePath.endsWith(".vue")) {
        continue;
      }
      const route = toPosixPath(path.relative(srcRoot, filePath).slice(0, -4));
      routeSet.add(route);
      const result = analyzeVueContent(
        fs.readFileSync(filePath, "utf-8"),
        filePath,
      );
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
function getScanDirs(mainPackage: string, subPackages: string[]) {
  const dirSet = new Set<string>();
  const mainDir = normalizeDir(mainPackage);
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
    const matchedRoot = normalizedSubRoots.find((root) => {
      return route.startsWith(root + "/");
    });
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

  // 构建新的 pages.json 配置
  const merged: UniPagesJson = {
    ...pagesJson,
    pages: buildPages(mainRoutes, analysisMap, (r) => {
      return r;
    }),
    subPackages: normalizedSubRoots.map((root) => {
      return {
        root,
        pages: buildPages(subRouteMap.get(root) ?? [], analysisMap, (r) => {
          return `${root}/${r}`;
        }),
      };
    }),
  };

  return merged;
}

// 生成路由类型声明文件
function buildRouteDts(routes: string[]) {
  const routeUnion = routes
    .map((r) => {
      return `"/${r}"`;
    })
    .join(` |\n`);
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

// 获取缓存文件路径
function getCachePath(cacheDir: string, targetPath: string) {
  const cacheName = Buffer.from(path.resolve(targetPath)).toString("base64url");
  return path.join(cacheDir, "vite-plugin-uni-inject", "auto-pages", cacheName);
}

// 写入文件并缓存内容，避免重复写入
function writeFileWithCache(
  targetPath: string,
  nextContent: string,
  cacheDir: string,
  forceWrite = false,
) {
  const cachePath = getCachePath(cacheDir, targetPath);
  if (
    !forceWrite &&
    fs.existsSync(targetPath) &&
    fs.existsSync(cachePath) &&
    fs.readFileSync(cachePath, "utf-8") === nextContent
  ) {
    return;
  }
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, nextContent);
  fs.mkdirSync(path.dirname(cachePath), { recursive: true });
  fs.writeFileSync(cachePath, nextContent);
}

/**
 * 自动补全 pages.json 插件
 */
export default function uniAutoPages(opts?: AutoPagesPluginOptions) {
  const {
    mainPackage = "pages",
    subPackages = [],
    dts = "uni-pages.d.ts",
  } = opts || {};

  return {
    name: "vite-plugin-uni-auto-pages",
    enforce: "pre" as const,

    // 插件初始化
    configResolved(config: { cacheDir: string; root: string }) {
      const srcRoot = path.resolve(config.root, "src");

      // 读取当前 pages.json 文件
      const pagesJsonPath = path.join(srcRoot, "pages.json");
      const pagesJson = readPagesJson(pagesJsonPath);
      if (!pagesJson) {
        return;
      }

      // 收集文件路由与分析结果
      const { routes, analysisMap } = collectFileRoutes(
        srcRoot,
        getScanDirs(mainPackage, subPackages),
      );
      const merged = getPagesByFileRoute(
        routes,
        analysisMap,
        pagesJson,
        subPackages,
      );

      // 写入 pages.json 文件
      const newPagesJson = JSON.stringify(merged, null, 2) + "\n";
      const dtsPath = dts ? path.join(srcRoot, dts) : null;
      const shouldRefreshPagesJson = dtsPath ? !fs.existsSync(dtsPath) : false;
      writeFileWithCache(
        pagesJsonPath,
        newPagesJson,
        config.cacheDir,
        shouldRefreshPagesJson,
      );

      // 写入路由类型声明文件
      if (dtsPath) {
        const newDts = buildRouteDts(routes);
        writeFileWithCache(dtsPath, newDts, config.cacheDir);
      }
    },

    // 处理页面文件
    transform(code: string, id: string) {
      const pure = id.split("?")[0];
      if (!pure.endsWith(".vue")) {
        return;
      }

      const analysis = analyzeVueContent(code, pure);
      if (!analysis?.stripRanges.length) {
        return;
      }

      // 剥离宏定义代码区间，并处理可能残留的空行
      let newCode = code;
      const ranges = [...analysis.stripRanges].sort((a, b) => {
        return b.start - a.start;
      });
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

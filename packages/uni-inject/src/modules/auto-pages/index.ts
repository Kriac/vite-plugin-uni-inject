import type {
  AutoPagesPluginOptions,
  DefinePageConfig,
  UniPage,
  UniPagesJson,
} from "./types";
import { parse as parseBabel } from "@babel/parser";
import { parse as parseSFC } from "@vue/compiler-sfc";
import fs from "fs";
import path from "path";

function readPagesJson(pagesJsonPath: string) {
  if (!fs.existsSync(pagesJsonPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(pagesJsonPath, "utf-8")) as UniPagesJson;
}

function toPosixPath(value: string) {
  return value.replace(/\\/g, "/");
}

function normalizeDir(value: string) {
  return toPosixPath(value).replace(/^\/+|\/+$/g, "");
}

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

interface VueAnalysis {
  config: DefinePageConfig | null;
  stripRanges: { end: number; start: number }[];
}

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

function getScanDirs(srcRoot: string, pageDirs: string[]) {
  const normalizedPageDirs = pageDirs.map(normalizeDir).filter(Boolean);
  const scanDirs: string[] = [];
  function walkDirs(dirPath: string) {
    const relativeDir = toPosixPath(path.relative(srcRoot, dirPath));
    const matched = normalizedPageDirs.some((pageDir) => {
      return relativeDir === pageDir || relativeDir.endsWith(`/${pageDir}`);
    });
    if (matched) {
      scanDirs.push(relativeDir);
      return;
    }

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        walkDirs(path.join(dirPath, entry.name));
      }
    }
  }
  walkDirs(srcRoot);
  return scanDirs;
}

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

function getPagesByFileRoute(
  routes: string[],
  analysisMap: Map<string, VueAnalysis>,
  pagesJson: UniPagesJson,
  subPackageRoots: string[],
) {
  const mainRoutes: string[] = [];
  const subRouteMap = new Map<string, string[]>();

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

  const homeRoute = mainRoutes.find((r) => {
    return analysisMap.get(r)?.config?.home === true;
  });
  if (homeRoute) {
    mainRoutes.splice(mainRoutes.indexOf(homeRoute), 1);
    mainRoutes.unshift(homeRoute);
  }

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

function buildRouteDts(routes: string[]) {
  const routeUnion = routes
    .map((r) => {
      return `"/${r}"`;
    })
    .join(` |\n`);
  return `import type { DefinePageConfig } from "vite-plugin-uni-inject";

// Auto-generated by vite-plugin-uni-inject. Do not edit.

/**
 * 提取路径
 */
export type ExtractPath<T extends string, Prefix extends string> = T extends \`\${Prefix}\${infer P}\` ? P : never;

/**
 * 路由路径
 */
export type RoutePath = ${routeUnion};

declare global {
  /**
   * Vue \`<script setup>\` 宏定义 uniapp 页面级配置。
   */
  function definePage(config: DefinePageConfig): void;
}
`;
}

function getCachePath(cacheDir: string, targetPath: string) {
  const cacheName = Buffer.from(path.resolve(targetPath)).toString("base64url");
  return path.join(cacheDir, "vite-plugin-uni-inject", "auto-pages", cacheName);
}

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
    pageDirs = ["pages"],
    subPackages = [],
    dts = "uni-pages.d.ts",
  } = opts || {};

  return {
    name: "vite-plugin-uni-auto-pages",
    enforce: "pre" as const,

    configResolved(config: { cacheDir: string; root: string }) {
      const srcRoot = path.resolve(config.root, "src");

      const pagesJsonPath = path.join(srcRoot, "pages.json");
      const pagesJson = readPagesJson(pagesJsonPath);
      if (!pagesJson) {
        return;
      }

      const { routes, analysisMap } = collectFileRoutes(
        srcRoot,
        getScanDirs(srcRoot, pageDirs),
      );
      const merged = getPagesByFileRoute(
        routes,
        analysisMap,
        pagesJson,
        subPackages,
      );

      const newPagesJson = JSON.stringify(merged, null, 2) + "\n";
      const dtsPath = dts ? path.join(srcRoot, dts) : null;
      const shouldRefreshPagesJson = dtsPath ? !fs.existsSync(dtsPath) : false;
      writeFileWithCache(
        pagesJsonPath,
        newPagesJson,
        config.cacheDir,
        shouldRefreshPagesJson,
      );

      if (dtsPath) {
        const newDts = buildRouteDts(routes);
        writeFileWithCache(dtsPath, newDts, config.cacheDir);
      }
    },

    transform(code: string, id: string) {
      const pure = id.split("?")[0];
      if (!pure.endsWith(".vue")) {
        return;
      }

      const analysis = analyzeVueContent(code, pure);
      if (!analysis?.stripRanges.length) {
        return;
      }

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

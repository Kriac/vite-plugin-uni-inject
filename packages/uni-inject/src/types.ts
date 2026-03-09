/** 页面路由配置 */
export interface UniPage {
  path: string;
  style?: unknown;
}

/** 分包JSON配置 */
export interface UniSubPackage {
  root: string;
  pages: UniPage[];
}

/** 页面JSON配置 */
export interface UniPagesJson {
  pages: UniPage[];
  subPackages?: UniSubPackage[];
}

/** 插件配置 */
export interface PluginOptions {
  /** 要注入的文件路径 - 基于项目 src 目录 */
  injectPath?: string;
}

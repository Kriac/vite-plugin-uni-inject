/**
 * 注入插件配置
 */
export interface InjectPluginOptions {
  /**
   * 注入的文件路径
   * @default './App.inject.vue'
   */
  path?: string;
}

/**
 * 页面配置
 */
export interface UniPage {
  path: string;
}

/**
 * 分包 JSON 配置
 */
export interface UniSubPackage {
  pages: UniPage[];
  root: string;
}

/**
 * 页面 JSON 配置
 */
export interface UniPagesJson {
  pages: UniPage[];
  subPackages?: UniSubPackage[];
}

/** 页面路由配置 */
export interface UniPage {
  path: string;
  [key: string]: unknown;
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

/** 注入插件配置 */
export interface InjectPluginOptions {
  /**
   * 注入的文件路径
   * @default 'src/App.inject.vue'
   */
  path?: string;
}

/** 自动补全 pages 插件配置 */
export interface AutoPagesPluginOptions {
  /**
   * 扫描目录
   * @default 'pages'
   */
  dir?: string;

  /**
   * 分包目录
   * @default []
   */
  subPackages?: string[];

  /**
   * 生成类型声明
   * @default 'src/uni-pages.d.ts'
   */
  dts?: string;
}

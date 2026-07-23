/** 页面 style 配置 */
export interface UniPageStyle {
  [key: string]: unknown;
  /** 窗口背景色 */
  backgroundColor?: string;
  /** 下拉加载样式 */
  backgroundTextStyle?: "dark" | "light";
  /** 是否禁止页面滚动 */
  disableScroll?: boolean;
  /** 是否开启下拉刷新 */
  enablePullDownRefresh?: boolean;
  /** 导航栏背景颜色 */
  navigationBarBackgroundColor?: string;
  /** 导航栏标题颜色 */
  navigationBarTextStyle?: "black" | "white";
  /** 导航栏标题文字 */
  navigationBarTitleText?: string;
  /** 触底距离 */
  onReachBottomDistance?: number;
  /** 自定义组件配置 */
  usingComponents?: Record<string, string>;
}

/** definePage 宏接收的页面配置 */
export interface DefinePageConfig {
  /** 标记为首页，仅主包页面生效。 */
  home?: boolean;
  /** 页面样式 */
  style?: UniPageStyle;
}

/** 页面配置 */
export interface UniPage extends DefinePageConfig {
  path: string;
}

/** 分包 JSON 配置 */
export interface UniSubPackage {
  pages: UniPage[];
  root: string;
}

/** 页面 JSON 配置 */
export interface UniPagesJson {
  pages: UniPage[];
  subPackages?: UniSubPackage[];
}

/** 自动补全 pages 插件配置 */
export interface AutoPagesPluginOptions {
  /**
   * 输出类型
   * @default './uni-pages.d.ts'
   */
  dts?: string;

  /**
   * 需要扫描的页面目录
   * @default ['pages']
   */
  pageDirs?: string[];

  /**
   * 分包目录
   * @default []
   */
  subPackages?: string[];
}

import type { RoutePath, ExtractPath } from "@/types/uni-pages";

/**
 * 测试注入代码
 */
export const sayHelloInject = () => {
  return "Hello Inject";
};

/**
 * 前往指定页面
 */
export const navigateTo = (url: RoutePath) => {
  uni.navigateTo({
    url,
  });
};

/** 提取教程分包页面路径 */
type TutorialRath = ExtractPath<RoutePath, "/subPackages/tutorial">;

/**
 * 前往教程分包页面
 */
export const navigateToTutorial = (url: TutorialRath) => {
  uni.navigateTo({
    url: `/subPackages/tutorial${url}`,
  });
};

import type { ExtractPath, RoutePath } from "@/types/uni-pages";

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

type TutorialRath = ExtractPath<RoutePath, "/sub-packages/tutorial">;

/**
 * 前往教程分包页面
 */
export const navigateToTutorial = (url: TutorialRath) => {
  uni.navigateTo({
    url: `/sub-packages/tutorial${url}`,
  });
};

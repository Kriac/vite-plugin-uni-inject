import { showToast } from "@tdesign/uniapp";

/**
 * 消息提示
 */
export const useMessage = () => {
  const showTips = () => {
    showToast({
      message: "Toast Tips",
    });
  };

  return {
    showTips,
  };
};

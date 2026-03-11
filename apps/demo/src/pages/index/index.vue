<script setup lang="ts">
import { useToast } from "wot-design-uni";
import { navigateTo } from "@/libs/utils";

const toast = useToast("page-toast");

// 显示提示
const showToast = () => {
  toast.show({
    msg: "这是一个提示信息",
  });
};

// 跳转更多
const goToMore = () => {
  navigateTo("/pages/more/test");
};

console.log("Hello Page");
</script>

<template>
  <wd-navbar safe-area-inset-top title="示例项目" />
  <div class="content">
    <wd-button @click="showToast">点击显示</wd-button>
    <wd-button @click="goToMore">跳转更多</wd-button>
  </div>
</template>

<style scoped lang="scss">
.content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 200px;
}
</style>

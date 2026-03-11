<script setup lang="ts">
import { navigateToTutorial } from "@/libs/utils";

// 返回上一页
const back = () => {
  uni.navigateBack();
};

// 跳转教程
const goToTutorial = () => {
  navigateToTutorial("/pages/index/index");
};

// 跳转注入教程
const goToInjectTutorial = () => {
  navigateToTutorial("/pages/more/inject");
};
</script>

<template>
  <wd-navbar
    safe-area-inset-top
    left-arrow
    title="更多示例"
    @click-left="back"
  />
  <div class="content">
    <wd-button @click="goToTutorial">跳转教程</wd-button>
    <wd-button @click="goToInjectTutorial">跳转注入教程</wd-button>
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

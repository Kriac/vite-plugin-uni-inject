<script setup lang="ts">
import { showToast } from "@tdesign/uniapp";
import { navigateTo } from "@/libs/utils";

// 显示提示
const showTips = () => {
  showToast({
    message: "Hello Page",
  });
};

// 跳转更多
const goToMore = () => {
  navigateTo("/pages/more/test");
};

console.log("Hello Page");
</script>

<template>
  <t-navbar title="示例项目" placeholder />
  <div class="content">
    <t-button @click="showTips">点击显示</t-button>
    <t-button @click="goToMore">跳转更多</t-button>
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

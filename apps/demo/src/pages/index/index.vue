<script setup lang="ts">
import { navigateTo } from "@/libs/utils";
import { useMessage } from "@/hooks/useMessage";

const { showTips } = useMessage();

// 跳转测试注入页面
const goToTestPages = () => {
  navigateTo("/pages/more/test");
};

console.log("Hello Page");
</script>

<template>
  <t-navbar title="示例项目" placeholder />
  <div class="content">
    <t-button @click="showTips">点击显示</t-button>
    <t-button @click="goToTestPages">跳转测试注入页面</t-button>
  </div>
</template>

<style scoped lang="scss"></style>

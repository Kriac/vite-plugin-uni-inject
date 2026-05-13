<script setup lang="ts">
import { useMessage } from "@/hooks/useMessage";
import { navigateToTutorial } from "@/libs/utils";

const { showTips } = useMessage();

// 跳转分包注入示例
const goToSubInject = () => {
  navigateToTutorial("/pages/index/index");
};

console.log("Hello Test Page");
</script>

<template>
  <t-navbar title="测试注入示例" left-arrow placeholder />
  <div class="content">
    <t-button @click="showTips">点击显示</t-button>
    <t-button @click="goToSubInject">跳转分包注入示例</t-button>
  </div>
</template>

<style scoped lang="scss"></style>

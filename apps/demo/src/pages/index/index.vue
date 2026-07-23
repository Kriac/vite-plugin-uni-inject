<script setup lang="ts">
import { navigateTo } from "@/libs/utils";
import { useMessage } from "@/hooks/useMessage";

const { showTips } = useMessage();

const goToTestPages = () => {
  navigateTo("/pages/more/test");
};

definePage({
  home: true,
  style: {
    disableScroll: true,
  },
});
</script>

<template>
  <t-navbar title="示例项目" placeholder />
  <div class="content">
    <t-button @click="showTips">点击显示</t-button>
    <t-button @click="goToTestPages">跳转测试注入页面</t-button>
  </div>
</template>

<style scoped lang="scss"></style>

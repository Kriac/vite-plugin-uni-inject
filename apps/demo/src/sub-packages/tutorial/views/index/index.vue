<script setup lang="ts">
import { useMessage } from "@/hooks/useMessage";

const { showTips } = useMessage();

console.log("Hello SubPackage Page");
</script>

<template>
  <t-navbar title="分包注入示例" left-arrow placeholder />
  <div class="content">
    <t-button @click="showTips">点击显示</t-button>
  </div>
</template>

<style scoped lang="scss"></style>

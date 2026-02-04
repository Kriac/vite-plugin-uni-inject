<script setup lang="ts">
import { useToast } from "wot-design-uni";

const toast = useToast("page-toast");

const showToast = () => {
  toast.show({
    msg: "这是一个提示信息",
  });
};

console.log("Hello Page");
</script>

<template>
  <wd-navbar safe-area-inset-top title="示例项目" />
  <div class="content">
    <wd-button @click="showToast">点击显示</wd-button>
  </div>
</template>

<style scoped lang="scss">
.content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 200px;
}
</style>

<script setup lang="ts">
// 返回上一页
const back = () => {
  uni.navigateBack();
};
</script>

<template>
  <wd-navbar
    safe-area-inset-top
    left-arrow
    title="注入示例"
    @click-left="back"
  />
</template>

<style scoped lang="scss"></style>

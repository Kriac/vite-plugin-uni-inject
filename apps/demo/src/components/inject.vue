<script setup lang="ts">
import { sayHelloInject } from "@/libs/utils";

console.log(sayHelloInject());
</script>

<template>
  <t-toast ref="t-toast" />
</template>

<style scoped lang="scss"></style>

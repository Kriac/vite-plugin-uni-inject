<script setup lang="ts">
import { onLaunch } from "@dcloudio/uni-app";

onLaunch(() => {
  console.log("Hello World");
});
</script>

<style lang="scss">
.content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding-top: 100px;
}
</style>

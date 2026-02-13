<template>
  <div class="app-container">
    <!-- 地图组件 -->
    <MapView />
  </div>
</template>

<script setup>
import MapView from './components/MapView.vue'
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.app-container {
  width: 100%;
  height: 100%;
  background-color: #0F0F23;
}
</style>

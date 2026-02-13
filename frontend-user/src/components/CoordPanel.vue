<template>
  <div v-if="coord" class="coord-panel">
    <div class="coord-title">📍 点击位置坐标</div>
    <div class="coord-value">
      纬度: {{ coord.lat }}<br/>
      经度: {{ coord.lng }}
    </div>
    <button class="copy-btn" @click="copyCoord">
      {{ copyText }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import logger from '../utils/logger'

const props = defineProps({
  coord: Object
})

const emit = defineEmits(['copied'])

const copyText = ref('复制经纬度')

const copyCoord = async () => {
  if (!props.coord) return
  
  const coordStr = `${props.coord.lat}, ${props.coord.lng}`
  
  try {
    await navigator.clipboard.writeText(coordStr)
    copyText.value = '已复制!'
    emit('copied')
    logger.info('CoordPanel', '经纬度已复制', { coord: coordStr })
    
    setTimeout(() => {
      copyText.value = '复制经纬度'
    }, 2000)
  } catch (err) {
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = coordStr
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    copyText.value = '已复制!'
    emit('copied')
    logger.info('CoordPanel', '经纬度已复制(降级)', { coord: coordStr })
    setTimeout(() => {
      copyText.value = '复制经纬度'
    }, 2000)
  }
}
</script>

<style scoped>
.coord-panel {
  position: absolute;
  bottom: 30px;
  left: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 15px 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 100;
  min-width: 220px;
}

.coord-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.coord-value {
  font-size: 13px;
  color: #555;
  font-family: 'Courier New', monospace;
  line-height: 1.6;
  margin-bottom: 12px;
}

.copy-btn {
  width: 100%;
  padding: 10px;
  background: #FFE66D;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  color: #333;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
}

.copy-btn:hover {
  background: #ffd93d;
  transform: scale(1.02);
}

.copy-btn:active {
  transform: scale(0.98);
}

@media (max-width: 768px) {
  .coord-panel {
    left: 10px;
    right: 10px;
    bottom: 120px;
    min-width: auto;
  }
}
</style>

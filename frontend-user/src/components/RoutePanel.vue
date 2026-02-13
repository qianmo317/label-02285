<template>
  <div class="route-panel">
    <button class="route-toggle-btn" @click="showPanel = !showPanel">
      {{ showPanel ? '收起' : '路线规划' }}
    </button>
    <div v-if="showPanel" class="route-inputs">
      <input
        v-model="startPoint"
        type="text"
        placeholder="起点 (地名或经纬度)"
      />
      <input
        v-model="endPoint"
        type="text"
        placeholder="终点 (地名或经纬度)"
      />
      <button class="plan-btn" @click="handlePlan" :disabled="isPlanning">
        {{ isPlanning ? '规划中...' : '生成路线' }}
      </button>
      <button v-if="hasRoute" class="clear-route-btn" @click="$emit('clear')">
        清除路线
      </button>
      <div v-if="error" class="route-error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSearch } from '../composables/useSearch'
import logger from '../utils/logger'

const props = defineProps({
  hasRoute: Boolean
})

const emit = defineEmits(['plan', 'clear'])

const showPanel = ref(false)
const startPoint = ref('')
const endPoint = ref('')
const isPlanning = ref(false)
const error = ref('')

const { search } = useSearch()

const handlePlan = async () => {
  error.value = ''
  
  if (!startPoint.value.trim()) {
    error.value = '请输入起点'
    return
  }
  if (!endPoint.value.trim()) {
    error.value = '请输入终点'
    return
  }

  isPlanning.value = true
  logger.info('RoutePanel', '开始规划路线', { start: startPoint.value, end: endPoint.value })

  try {
    const startResult = await search(startPoint.value)
    if (!startResult) {
      error.value = '无法识别起点位置'
      return
    }

    const endResult = await search(endPoint.value)
    if (!endResult) {
      error.value = '无法识别终点位置'
      return
    }

    emit('plan', {
      start: [startResult.lng, startResult.lat],
      end: [endResult.lng, endResult.lat]
    })
  } catch (err) {
    error.value = '路线规划失败'
    logger.error('RoutePanel', '路线规划出错', { error: err.message })
  } finally {
    isPlanning.value = false
  }
}
</script>

<style scoped>
.route-panel {
  position: absolute;
  bottom: 30px;
  right: 20px;
  z-index: 100;
}

.route-toggle-btn {
  padding: 12px 24px;
  background: #00D4AA;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  font-weight: bold;
  color: #fff;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 212, 170, 0.4);
  transition: transform 0.2s, box-shadow 0.2s;
}

.route-toggle-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 212, 170, 0.5);
}

.route-inputs {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 15px;
  margin-top: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 280px;
}

.route-inputs input {
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}

.route-inputs input:focus {
  border-color: #00D4AA;
}

.route-inputs input::placeholder {
  color: #999;
}

.plan-btn {
  padding: 12px;
  background: #00D4AA;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}

.plan-btn:hover:not(:disabled) {
  background: #00b894;
}

.plan-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.clear-route-btn {
  padding: 10px;
  background: #ff6b6b;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: bold;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}

.clear-route-btn:hover {
  background: #ee5a5a;
}

.route-error {
  color: #ff6b6b;
  font-size: 12px;
  text-align: center;
}

@media (max-width: 768px) {
  .route-panel {
    left: 10px;
    right: 10px;
    bottom: 20px;
  }
  .route-inputs {
    min-width: auto;
  }
  .route-toggle-btn {
    width: 100%;
  }
}
</style>

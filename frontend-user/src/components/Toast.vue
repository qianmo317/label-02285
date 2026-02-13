<template>
  <teleport to="body">
    <transition name="toast-fade">
      <div v-if="visible" class="toast" :class="type">
        <span class="toast-icon">{{ icon }}</span>
        <span class="toast-message">{{ message }}</span>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: Boolean,
  message: String,
  type: {
    type: String,
    default: 'info',
    validator: (v) => ['success', 'error', 'warning', 'info', 'copied'].includes(v)
  }
})

const icon = computed(() => {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
    copied: '✓'
  }
  return icons[props.type]
})
</script>

<style scoped>
.toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  z-index: 2000;
}

.toast-icon {
  font-size: 18px;
}

/* 成功提示 - 绿色 */
.toast.success {
  background: #00D4AA;
  color: #fff;
}

/* 错误提示 - 红色 */
.toast.error {
  background: #ff6b6b;
  color: #fff;
}

/* 警告提示 - 黄色 */
.toast.warning {
  background: #FFE66D;
  color: #333;
}

/* 信息提示 - 蓝色 */
.toast.info {
  background: #4a9eff;
  color: #fff;
}

/* 复制成功专用 - 红色（符合prompt要求） */
.toast.copied {
  background: #ff6b6b;
  color: #fff;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9);
}
</style>

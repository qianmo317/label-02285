<template>
  <teleport to="body">
    <transition name="dialog-fade">
      <div v-if="visible" class="dialog-overlay" @click.self="handleClose">
        <div class="dialog" :class="type">
          <div class="dialog-header">
            <span class="dialog-icon">{{ icon }}</span>
            <span class="dialog-title">{{ title }}</span>
          </div>
          <div class="dialog-content">{{ message }}</div>
          <div class="dialog-footer">
            <button v-if="showCancel" class="dialog-btn cancel" @click="handleCancel">
              {{ cancelText }}
            </button>
            <button class="dialog-btn confirm" :class="type" @click="handleConfirm">
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: Boolean,
  title: { type: String, default: '提示' },
  message: String,
  type: {
    type: String,
    default: 'info',
    validator: (v) => ['success', 'error', 'warning', 'info', 'confirm'].includes(v)
  },
  showCancel: { type: Boolean, default: false },
  confirmText: { type: String, default: '确定' },
  cancelText: { type: String, default: '取消' }
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

const icon = computed(() => {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
    confirm: '?'
  }
  return icons[props.type]
})

const handleConfirm = () => emit('confirm')
const handleCancel = () => emit('cancel')
const handleClose = () => emit('close')
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.dialog {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  min-width: 300px;
  max-width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.dialog-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
}

.dialog.success .dialog-icon { background: #e8f8f4; color: #00D4AA; }
.dialog.error .dialog-icon { background: #ffe8e8; color: #ff6b6b; }
.dialog.warning .dialog-icon { background: #fff8e0; color: #f0a500; }
.dialog.info .dialog-icon { background: #e8f2ff; color: #4a9eff; }
.dialog.confirm .dialog-icon { background: #f0f0f0; color: #666; }

.dialog-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.dialog-content {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.dialog-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.dialog-btn.cancel {
  background: #f0f0f0;
  color: #666;
}

.dialog-btn.cancel:hover {
  background: #e0e0e0;
}

.dialog-btn.confirm {
  color: #fff;
}

.dialog-btn.confirm.success { background: #00D4AA; }
.dialog-btn.confirm.success:hover { background: #00b894; }
.dialog-btn.confirm.error { background: #ff6b6b; }
.dialog-btn.confirm.error:hover { background: #ee5a5a; }
.dialog-btn.confirm.warning { background: #f0a500; color: #fff; }
.dialog-btn.confirm.warning:hover { background: #d99400; }
.dialog-btn.confirm.info { background: #4a9eff; }
.dialog-btn.confirm.info:hover { background: #3a8eef; }
.dialog-btn.confirm.confirm { background: #00D4AA; }
.dialog-btn.confirm.confirm:hover { background: #00b894; }

.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: all 0.3s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-fade-enter-from .dialog,
.dialog-fade-leave-to .dialog {
  transform: scale(0.9);
}
</style>

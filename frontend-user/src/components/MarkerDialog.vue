<template>
  <teleport to="body">
    <transition name="dialog-fade">
      <div v-if="visible" class="dialog-overlay" @click.self="handleClose">
        <div class="marker-dialog">
          <div class="dialog-header">
            <span class="dialog-icon">📍</span>
            <span class="dialog-title">{{ isEdit ? '编辑标注点' : '添加标注点' }}</span>
          </div>
          <div class="dialog-content">
            <div class="form-group">
              <label>标注点名称</label>
              <input
                v-model="formData.name"
                type="text"
                placeholder="请输入标注点名称"
                maxlength="50"
                ref="nameInput"
              />
            </div>
            <div class="form-group">
              <label>备注 (可选)</label>
              <textarea
                v-model="formData.remark"
                placeholder="添加备注信息"
                maxlength="200"
                rows="3"
              ></textarea>
            </div>
            <div class="coord-display">
              <span class="coord-label">坐标:</span>
              <span class="coord-value">{{ lat.toFixed(6) }}, {{ lng.toFixed(6) }}</span>
            </div>
          </div>
          <div class="dialog-footer">
            <button class="dialog-btn cancel" @click="handleCancel">取消</button>
            <button class="dialog-btn confirm" @click="handleConfirm" :disabled="!formData.name.trim()">
              {{ isEdit ? '保存修改' : '添加标注' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  visible: Boolean,
  lng: { type: Number, default: 0 },
  lat: { type: Number, default: 0 },
  marker: { type: Object, default: null }
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

const formData = ref({
  name: '',
  remark: ''
})

const nameInput = ref(null)

const isEdit = ref(false)

watch(() => props.visible, (val) => {
  if (val) {
    if (props.marker) {
      isEdit.value = true
      formData.value.name = props.marker.name
      formData.value.remark = props.marker.remark || ''
    } else {
      isEdit.value = false
      formData.value.name = ''
      formData.value.remark = ''
    }
    nextTick(() => {
      if (nameInput.value) {
        nameInput.value.focus()
      }
    })
  }
})

const handleConfirm = () => {
  if (!formData.value.name.trim()) return
  emit('confirm', {
    name: formData.value.name.trim(),
    remark: formData.value.remark.trim()
  })
}

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

.marker-dialog {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.dialog-icon {
  font-size: 24px;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.dialog-content {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #6c5ce7;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #999;
}

.form-group textarea {
  resize: none;
  font-family: inherit;
}

.coord-display {
  background: #f8f9ff;
  padding: 12px 15px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.coord-label {
  font-size: 13px;
  font-weight: 500;
  color: #6c5ce7;
}

.coord-value {
  font-size: 13px;
  color: #333;
  font-family: monospace;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.dialog-btn {
  padding: 12px 24px;
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
  background: #6c5ce7;
  color: #fff;
}

.dialog-btn.confirm:hover:not(:disabled) {
  background: #5b4cdb;
}

.dialog-btn.confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: all 0.3s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-fade-enter-from .marker-dialog,
.dialog-fade-leave-to .marker-dialog {
  transform: scale(0.9);
}
</style>

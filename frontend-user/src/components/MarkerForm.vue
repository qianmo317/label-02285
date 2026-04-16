<template>
  <div class="marker-form-overlay" v-if="visible" @click.self="handleCancel">
    <div class="marker-form">
      <div class="form-header">
        <h3>{{ editingMarker ? '编辑标注点' : '新增标注点' }}</h3>
        <button class="close-btn" @click="handleCancel">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="form-body">
        <div class="form-group">
          <label for="marker-name">名称 <span class="required">*</span></label>
          <input
            id="marker-name"
            v-model="formData.name"
            type="text"
            class="form-input"
            placeholder="请输入标注点名称"
            @keyup.enter="handleConfirm"
          />
        </div>

        <div class="form-group">
          <label for="marker-remark">备注</label>
          <textarea
            id="marker-remark"
            v-model="formData.remark"
            class="form-textarea"
            placeholder="请输入备注信息（可选）"
            rows="3"
          ></textarea>
        </div>

        <div class="form-group coord-info">
          <label>坐标</label>
          <div class="coord-value">
            <span>经度: {{ coord.lng.toFixed(9) }}</span>
            <span>纬度: {{ coord.lat.toFixed(9) }}</span>
          </div>
        </div>
      </div>

      <div class="form-footer">
        <button class="btn btn-secondary" @click="handleCancel">取消</button>
        <button class="btn btn-primary" @click="handleConfirm" :disabled="!formData.name.trim()">
          {{ editingMarker ? '保存修改' : '创建标注' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, reactive } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  editingMarker: {
    type: Object,
    default: null
  },
  coord: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const formData = reactive({
  name: '',
  remark: ''
})

// 监听编辑模式变化，初始化表单数据
watch(() => props.editingMarker, (marker) => {
  if (marker) {
    formData.name = marker.name
    formData.remark = marker.remark || ''
  } else {
    formData.name = ''
    formData.remark = ''
  }
}, { immediate: true })

// 监听弹窗关闭，重置表单
watch(() => props.visible, (newVal) => {
  if (!newVal) {
    formData.name = ''
    formData.remark = ''
  }
})

const handleConfirm = () => {
  if (!formData.name.trim()) return
  
  emit('confirm', {
    ...formData,
    name: formData.name.trim(),
    remark: formData.remark.trim()
  })
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.marker-form-overlay {
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

.marker-form {
  width: 400px;
  background: #1A1A2E;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.form-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #fff;
}

.close-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.form-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.form-group .required {
  color: #FF3E3E;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #fff;
  font-size: 14px;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #FF3E3E;
  background: rgba(255, 62, 62, 0.05);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.coord-info {
  background: rgba(255, 255, 255, 0.03);
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 0;
}

.coord-value {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  font-family: monospace;
}

.form-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-primary {
  background: #FF3E3E;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #ff5252;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

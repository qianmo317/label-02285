<template>
  <div v-if="visible" class="marker-dialog-overlay" @click.self="handleClose">
    <div class="marker-dialog">
      <div class="dialog-header">
        <h3 class="dialog-title">{{ isEdit ? '编辑标注' : '添加标注' }}</h3>
        <button class="close-btn" @click="handleClose">×</button>
      </div>
      
      <div class="dialog-body">
        <div class="form-group">
          <label class="form-label">名称</label>
          <input 
            v-model="form.name" 
            type="text" 
            class="form-input" 
            placeholder="请输入标注名称"
            maxlength="50"
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">备注</label>
          <textarea 
            v-model="form.remark" 
            class="form-textarea" 
            placeholder="请输入备注信息（可选）"
            rows="3"
            maxlength="200"
          ></textarea>
        </div>
        
        <div class="coord-info">
          <span class="coord-label">经纬度:</span>
          <span class="coord-value">{{ lat?.toFixed(6) }}, {{ lng?.toFixed(6) }}</span>
        </div>
      </div>
      
      <div class="dialog-footer">
        <button class="btn btn-cancel" @click="handleClose">取消</button>
        <button class="btn btn-confirm" @click="handleConfirm" :disabled="!form.name.trim()">
          {{ isEdit ? '保存' : '添加' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  marker: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['confirm', 'close'])

const form = ref({
  name: '',
  remark: ''
})

const lng = ref(null)
const lat = ref(null)
const isEdit = ref(false)

watch(() => props.visible, (val) => {
  if (val) {
    if (props.marker) {
      isEdit.value = true
      form.value = {
        name: props.marker.name || '',
        remark: props.marker.remark || ''
      }
      lng.value = props.marker.lng
      lat.value = props.marker.lat
    } else {
      isEdit.value = false
      form.value = {
        name: '',
        remark: ''
      }
    }
  }
}, { immediate: true })

watch(() => props.marker, (val) => {
  if (val && props.visible) {
    isEdit.value = true
    form.value = {
      name: val.name || '',
      remark: val.remark || ''
    }
    lng.value = val.lng
    lat.value = val.lat
  }
})

const setCoord = (lngVal, latVal) => {
  lng.value = lngVal
  lat.value = latVal
}

const handleConfirm = () => {
  if (!form.value.name.trim()) return
  
  emit('confirm', {
    ...form.value,
    lng: lng.value,
    lat: lat.value,
    id: props.marker?.id
  })
}

const handleClose = () => {
  emit('close')
}

defineExpose({ setCoord })
</script>

<style scoped>
.marker-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.marker-dialog {
  background: #1a1a2e;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #2a2a4e;
}

.dialog-title {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: #2a2a4e;
  color: #999;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #3a3a5e;
  color: #fff;
}

.dialog-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  color: #ccc;
  font-size: 14px;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  background: #2a2a4e;
  border: 1px solid #3a3a5e;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #4a9eff;
}

.form-input::placeholder {
  color: #666;
}

.form-textarea {
  width: 100%;
  padding: 10px 12px;
  background: #2a2a4e;
  border: 1px solid #3a3a5e;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  outline: none;
  resize: none;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-textarea:focus {
  border-color: #4a9eff;
}

.form-textarea::placeholder {
  color: #666;
}

.coord-info {
  padding: 10px 12px;
  background: #252540;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.coord-label {
  color: #888;
  font-size: 13px;
}

.coord-value {
  color: #4a9eff;
  font-size: 13px;
  font-family: monospace;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #2a2a4e;
}

.btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #2a2a4e;
  color: #ccc;
}

.btn-cancel:hover {
  background: #3a3a5e;
}

.btn-confirm {
  background: #4a9eff;
  color: #fff;
}

.btn-confirm:hover:not(:disabled) {
  background: #3a8eef;
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

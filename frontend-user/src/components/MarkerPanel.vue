<template>
  <div class="marker-panel">
    <button 
      class="marker-toggle-btn" 
      :class="{ active: isMarkerMode }"
      @click="handleToggle"
    >
      {{ isMarkerMode ? '关闭标注' : '标注模式' }}
    </button>
    <div v-if="showPanel" class="marker-list-container">
      <div class="panel-header">
        <h3>标注点管理</h3>
        <span class="marker-count">{{ markers.length }} 个标注</span>
      </div>
      <div v-if="markers.length === 0" class="empty-state">
        <p>暂无标注点</p>
        <p v-if="isMarkerMode" class="hint">点击地图添加标注</p>
      </div>
      <div v-else class="marker-list">
        <div 
          v-for="marker in markers" 
          :key="marker.id" 
          class="marker-item"
          @click="$emit('locate', marker)"
        >
          <div class="marker-info">
            <div class="marker-name">{{ marker.name }}</div>
            <div class="marker-coord">
              {{ marker.lat.toFixed(4) }}, {{ marker.lng.toFixed(4) }}
            </div>
            <div v-if="marker.remark" class="marker-remark">{{ marker.remark }}</div>
          </div>
          <div class="marker-actions">
            <button class="edit-btn" @click.stop="handleEdit(marker)">编辑</button>
            <button class="delete-btn" @click.stop="handleDelete(marker)">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  markers: {
    type: Array,
    default: () => []
  },
  isMarkerMode: {
    type: Boolean,
    default: false
  },
  showPanel: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['toggle-mode', 'locate', 'edit', 'delete'])

const handleToggle = () => {
  console.log('=== MarkerPanel: 点击标注模式按钮 ===')
  emit('toggle-mode')
}

const handleEdit = (marker) => {
  console.log('=== MarkerPanel: 点击编辑按钮 ===', marker)
  emit('edit', marker)
}

const handleDelete = (marker) => {
  console.log('=== MarkerPanel: 点击删除按钮 ===', marker)
  emit('delete', marker)
}
</script>

<style scoped>
.marker-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
}

.marker-toggle-btn {
  padding: 12px 24px;
  background: #6c5ce7;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  font-weight: bold;
  color: #fff;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(108, 92, 231, 0.4);
  transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
  align-self: flex-end;
}

.marker-toggle-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(108, 92, 231, 0.5);
}

.marker-toggle-btn.active {
  background: #a29bfe;
}

.marker-list-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  margin-top: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 100px);
  width: 320px;
  overflow: hidden;
}

.panel-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.marker-count {
  font-size: 12px;
  color: #999;
  background: #f0f0f0;
  padding: 4px 10px;
  border-radius: 12px;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #999;
}

.empty-state p {
  margin: 5px 0;
  font-size: 14px;
}

.empty-state .hint {
  font-size: 12px;
  color: #6c5ce7;
}

.marker-list {
  overflow-y: auto;
  flex: 1;
}

.marker-item {
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.marker-item:hover {
  background: #f8f9ff;
}

.marker-info {
  flex: 1;
  min-width: 0;
}

.marker-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.marker-coord {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.marker-remark {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.marker-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.edit-btn,
.delete-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.edit-btn {
  background: #e8f5e9;
  color: #2e7d32;
}

.edit-btn:hover {
  background: #c8e6c9;
}

.delete-btn {
  background: #ffebee;
  color: #c62828;
}

.delete-btn:hover {
  background: #ffcdd2;
}

@media (max-width: 768px) {
  .marker-panel {
    left: 10px;
    right: 10px;
    top: 10px;
  }
  
  .marker-list-container {
    width: 100%;
    max-height: 50vh;
  }
}
</style>

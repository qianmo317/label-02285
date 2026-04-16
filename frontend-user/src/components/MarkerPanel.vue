<template>
  <div class="marker-panel" :class="{ expanded: isExpanded }">
    <div class="panel-header" @click="togglePanel">
      <div class="header-left">
        <svg class="marker-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        <span class="panel-title">标注点</span>
        <span class="marker-count">{{ markers.length }}</span>
      </div>
      <svg class="toggle-icon" :class="{ rotated: isExpanded }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </div>
    
    <div v-if="isExpanded" class="panel-content">
      <div class="mode-toggle">
        <button 
          class="mode-btn" 
          :class="{ active: markerMode }"
          @click="handleToggleMode"
        >
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          标注模式
        </button>
      </div>
      
      <div v-if="markers.length === 0" class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        <p class="empty-text">暂无标注点</p>
        <p class="empty-hint">开启标注模式，点击地图添加</p>
      </div>
      
      <div v-else class="marker-list">
        <div 
          v-for="marker in markers" 
          :key="marker.id" 
          class="marker-item"
          @click="handleLocate(marker)"
        >
          <div class="marker-info">
            <div class="marker-name">{{ marker.name }}</div>
            <div v-if="marker.remark" class="marker-remark">{{ marker.remark }}</div>
            <div class="marker-coord">
              {{ marker.lat?.toFixed(6) }}, {{ marker.lng?.toFixed(6) }}
            </div>
          </div>
          <div class="marker-actions">
            <button class="action-btn edit-btn" @click.stop="handleEdit(marker)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="action-btn delete-btn" @click.stop="handleDelete(marker)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useMarker } from '../composables/useMarker'
import logger from '../utils/logger'

const emit = defineEmits(['locate', 'edit', 'delete', 'toggleMode'])

const { markers, markerMode, toggleMarkerMode, deleteMarker } = useMarker()

const isExpanded = ref(true)

watch(() => markerMode.value, (isActive) => {
  logger.info('MarkerPanel', '标注模式状态变化', { isActive })
})

const handleToggleMode = () => {
  toggleMarkerMode()
  emit('toggleMode')
  logger.info('MarkerPanel', '点击标注模式按钮，触发 toggleMode 事件')
}

const togglePanel = () => {
  isExpanded.value = !isExpanded.value
}

const handleLocate = (marker) => {
  emit('locate', marker)
}

const handleEdit = (marker) => {
  emit('edit', marker)
}

const handleDelete = (marker) => {
  emit('delete', marker)
}
</script>

<style scoped>
.marker-panel {
  position: absolute;
  top: 80px;
  right: 16px;
  width: 300px;
  background: #1a1a2e;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  z-index: 100;
  transition: all 0.3s ease;
}

.marker-panel.expanded {
  max-height: calc(100vh - 120px);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #2a2a4e;
  user-select: none;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.marker-icon {
  width: 18px;
  height: 18px;
  color: #4a9eff;
}

.panel-title {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}

.marker-count {
  background: #4a9eff;
  color: #fff;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 500;
}

.toggle-icon {
  width: 18px;
  height: 18px;
  color: #888;
  transition: transform 0.3s ease;
}

.toggle-icon.rotated {
  transform: rotate(90deg);
}

.panel-content {
  max-height: calc(100vh - 180px);
  overflow-y: auto;
}

.mode-toggle {
  padding: 12px 16px;
  border-bottom: 1px solid #2a2a4e;
}

.mode-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  background: #2a2a4e;
  border: 1px solid #3a3a5e;
  border-radius: 8px;
  color: #ccc;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn:hover {
  background: #3a3a5e;
}

.mode-btn.active {
  background: rgba(74, 158, 255, 0.15);
  border-color: #4a9eff;
  color: #4a9eff;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: #444;
  margin: 0 auto 12px;
}

.empty-text {
  color: #888;
  font-size: 14px;
  margin: 0 0 4px;
}

.empty-hint {
  color: #555;
  font-size: 12px;
  margin: 0;
}

.marker-list {
  padding: 8px 0;
}

.marker-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #252540;
}

.marker-item:last-child {
  border-bottom: none;
}

.marker-item:hover {
  background: #252540;
}

.marker-info {
  flex: 1;
  min-width: 0;
}

.marker-name {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.marker-remark {
  color: #888;
  font-size: 12px;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.marker-coord {
  color: #666;
  font-size: 11px;
  font-family: monospace;
}

.marker-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.marker-item:hover .marker-actions {
  opacity: 1;
}

.action-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.action-btn svg {
  width: 14px;
  height: 14px;
}

.edit-btn {
  color: #4a9eff;
}

.edit-btn:hover {
  background: rgba(74, 158, 255, 0.15);
}

.delete-btn {
  color: #ff6b6b;
}

.delete-btn:hover {
  background: rgba(255, 107, 107, 0.15);
}

.panel-content::-webkit-scrollbar {
  width: 4px;
}

.panel-content::-webkit-scrollbar-track {
  background: transparent;
}

.panel-content::-webkit-scrollbar-thumb {
  background: #3a3a5e;
  border-radius: 2px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: #4a4a6e;
}
</style>

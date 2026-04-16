<template>
  <div class="marker-panel" :class="{ 'expanded': expanded }">
    <!-- 面板头部 -->
    <div class="panel-header" @click="togglePanel">
      <div class="header-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <span>标注点管理</span>
        <span class="count">{{ markers.length }}</span>
      </div>
      <button 
        class="mode-btn" 
        :class="{ 'active': isMarkerMode }"
        @click.stop="toggleMarkerMode"
        :title="isMarkerMode ? '关闭标注模式' : '开启标注模式'"
      >
        <svg v-if="isMarkerMode" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"></path>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14"></path>
        </svg>
      </button>
      <button class="collapse-btn">
        <svg :class="{ 'rotated': expanded }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
    </div>

    <!-- 标注点列表 -->
    <div class="panel-content" v-if="expanded">
      <div v-if="markers.length === 0" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="1">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <p>暂无标注点</p>
        <p class="tip" v-if="isMarkerMode">点击地图任意位置添加标注点</p>
        <p class="tip" v-else>点击右上角 + 按钮开启标注模式</p>
      </div>

      <div v-else class="marker-list">
        <div 
          v-for="marker in markers" 
          :key="marker.id" 
          class="marker-item"
          :class="{ 'active': activeMarkerId === marker.id }"
          @click="flyToMarker(marker)"
        >
          <div class="marker-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#FF3E3E" stroke="white" stroke-width="1">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          <div class="marker-info">
            <div class="marker-name">{{ marker.name }}</div>
            <div class="marker-coord">
              {{ marker.lng.toFixed(6) }}, {{ marker.lat.toFixed(6) }}
            </div>
            <div v-if="marker.remark" class="marker-remark">{{ marker.remark }}</div>
          </div>
          <div class="marker-actions">
            <button 
              class="action-btn edit" 
              title="编辑"
              @click.stop="editMarker(marker)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button 
              class="action-btn delete" 
              title="删除"
              @click.stop="deleteMarker(marker)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  markers: {
    type: Array,
    default: () => []
  },
  isMarkerMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle-marker-mode', 'fly-to', 'edit', 'delete'])

const expanded = ref(true)
const activeMarkerId = ref(null)

const togglePanel = () => {
  expanded.value = !expanded.value
}

const toggleMarkerMode = () => {
  emit('toggle-marker-mode')
}

const flyToMarker = (marker) => {
  activeMarkerId.value = marker.id
  emit('fly-to', marker)
  // 2秒后取消高亮
  setTimeout(() => {
    activeMarkerId.value = null
  }, 2000)
}

const editMarker = (marker) => {
  emit('edit', marker)
}

const deleteMarker = (marker) => {
  emit('delete', marker)
}
</script>

<style scoped>
.marker-panel {
  position: absolute;
  left: 20px;
  top: 20px;
  width: 320px;
  background: rgba(15, 15, 35, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  z-index: 1000;
  transition: all 0.3s ease;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  user-select: none;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.count {
  background: #FF3E3E;
  color: #fff;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}

.mode-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.mode-btn.active {
  background: #FF3E3E;
}

.collapse-btn {
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

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.collapse-btn svg {
  transition: transform 0.3s ease;
}

.collapse-btn svg.rotated {
  transform: rotate(-90deg);
}

.panel-content {
  max-height: 480px;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.5);
  gap: 12px;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.empty-state .tip {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.marker-list {
  display: flex;
  flex-direction: column;
}

.marker-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
}

.marker-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.marker-item.active {
  background: rgba(255, 62, 62, 0.1);
  border-left: 3px solid #FF3E3E;
}

.marker-icon {
  margin-top: 2px;
  flex-shrink: 0;
}

.marker-info {
  flex: 1;
  min-width: 0;
}

.marker-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.marker-coord {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 4px;
  font-family: monospace;
}

.marker-remark {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.marker-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.marker-item:hover .marker-actions {
  opacity: 1;
}

.action-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.action-btn.edit {
  color: #4CAF50;
}

.action-btn.delete {
  color: #FF3E3E;
}

/* 滚动条样式 */
.panel-content::-webkit-scrollbar {
  width: 6px;
}

.panel-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.panel-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>

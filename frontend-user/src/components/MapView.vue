<template>
  <div class="map-wrapper" :class="{ 'marker-mode': isMarkerMode }">
    <!-- 地图容器 -->
    <div ref="mapContainer" class="map-container"></div>

    <!-- 搜索框组件 -->
    <SearchBox @locate="handleLocate" @clear="handleClearCoord" />

    <!-- 缩放控制组件 -->
    <ZoomControls @zoom-in="zoomIn" @zoom-out="zoomOut" />

    <!-- 经纬度显示组件 -->
    <CoordPanel :coord="clickedCoord" @copied="handleCopied" />

    <!-- 路线规划组件 -->
    <RoutePanel 
      :has-route="hasRoute" 
      @plan="handlePlanRoute" 
      @clear="handleClearRoute" 
    />

    <!-- 标注点管理组件 -->
    <MarkerPanel
      :markers="markers"
      :is-marker-mode="isMarkerMode"
      @toggle-mode="handleToggleMode"
      @locate="handleLocateMarker"
      @edit="handleEditMarker"
      @delete="handleDeleteMarker"
    />

    <!-- Toast 提示 -->
    <Toast :visible="toast.visible.value" :message="toast.message.value" :type="toast.type.value" />

    <!-- Dialog 对话框 -->
    <Dialog 
      :visible="dialog.visible.value"
      :title="dialog.title.value"
      :message="dialog.message.value"
      :type="dialog.type.value"
      :show-cancel="dialog.showCancel.value"
      :confirm-text="dialog.confirmText.value"
      :cancel-text="dialog.cancelText.value"
      @confirm="dialog.handleConfirm"
      @cancel="dialog.handleCancel"
      @close="dialog.handleClose"
    />

    <!-- 标注点对话框 -->
    <MarkerDialog
      :visible="markerDialogVisible"
      :lng="markerDialogLng"
      :lat="markerDialogLat"
      :marker="editingMarker"
      @confirm="handleMarkerDialogConfirm"
      @cancel="markerDialogVisible = false"
      @close="markerDialogVisible = false"
    />
  </div>
</template>

<script setup>
/**
 * 地图主视图组件
 * 整合所有子组件，协调地图交互
 */

import { ref, onMounted, onUnmounted, watch } from 'vue'
import { toLonLat } from 'ol/proj'
import { useMap } from '../composables/useMap'
import { useRoute } from '../composables/useRoute'
import { useToast } from '../composables/useToast'
import { useDialog } from '../composables/useDialog'
import { useMarker } from '../composables/useMarker'
import logger from '../utils/logger'

// 子组件
import SearchBox from './SearchBox.vue'
import ZoomControls from './ZoomControls.vue'
import CoordPanel from './CoordPanel.vue'
import RoutePanel from './RoutePanel.vue'
import MarkerPanel from './MarkerPanel.vue'
import MarkerDialog from './MarkerDialog.vue'
import Toast from './Toast.vue'
import Dialog from './Dialog.vue'

// 地图相关
const mapContainer = ref(null)
const clickedCoord = ref(null)

// 标注点对话框相关
const markerDialogVisible = ref(false)
const markerDialogLng = ref(0)
const markerDialogLat = ref(0)
const editingMarker = ref(null)

// Composables
const { map, routeLayer, markerLayer, initMap, zoomIn, zoomOut, flyTo, destroy, addLabelMarker, updateLabelMarker, removeLabelMarker } = useMap()
const { hasRoute, drawRoute, clearRoute } = useRoute()
const toast = useToast()
const dialog = useDialog()
const { markers, isMarkerMode, toggleMarkerMode, addMarker, updateMarker, deleteMarker } = useMarker()

/**
 * 处理复制成功
 */
const handleCopied = () => {
  toast.show('已复制', 'copied')
}

/**
 * 清除坐标显示
 */
const handleClearCoord = () => {
  clickedCoord.value = null
}

/**
 * 处理搜索定位
 */
const handleLocate = ({ lat, lng }) => {
  flyTo([lng, lat], 16)
  clickedCoord.value = {
    lat: lat.toFixed(9),
    lng: lng.toFixed(9)
  }
  logger.info('MapView', '定位到坐标', { lat, lng })
}

/**
 * 处理路线规划
 */
const handlePlanRoute = ({ start, end }) => {
  const extent = drawRoute(routeLayer.value, markerLayer.value, start, end)
  if (extent && map.value) {
    map.value.getView().fit(extent, {
      padding: [100, 100, 100, 100],
      duration: 500,
      maxZoom: 17
    })
    toast.success('路线规划完成')
  }
}

/**
 * 清除路线
 */
const handleClearRoute = () => {
  clearRoute(routeLayer.value, markerLayer.value)
  toast.info('路线已清除')
}

/**
 * 处理标注点定位
 */
const handleLocateMarker = (marker) => {
  flyTo([marker.lng, marker.lat], 17)
  toast.info(`已定位到: ${marker.name}`)
}

/**
 * 处理编辑标注点
 */
const handleEditMarker = (marker) => {
  editingMarker.value = marker
  markerDialogLng.value = marker.lng
  markerDialogLat.value = marker.lat
  markerDialogVisible.value = true
}

/**
 * 处理切换标注模式
 */
const handleToggleMode = () => {
  console.log('=== MapView: handleToggleMode 被调用 ===')
  toggleMarkerMode()
  console.log('=== 当前 isMarkerMode 状态 ===', isMarkerMode.value)
}

/**
 * 处理删除标注点
 */
const handleDeleteMarker = (marker) => {
  console.log('=== handleDeleteMarker 被调用 ===', marker)
  dialog.show({
    title: '确认删除',
    message: `确定要删除标注点 "${marker.name}" 吗？`,
    type: 'confirm',
    showCancel: true,
    confirmText: '删除',
    onConfirm: () => {
      console.log('=== 确认删除标注点 ===', marker.id)
      const deleted = deleteMarker(marker.id)
      console.log('=== deleteMarker 返回 ===', deleted)
      removeLabelMarker(marker.id)
      console.log('=== 当前标注点列表 ===', markers.value)
      toast.success('标注点已删除')
    }
  })
}

/**
 * 处理标注点对话框确认
 */
const handleMarkerDialogConfirm = ({ name, remark }) => {
  if (editingMarker.value) {
    const updated = updateMarker(editingMarker.value.id, name, remark)
    if (updated) {
      updateLabelMarker(updated.id, name)
      toast.success('标注点已更新')
    }
  } else {
    const newMarker = addMarker(markerDialogLng.value, markerDialogLat.value, name, remark)
    addLabelMarker(newMarker.id, newMarker.lng, newMarker.lat, newMarker.name)
    toast.success('标注点已添加')
  }
  markerDialogVisible.value = false
  editingMarker.value = null
}

onMounted(() => {
  logger.info('MapView', '组件挂载，初始化地图')
  
  const mapInstance = initMap(mapContainer.value)
  
  // 绑定点击事件
  mapInstance.on('click', (evt) => {
    console.log('=== 地图点击事件触发 ===', evt)
    
    const coord = evt.coordinate || mapInstance.getCoordinateAtPixel(evt.pixel)
    if (!coord) {
      console.error('无法获取点击坐标')
      return
    }
    
    const [lng, lat] = toLonLat(coord)
    clickedCoord.value = {
      lat: lat.toFixed(9),
      lng: lng.toFixed(9)
    }
    console.log('点击坐标:', clickedCoord.value, '标注模式:', isMarkerMode.value)
    
    if (isMarkerMode.value) {
      console.log('=== 打开标注对话框 ===')
      markerDialogLng.value = lng
      markerDialogLat.value = lat
      editingMarker.value = null
      markerDialogVisible.value = true
    }
  })
})

onUnmounted(() => {
  destroy()
  logger.info('MapView', '组件卸载，地图已销毁')
})

watch(isMarkerMode, (newVal) => {
  console.log('=== isMarkerMode 变化 ===', newVal)
  logger.info('MapView', 'isMarkerMode 变化', { newVal })
})
</script>

<style scoped>
.map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #0F0F23;
}

.map-wrapper.marker-mode .map-container {
  cursor: crosshair;
}

.map-container {
  width: 100%;
  height: 100%;
  background-color: #e8e8e8;
}

/* 隐藏 OpenLayers 默认控件和版权信息 */
:deep(.ol-attribution),
:deep(.ol-zoom) {
  display: none !important;
}

/**
 * OSM 地图样式优化
 * 通过 CSS 滤镜实现视觉效果：
 * - 降低饱和度弱化商家/广告标注
 * - 增加对比度突出道路线条
 * - 道路呈深灰色，绿地浅绿，水系浅蓝
 */
:deep(.base-map-layer) {
  filter: 
    saturate(0.4)      /* 降低饱和度，弱化彩色标注 */
    contrast(1.1)      /* 增加对比度，突出道路 */
    brightness(1.02);  /* 略微提亮 */
}

:deep(.base-map-layer canvas) {
  background: #f2f2f2;
}
</style>

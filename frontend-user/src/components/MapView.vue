<template>
  <div class="map-wrapper">
    <div ref="mapContainer" class="map-container"></div>

    <SearchBox @locate="handleLocate" @clear="handleClearCoord" />

    <ZoomControls @zoom-in="zoomIn" @zoom-out="zoomOut" />

    <CoordPanel :coord="clickedCoord" @copied="handleCopied" />

    <RoutePanel 
      :has-route="hasRoute" 
      @plan="handlePlanRoute" 
      @clear="handleClearRoute" 
    />

    <MarkerPanel 
      @locate="handleMarkerLocate" 
      @edit="handleMarkerEdit" 
      @delete="handleMarkerDelete"
      @toggle-mode="toggleMarkerMode"
    />

    <Toast :visible="toast.visible.value" :message="toast.message.value" :type="toast.type.value" />

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

    <MarkerDialog 
      ref="markerDialogRef"
      :visible="markerDialogVisible"
      :marker="editingMarker"
      @confirm="handleMarkerConfirm"
      @close="markerDialogVisible = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { toLonLat } from 'ol/proj'
import { useMap } from '../composables/useMap'
import { useRoute } from '../composables/useRoute'
import { useToast } from '../composables/useToast'
import { useDialog } from '../composables/useDialog'
import { useMarker } from '../composables/useMarker'
import logger from '../utils/logger'

import SearchBox from './SearchBox.vue'
import ZoomControls from './ZoomControls.vue'
import CoordPanel from './CoordPanel.vue'
import RoutePanel from './RoutePanel.vue'
import Toast from './Toast.vue'
import Dialog from './Dialog.vue'
import MarkerPanel from './MarkerPanel.vue'
import MarkerDialog from './MarkerDialog.vue'

const mapContainer = ref(null)
const clickedCoord = ref(null)
const markerDialogVisible = ref(false)
const editingMarker = ref(null)
const markerDialogRef = ref(null)
const pendingCoord = ref(null)

const { map, routeLayer, markerLayer, initMap, zoomIn, zoomOut, flyTo, destroy, addAnnotation, removeAnnotation, updateAnnotation, renderAllAnnotations } = useMap()
const { hasRoute, drawRoute, clearRoute } = useRoute()
const toast = useToast()
const dialog = useDialog()
const markerComposable = useMarker()
const { markers, markerMode, addMarker, updateMarker, deleteMarker, toggleMarkerMode } = markerComposable

watch(() => markers.value, (newMarkers) => {
  renderAllAnnotations(newMarkers)
}, { deep: true, immediate: true })

watch(() => markerMode.value, (isActive) => {
  logger.info('MapView', '标注模式状态变化', { isActive })
  if (isActive) {
    toast.info('标注模式已开启，点击地图添加标注')
  } else {
    toast.info('标注模式已关闭')
  }
})

const handleCopied = () => {
  toast.show('已复制', 'copied')
}

const handleClearCoord = () => {
  clickedCoord.value = null
}

const handleLocate = ({ lat, lng }) => {
  flyTo([lng, lat], 16)
  clickedCoord.value = {
    lat: lat.toFixed(9),
    lng: lng.toFixed(9)
  }
  logger.info('MapView', '定位到坐标', { lat, lng })
}

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

const handleClearRoute = () => {
  clearRoute(routeLayer.value, markerLayer.value)
  toast.info('路线已清除')
}

const handleMarkerLocate = (marker) => {
  flyTo([marker.lng, marker.lat], 17)
  clickedCoord.value = {
    lat: marker.lat.toFixed(9),
    lng: marker.lng.toFixed(9)
  }
  logger.info('MapView', '跳转到标注点', marker)
}

const handleMarkerEdit = (marker) => {
  editingMarker.value = marker
  markerDialogVisible.value = true
  logger.info('MapView', '编辑标注点', marker)
}

const handleMarkerDelete = (marker) => {
  dialog.confirm(
    '删除标注',
    `确定要删除标注 "${marker.name}" 吗？`,
    () => {
      deleteMarker(marker.id)
      toast.success('标注已删除')
      logger.info('MapView', '删除标注点', marker)
    }
  )
}

const handleMarkerConfirm = (data) => {
  if (data.id) {
    updateMarker(data.id, { name: data.name, remark: data.remark })
    updateAnnotation({
      id: data.id,
      name: data.name,
      remark: data.remark,
      lng: data.lng,
      lat: data.lat
    })
    toast.success('标注已更新')
  } else {
    const newMarker = addMarker({
      name: data.name,
      remark: data.remark,
      lng: data.lng,
      lat: data.lat
    })
    addAnnotation(newMarker)
    toast.success('标注已添加')
  }
  markerDialogVisible.value = false
  editingMarker.value = null
  pendingCoord.value = null
}

const handleMapClick = (evt, mapInstance) => {
  const coord = mapInstance.getCoordinateAtPixel(evt.pixel)
  const [lng, lat] = toLonLat(coord)
  clickedCoord.value = {
    lat: lat.toFixed(9),
    lng: lng.toFixed(9)
  }
  
  const currentMarkerMode = markerMode.value
  logger.info('MapView', '地图点击事件触发', { 
    clickedCoord: clickedCoord.value, 
    markerMode: currentMarkerMode,
    pixel: evt.pixel,
    evtType: evt.type
  })
  
  toast.info(`点击地图: ${lat.toFixed(4)}, ${lng.toFixed(4)}，标注模式: ${currentMarkerMode ? '开启' : '关闭'}`)
  
  if (currentMarkerMode) {
    logger.info('MapView', '标注模式已开启，准备弹出对话框')
    pendingCoord.value = { lng, lat }
    editingMarker.value = null
    markerDialogVisible.value = true
    
    nextTick(() => {
      if (markerDialogRef.value) {
        markerDialogRef.value.setCoord(lng, lat)
      }
    })
  } else {
    logger.info('MapView', '标注模式未开启，跳过')
  }
}

onMounted(() => {
  logger.info('MapView', '组件挂载，初始化地图')
  
  const mapInstance = initMap(mapContainer.value)
  
  mapContainer.value.addEventListener('click', (e) => {
    logger.info('MapView', '原生DOM点击事件触发', { x: e.clientX, y: e.clientY })
  })
  
  mapInstance.on('singleclick', (evt) => {
    logger.info('MapView', 'OpenLayers singleclick 事件触发', evt)
    handleMapClick(evt, mapInstance)
  })
  
  mapInstance.on('click', (evt) => {
    logger.info('MapView', 'OpenLayers click 事件触发', evt)
  })
})

onUnmounted(() => {
  destroy()
  logger.info('MapView', '组件卸载，地图已销毁')
})
</script>

<style scoped>
.map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #0F0F23;
}

.map-container {
  width: 100%;
  height: 100%;
  background-color: #e8e8e8;
}

:deep(.ol-attribution),
:deep(.ol-zoom) {
  display: none !important;
}

:deep(.base-map-layer) {
  filter: 
    saturate(0.4)
    contrast(1.1)
    brightness(1.02);
}

:deep(.base-map-layer canvas) {
  background: #f2f2f2;
}

:deep(.ol-tooltip) {
  position: relative;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
  color: white;
  padding: 4px 8px;
  font-size: 12px;
  white-space: nowrap;
}

:deep(.ol-tooltip-measure) {
  font-weight: bold;
}

:deep(.ol-tooltip-static) {
  background-color: #ffcc33;
  color: black;
  border: 1px solid white;
}

:deep(.ol-tooltip-measure:before),
:deep(.ol-tooltip-static:before) {
  border-top: 6px solid rgba(0, 0, 0, 0.7);
  border-right: 6px solid transparent;
  border-left: 6px solid transparent;
  content: "";
  position: absolute;
  bottom: -6px;
  margin-left: -6px;
  left: 50%;
}

:deep(.ol-tooltip-static:before) {
  border-top-color: #ffcc33;
}
</style>

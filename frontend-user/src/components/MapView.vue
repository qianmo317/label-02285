<template>
  <div class="map-wrapper">
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
  </div>
</template>

<script setup>
/**
 * 地图主视图组件
 * 整合所有子组件，协调地图交互
 */

import { ref, onMounted, onUnmounted } from 'vue'
import { toLonLat } from 'ol/proj'
import { useMap } from '../composables/useMap'
import { useRoute } from '../composables/useRoute'
import { useToast } from '../composables/useToast'
import { useDialog } from '../composables/useDialog'
import logger from '../utils/logger'

// 子组件
import SearchBox from './SearchBox.vue'
import ZoomControls from './ZoomControls.vue'
import CoordPanel from './CoordPanel.vue'
import RoutePanel from './RoutePanel.vue'
import Toast from './Toast.vue'
import Dialog from './Dialog.vue'

// 地图相关
const mapContainer = ref(null)
const clickedCoord = ref(null)

// Composables
const { map, routeLayer, markerLayer, initMap, zoomIn, zoomOut, flyTo, destroy } = useMap()
const { hasRoute, drawRoute, clearRoute } = useRoute()
const toast = useToast()
const dialog = useDialog()

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

onMounted(() => {
  logger.info('MapView', '组件挂载，初始化地图')
  
  const mapInstance = initMap(mapContainer.value)
  
  // 绑定点击事件
  mapInstance.on('click', (evt) => {
    const coord = mapInstance.getCoordinateAtPixel(evt.pixel)
    const [lng, lat] = toLonLat(coord)
    clickedCoord.value = {
      lat: lat.toFixed(9),
      lng: lng.toFixed(9)
    }
    logger.debug('MapView', '地图点击', clickedCoord.value)
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

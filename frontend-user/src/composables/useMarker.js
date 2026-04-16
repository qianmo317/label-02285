/**
 * 标注点管理 Composable
 * 处理标注点的增删改查、地图渲染等功能
 */
import { ref, shallowRef } from 'vue'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { fromLonLat, toLonLat } from 'ol/proj'
import { Style, Icon, Text, Fill, Stroke } from 'ol/style'
import logger from '../utils/logger'

// 标注点样式配置
const MARKER_ICON = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMzQiIHZpZXdCb3g9IjAgMCAyNCAzNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDBDNS4zNzI1OCAwIDAgNS4zNzI1OCAwIDEyQzAgMTguNjI3NCA1LjM3MjU4IDI0IDEyIDI0QzE4LjYyNzQgMjQgMjQgMTguNjI3NCAyNCAxMkMyNCA1LjM3MjU4IDE4LjYyNzQgMCAxMiAwWk0xMiAyMEM3LjU4MTcyIDIwIDQgMTYuNDE4MyA0IDEyQzQgNy41ODE3MiA3LjU4MTcyIDQgMTIgNEMxNi40MTgzIDQgMjAgNy41ODE3MiAyMCAxMkMyMCAxNi40MTgzIDE2LjQxODMgMjAgMTIgMjBaIiBmaWxsPSIjRkYzRTNFIi8+CjxwYXRoIGQ9Ik0xMiAyNEMxMS40NDc3IDI0IDEwLjk0NzcgMjQuMjIwNSAxMC41ODU5IDI0LjU4NjJMNC41ODYyMiAzMC41OTI0QzQuMjIwNDYgMzAuOTU0MiA0IDMxLjQ1NDIgNCAzMlYzM0gyMFYzMkMyMCAzMS40NTQyIDE5Ljc3OTUgMzAuOTU0MiAxOS40MTM4IDMwLjU5MjRMMTMuNDE0MSAyNC41ODYyQzEzLjA1MjMgMjQuMjIwNSAxMi41NTIzIDI0IDEyIDI0WiIgZmlsbD0iI0ZGM0UzRSIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI0IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K'

/**
 * 标注点 Composable
 */
export function useMarker() {
  // 标注点图层
  const markerLayer = shallowRef(null)
  const markerSource = shallowRef(null)
  
  // 标注点列表
  const markers = ref([])
  // 当前编辑的标注点
  const editingMarker = ref(null)
  // 标注模式开关
  const isMarkerMode = ref(false)

  /**
   * 初始化标注点图层
   */
  const initMarkerLayer = () => {
    markerSource.value = new VectorSource()
    markerLayer.value = new VectorLayer({
      source: markerSource.value,
      zIndex: 30, // 确保标注点显示在最上层
      style: (feature) => createMarkerStyle(feature.get('data'))
    })
    
    logger.info('useMarker', '标注点图层初始化完成')
    return markerLayer.value
  }

  /**
   * 创建标注点样式
   */
  const createMarkerStyle = (markerData) => {
    return new Style({
      image: new Icon({
        src: MARKER_ICON,
        anchor: [0.5, 1],
        scale: 1,
        offsetY: -4
      }),
      text: new Text({
        text: markerData.name,
        font: '12px sans-serif',
        fill: new Fill({ color: '#fff' }),
        stroke: new Stroke({ color: '#333', width: 2 }),
        offsetY: -40,
        padding: [4, 8, 4, 8],
        backgroundFill: new Fill({ color: 'rgba(255, 62, 62, 0.9)' }),
        backgroundStroke: new Stroke({ color: '#fff', width: 1 }),
      })
    })
  }

  /**
   * 添加标注点
   * @param {Object} markerData - 标注点数据 { id, name, remark, lng, lat }
   */
  const addMarker = (markerData) => {
    const { lng, lat } = markerData
    const coordinate = fromLonLat([lng, lat])
    
    const feature = new Feature({
      geometry: new Point(coordinate),
      data: markerData
    })
    
    feature.setId(markerData.id)
    markerSource.value.addFeature(feature)
    markers.value.push(markerData)
    
    logger.info('useMarker', '添加标注点', markerData)
    return markerData
  }

  /**
   * 更新标注点
   * @param {string} id - 标注点ID
   * @param {Object} updateData - 更新的数据
   */
  const updateMarker = (id, updateData) => {
    const index = markers.value.findIndex(m => m.id === id)
    if (index === -1) return null
    
    markers.value[index] = { ...markers.value[index], ...updateData }
    
    const feature = markerSource.value.getFeatureById(id)
    if (feature) {
      feature.set('data', markers.value[index])
      feature.setStyle(createMarkerStyle(markers.value[index]))
    }
    
    logger.info('useMarker', '更新标注点', { id, updateData })
    return markers.value[index]
  }

  /**
   * 删除标注点
   * @param {string} id - 标注点ID
   */
  const deleteMarker = (id) => {
    const index = markers.value.findIndex(m => m.id === id)
    if (index === -1) return false
    
    markers.value.splice(index, 1)
    
    const feature = markerSource.value.getFeatureById(id)
    if (feature) {
      markerSource.value.removeFeature(feature)
    }
    
    logger.info('useMarker', '删除标注点', { id })
    return true
  }

  /**
   * 清空所有标注点
   */
  const clearMarkers = () => {
    markers.value = []
    markerSource.value.clear()
    logger.info('useMarker', '清空所有标注点')
  }

  /**
   * 获取标注点数据
   * @param {string} id - 标注点ID
   */
  const getMarker = (id) => {
    return markers.value.find(m => m.id === id)
  }

  /**
   * 开始编辑标注点
   * @param {Object} markerData - 标注点数据，新建时为null
   */
  const startEditMarker = (markerData = null) => {
    editingMarker.value = markerData
  }

  /**
   * 结束编辑标注点
   */
  const endEditMarker = () => {
    editingMarker.value = null
  }

  /**
   * 切换标注模式
   */
  const toggleMarkerMode = (value) => {
    isMarkerMode.value = value !== undefined ? value : !isMarkerMode.value
    logger.info('useMarker', '标注模式切换', { enabled: isMarkerMode.value })
  }

  return {
    markerLayer,
    markers,
    editingMarker,
    isMarkerMode,
    initMarkerLayer,
    addMarker,
    updateMarker,
    deleteMarker,
    clearMarkers,
    getMarker,
    startEditMarker,
    endEditMarker,
    toggleMarkerMode
  }
}

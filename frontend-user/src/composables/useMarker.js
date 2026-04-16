/**
 * 标注点管理 Composable
 * 处理标注点的增删改查、本地存储等功能
 */

import { ref, watch } from 'vue'
import logger from '../utils/logger'

const STORAGE_KEY = 'map_markers'

let markersRef = null
let markerModeRef = null
let watchInitialized = false

export function useMarker() {
  if (!markersRef) {
    markersRef = ref([])
    markerModeRef = ref(false)
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        markersRef.value = JSON.parse(saved)
      }
    } catch (e) {
      logger.error('useMarker', '加载标注点失败', e)
    }
  }

  const markers = markersRef
  const markerMode = markerModeRef

  if (!watchInitialized) {
    watchInitialized = true
    watch(markers, (newVal) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal))
      } catch (e) {
        logger.error('useMarker', '保存标注点失败', e)
      }
    }, { deep: true })
  }

  const addMarker = (marker) => {
    const newMarker = {
      id: Date.now().toString(),
      name: marker.name || '',
      remark: marker.remark || '',
      lng: marker.lng,
      lat: marker.lat,
      createdAt: new Date().toISOString()
    }
    markers.value.push(newMarker)
    logger.info('useMarker', '添加标注点', newMarker)
    return newMarker
  }

  const updateMarker = (id, data) => {
    const index = markers.value.findIndex(m => m.id === id)
    if (index !== -1) {
      markers.value[index] = {
        ...markers.value[index],
        ...data
      }
      logger.info('useMarker', '更新标注点', { id, data })
      return markers.value[index]
    }
    return null
  }

  const deleteMarker = (id) => {
    const index = markers.value.findIndex(m => m.id === id)
    if (index !== -1) {
      const deleted = markers.value.splice(index, 1)[0]
      logger.info('useMarker', '删除标注点', deleted)
      return deleted
    }
    return null
  }

  const toggleMarkerMode = () => {
    markerMode.value = !markerMode.value
    logger.info('useMarker', '切换标注模式', markerMode.value)
  }

  const getMarkerById = (id) => {
    return markers.value.find(m => m.id === id)
  }

  return {
    markers,
    markerMode,
    addMarker,
    updateMarker,
    deleteMarker,
    toggleMarkerMode,
    getMarkerById
  }
}

import { ref } from 'vue'
import logger from '../utils/logger'

let markerIdCounter = 0

const markers = ref([])
const isMarkerMode = ref(false)

export function useMarker() {
  const toggleMarkerMode = () => {
    isMarkerMode.value = !isMarkerMode.value
    logger.info('useMarker', '标注模式切换', { isMarkerMode: isMarkerMode.value, timestamp: Date.now() })
  }

  const addMarker = (lng, lat, name, remark = '') => {
    const newMarker = {
      id: ++markerIdCounter,
      lng,
      lat,
      name,
      remark,
      createdAt: new Date().toISOString()
    }
    markers.value.push(newMarker)
    logger.info('useMarker', '添加标注点', newMarker)
    return newMarker
  }

  const updateMarker = (id, name, remark) => {
    const index = markers.value.findIndex(m => m.id === id)
    if (index !== -1) {
      markers.value[index] = {
        ...markers.value[index],
        name,
        remark,
        updatedAt: new Date().toISOString()
      }
      logger.info('useMarker', '更新标注点', markers.value[index])
      return markers.value[index]
    }
    return null
  }

  const deleteMarker = (id) => {
    console.log('=== useMarker deleteMarker 被调用 ===', id)
    console.log('=== 当前标注点列表 ===', markers.value)
    const index = markers.value.findIndex(m => m.id === id)
    console.log('=== 找到的索引 ===', index)
    if (index !== -1) {
      const deleted = markers.value.splice(index, 1)[0]
      console.log('=== 已删除的标注点 ===', deleted)
      logger.info('useMarker', '删除标注点', deleted)
      return deleted
    }
    console.log('=== 未找到标注点 ===', id)
    return null
  }

  const getMarker = (id) => {
    return markers.value.find(m => m.id === id)
  }

  return {
    markers,
    isMarkerMode,
    toggleMarkerMode,
    addMarker,
    updateMarker,
    deleteMarker,
    getMarker
  }
}

/**
 * 路线规划 Composable
 * 封装路线绑制和管理逻辑
 */

import { ref } from 'vue'
import Feature from 'ol/Feature'
import LineString from 'ol/geom/LineString'
import Point from 'ol/geom/Point'
import { Style, Stroke, Circle as CircleStyle, Fill } from 'ol/style'
import { fromLonLat } from 'ol/proj'
import logger from '../utils/logger'

export function useRoute() {
  const hasRoute = ref(false)

  /**
   * 创建带发光效果的路线样式
   */
  const createRouteStyle = () => {
    return [
      // 外层发光效果 - 模糊光晕
      new Style({
        stroke: new Stroke({
          color: 'rgba(255, 80, 80, 0.2)',
          width: 20,
          lineCap: 'round',
          lineJoin: 'round'
        })
      }),
      // 中层发光
      new Style({
        stroke: new Stroke({
          color: 'rgba(255, 60, 60, 0.4)',
          width: 12,
          lineCap: 'round',
          lineJoin: 'round'
        })
      }),
      // 核心路线
      new Style({
        stroke: new Stroke({
          color: '#FF4444',
          width: 5,
          lineCap: 'round',
          lineJoin: 'round'
        })
      })
    ]
  }

  /**
   * 创建标记点样式
   */
  const createMarkerStyle = (type) => {
    return new Style({
      image: new CircleStyle({
        radius: 10,
        fill: new Fill({
          color: type === 'start' ? '#00D4AA' : '#FF6B6B'
        }),
        stroke: new Stroke({
          color: '#fff',
          width: 3
        })
      })
    })
  }

  /**
   * 绑制路线
   */
  const drawRoute = (routeLayer, markerLayer, startCoord, endCoord) => {
    if (!routeLayer || !markerLayer) {
      logger.error('useRoute', '图层未初始化')
      return null
    }

    // 清除之前的路线
    clearRoute(routeLayer, markerLayer)

    logger.info('useRoute', '开始绘制路线', { start: startCoord, end: endCoord })

    // 创建路线
    const routeFeature = new Feature({
      geometry: new LineString([
        fromLonLat(startCoord),
        fromLonLat(endCoord)
      ])
    })
    routeFeature.setStyle(createRouteStyle())
    routeLayer.getSource().addFeature(routeFeature)

    // 创建起点标记
    const startMarker = new Feature({
      geometry: new Point(fromLonLat(startCoord))
    })
    startMarker.setStyle(createMarkerStyle('start'))
    markerLayer.getSource().addFeature(startMarker)

    // 创建终点标记
    const endMarker = new Feature({
      geometry: new Point(fromLonLat(endCoord))
    })
    endMarker.setStyle(createMarkerStyle('end'))
    markerLayer.getSource().addFeature(endMarker)

    hasRoute.value = true
    logger.info('useRoute', '路线绑制完成')

    return routeLayer.getSource().getExtent()
  }

  /**
   * 清除路线
   */
  const clearRoute = (routeLayer, markerLayer) => {
    if (routeLayer) routeLayer.getSource().clear()
    if (markerLayer) markerLayer.getSource().clear()
    hasRoute.value = false
    logger.debug('useRoute', '路线已清除')
  }

  return {
    hasRoute,
    drawRoute,
    clearRoute
  }
}

/**
 * 地图核心逻辑 Composable
 * 
 * ========== OpenLayers 库引入说明 ==========
 * OpenLayers 是一个开源的 JavaScript 地图库，通过 npm 安装：
 *   npm install ol
 * 
 * 核心模块说明：
 * - ol/Map: 地图主类，用于创建和管理地图实例
 * - ol/View: 视图类，控制地图中心点、缩放级别、旋转等
 * - ol/layer/Tile: 瓦片图层，用于加载栅格瓦片地图（如OSM）
 * - ol/layer/Vector: 矢量图层，用于绑制自定义图形（路线、标记等）
 * - ol/source/Vector: 矢量数据源，存储矢量要素
 * - ol/source/OSM: OpenStreetMap 瓦片源，免费无需API密钥
 * - ol/proj: 坐标投影转换工具
 * 
 * ========== OSM 图层对接步骤 ==========
 * 1. 导入 OSM 源: import OSM from 'ol/source/OSM'
 * 2. 创建瓦片图层: new TileLayer({ source: new OSM() })
 * 3. OSM 默认使用 EPSG:3857 投影（Web墨卡托）
 * 4. 经纬度坐标需用 fromLonLat() 转换为地图坐标
 * 5. 地图坐标需用 toLonLat() 转换回经纬度
 */

import { shallowRef } from 'vue'
// OpenLayers 核心模块
import Map from 'ol/Map'                    // 地图主类
import View from 'ol/View'                  // 视图控制
import TileLayer from 'ol/layer/Tile'       // 瓦片图层
import VectorLayer from 'ol/layer/Vector'   // 矢量图层（用于路线）
import VectorSource from 'ol/source/Vector' // 矢量数据源
import OSM from 'ol/source/OSM'             // OpenStreetMap 瓦片源
import { fromLonLat } from 'ol/proj'        // 坐标转换：经纬度 -> 地图坐标
import Feature from 'ol/Feature'            // 要素类
import Point from 'ol/geom/Point'           // 点几何
import { Style, Icon, Text as TextStyle, Fill, Stroke } from 'ol/style' // 样式
import logger from '../utils/logger'

// ========== 地图配置常量 ==========
// 北京天安门经纬度坐标（WGS84）
const DEFAULT_CENTER = [116.4074, 39.9042]
const DEFAULT_ZOOM = 16    // 初始缩放级别
const MIN_ZOOM = 8         // 最小缩放级别
const MAX_ZOOM = 19        // 最大缩放级别

/**
 * 地图 Composable
 * 提供地图初始化、缩放、定位等功能
 */
export function useMap() {
  // 使用 shallowRef 避免深度响应式，提升性能
  const map = shallowRef(null)
  const routeLayer = shallowRef(null)
  const markerLayer = shallowRef(null)
  const annotationLayer = shallowRef(null)
  const annotationSource = shallowRef(null)

  /**
   * 初始化地图
   * @param {HTMLElement} container - 地图容器DOM元素
   * @returns {Map} OpenLayers 地图实例
   * 
   * OSM 图层对接流程：
   * 1. 创建 OSM 源 - 自动加载 OpenStreetMap 免费瓦片
   * 2. 创建瓦片图层 - 将 OSM 源包装为图层
   * 3. 创建地图实例 - 绑定容器、图层、视图
   */
  const initMap = (container) => {
    logger.info('useMap', '开始初始化地图')

    // ========== 创建 OSM 底图图层 ==========
    // OSM (OpenStreetMap) 是免费的开源地图数据
    // 瓦片URL格式: https://tile.openstreetmap.org/{z}/{x}/{y}.png
    // 无需API密钥，直接调用即可
    const baseLayer = new TileLayer({
      source: new OSM({
        // OSM 默认配置，自动加载全球街道、路网、绿地等
        attributions: ''  // 隐藏默认版权信息
      }),
      className: 'base-map-layer'
    })

    // ========== 创建路线矢量图层 ==========
    // 用于绑制路线规划的红色粗线
    const routeSource = new VectorSource()
    routeLayer.value = new VectorLayer({
      source: routeSource,
      zIndex: 10  // 确保路线显示在底图上方
    })

    // ========== 创建标记点图层 ==========
    // 用于显示起点、终点标记
    const markerSource = new VectorSource()
    markerLayer.value = new VectorLayer({
      source: markerSource,
      zIndex: 20  // 确保标记显示在路线上方
    })

    // ========== 创建标注点图层 ==========
    // 用于显示用户添加的标注点
    annotationSource.value = new VectorSource()
    annotationLayer.value = new VectorLayer({
      source: annotationSource.value,
      zIndex: 30  // 确保标注点显示在最上方
    })

    // ========== 创建地图实例 ==========
    map.value = new Map({
      target: container,  // 绑定DOM容器
      layers: [
        baseLayer,              // OSM底图
        routeLayer.value,       // 路线图层
        markerLayer.value,      // 标记图层
        annotationLayer.value   // 标注点图层
      ],
      view: new View({
        // fromLonLat: 将经纬度(WGS84)转换为地图投影坐标(EPSG:3857)
        // 注意：OpenLayers 使用 [经度, 纬度] 顺序
        center: fromLonLat(DEFAULT_CENTER),
        zoom: DEFAULT_ZOOM,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM
      }),
      controls: []  // 禁用默认控件，使用自定义UI
    })

    logger.info('useMap', '地图初始化完成', {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM
    })
    return map.value
  }

  /**
   * 放大地图
   * 缩放级别 +1，带动画效果
   */
  const zoomIn = () => {
    if (!map.value) return
    const view = map.value.getView()
    const zoom = view.getZoom()
    if (zoom < MAX_ZOOM) {
      view.animate({ zoom: zoom + 1, duration: 250 })
      logger.debug('useMap', '放大地图', { newZoom: zoom + 1 })
    }
  }

  /**
   * 缩小地图
   * 缩放级别 -1，带动画效果
   */
  const zoomOut = () => {
    if (!map.value) return
    const view = map.value.getView()
    const zoom = view.getZoom()
    if (zoom > MIN_ZOOM) {
      view.animate({ zoom: zoom - 1, duration: 250 })
      logger.debug('useMap', '缩小地图', { newZoom: zoom - 1 })
    }
  }

  /**
   * 飞行定位到指定坐标
   * @param {Array} coord - [经度, 纬度]
   * @param {number} zoom - 目标缩放级别
   */
  const flyTo = (coord, zoom = 16) => {
    if (!map.value) return
    // 验证坐标有效性
    if (!Array.isArray(coord) || coord.length !== 2) {
      logger.error('useMap', '无效的坐标格式', { coord })
      return
    }
    map.value.getView().animate({
      center: fromLonLat(coord),
      zoom,
      duration: 500
    })
    logger.info('useMap', '飞行定位', { coord, zoom })
  }

  /**
   * 销毁地图实例
   * 释放资源，防止内存泄漏
   */
  const destroy = () => {
    if (map.value) {
      map.value.setTarget(null)
      map.value = null
      logger.info('useMap', '地图已销毁')
    }
  }

  const createMarkerStyle = (name) => {
    return new Style({
      image: new Icon({
        src: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="24" height="32">
            <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20c0-6.6-5.4-12-12-12z" fill="#4a9eff" stroke="#fff" stroke-width="1"/>
            <circle cx="12" cy="12" r="5" fill="#fff"/>
          </svg>
        `),
        anchor: [0.5, 1],
        scale: 1.2
      }),
      text: new TextStyle({
        text: name || '',
        offsetY: -40,
        fill: new Fill({ color: '#fff' }),
        stroke: new Stroke({ color: '#1a1a2e', width: 3 }),
        font: '12px sans-serif',
        padding: [4, 8, 4, 8],
        backgroundFill: new Fill({ color: 'rgba(26, 26, 46, 0.9)' }),
        borderRadius: 4
      })
    })
  }

  const addAnnotation = (marker) => {
    if (!annotationSource.value) return
    
    const feature = new Feature({
      geometry: new Point(fromLonLat([marker.lng, marker.lat])),
      id: marker.id
    })
    feature.setStyle(createMarkerStyle(marker.name))
    feature.set('markerData', marker)
    annotationSource.value.addFeature(feature)
    logger.debug('useMap', '添加标注点到地图', marker)
  }

  const removeAnnotation = (markerId) => {
    if (!annotationSource.value) return
    
    const features = annotationSource.value.getFeatures()
    for (const feature of features) {
      if (feature.get('id') === markerId) {
        annotationSource.value.removeFeature(feature)
        logger.debug('useMap', '从地图移除标注点', markerId)
        break
      }
    }
  }

  const updateAnnotation = (marker) => {
    if (!annotationSource.value) return
    
    const features = annotationSource.value.getFeatures()
    for (const feature of features) {
      if (feature.get('id') === marker.id) {
        feature.setGeometry(new Point(fromLonLat([marker.lng, marker.lat])))
        feature.setStyle(createMarkerStyle(marker.name))
        feature.set('markerData', marker)
        logger.debug('useMap', '更新地图标注点', marker)
        break
      }
    }
  }

  const renderAllAnnotations = (markers) => {
    if (!annotationSource.value) return
    
    annotationSource.value.clear()
    markers.forEach(marker => {
      addAnnotation(marker)
    })
    logger.info('useMap', '渲染所有标注点', { count: markers.length })
  }

  const clearAllAnnotations = () => {
    if (annotationSource.value) {
      annotationSource.value.clear()
      logger.info('useMap', '清除所有标注点')
    }
  }

  return {
    map,
    routeLayer,
    markerLayer,
    annotationLayer,
    initMap,
    zoomIn,
    zoomOut,
    flyTo,
    destroy,
    addAnnotation,
    removeAnnotation,
    updateAnnotation,
    renderAllAnnotations,
    clearAllAnnotations
  }
}

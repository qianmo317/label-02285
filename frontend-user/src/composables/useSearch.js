/**
 * 搜索功能 Composable
 * 
 * 功能说明：
 * 1. 支持经纬度输入定位（格式：纬度, 经度）
 * 2. 支持地点名称搜索（使用 Nominatim 免费 API）
 * 
 * Nominatim API 说明：
 * - 由 OpenStreetMap 提供的免费地理编码服务
 * - 无需API密钥，但有使用频率限制
 * - 支持中文搜索
 */

import { ref } from 'vue'
import logger from '../utils/logger'

// ========== 输入验证常量 ==========
const MAX_SEARCH_LENGTH = 200  // 搜索文本最大长度
const MIN_SEARCH_LENGTH = 2    // 搜索文本最小长度

export function useSearch() {
  const isSearching = ref(false)
  const searchError = ref('')

  /**
   * 验证搜索输入
   * @param {string} text - 搜索文本
   * @returns {string|null} 错误信息，null表示验证通过
   */
  const validateInput = (text) => {
    if (!text || typeof text !== 'string') {
      return '请输入搜索内容'
    }
    const trimmed = text.trim()
    if (trimmed.length < MIN_SEARCH_LENGTH) {
      return `搜索内容至少${MIN_SEARCH_LENGTH}个字符`
    }
    if (trimmed.length > MAX_SEARCH_LENGTH) {
      return `搜索内容不能超过${MAX_SEARCH_LENGTH}个字符`
    }
    return null
  }

  /**
   * 解析经纬度字符串
   * 支持格式: 
   *   - "39.9042, 116.4074"（纬度, 经度）
   *   - "39.9042,116.4074"（无空格）
   *   - "39.9042，116.4074"（中文逗号）
   * 
   * @param {string} str - 输入字符串
   * @returns {Object|null} { lat, lng, isCoord: true } 或 null
   */
  const parseCoord = (str) => {
    if (!str || typeof str !== 'string') return null
    
    // 匹配经纬度格式：支持正负数、小数
    const match = str.trim().match(/^(-?\d+\.?\d*)\s*[,，]\s*(-?\d+\.?\d*)$/)
    if (!match) return null

    const lat = parseFloat(match[1])
    const lng = parseFloat(match[2])

    // 验证经纬度范围
    // 纬度: -90 ~ 90
    // 经度: -180 ~ 180
    if (isNaN(lat) || isNaN(lng)) {
      logger.warn('useSearch', '经纬度解析失败：非数字', { lat, lng })
      return null
    }
    if (lat < -90 || lat > 90) {
      logger.warn('useSearch', '纬度超出范围', { lat })
      return null
    }
    if (lng < -180 || lng > 180) {
      logger.warn('useSearch', '经度超出范围', { lng })
      return null
    }

    return { lat, lng, isCoord: true }
  }

  /**
   * 使用 Nominatim API 搜索地点
   * Nominatim 是 OpenStreetMap 提供的免费地理编码服务
   * 
   * @param {string} query - 搜索关键词
   * @returns {Object|null} { lat, lng, name, isCoord: false } 或 null
   */
  const searchPlace = async (query) => {
    logger.info('useSearch', '开始搜索地点', { query })
    isSearching.value = true
    searchError.value = ''

    try {
      // Nominatim API 端点
      // format=json: 返回JSON格式
      // limit=1: 只返回最相关的一个结果
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      
      const response = await fetch(url, {
        headers: {
          // 优先返回中文结果
          'Accept-Language': 'zh-CN,zh,en'
        }
      })

      if (!response.ok) {
        throw new Error('搜索服务暂时不可用')
      }

      const results = await response.json()

      if (!results || results.length === 0) {
        searchError.value = '未找到该地点，请尝试其他关键词'
        logger.warn('useSearch', '未找到搜索结果', { query })
        return null
      }

      const place = results[0]
      logger.info('useSearch', '搜索成功', { 
        query, 
        result: place.display_name,
        lat: place.lat,
        lon: place.lon
      })

      return {
        lat: parseFloat(place.lat),
        lng: parseFloat(place.lon),
        name: place.display_name,
        isCoord: false
      }
    } catch (err) {
      searchError.value = err.message || '搜索失败，请稍后重试'
      logger.error('useSearch', '搜索出错', { error: err.message })
      return null
    } finally {
      isSearching.value = false
    }
  }

  /**
   * 统一搜索入口
   * 自动判断是经纬度还是地点名称
   * 
   * @param {string} text - 搜索文本
   * @returns {Object|null} 搜索结果
   */
  const search = async (text) => {
    // 输入验证
    const validationError = validateInput(text)
    if (validationError) {
      searchError.value = validationError
      return null
    }

    const trimmed = text.trim()

    // 先尝试解析为经纬度
    const coordResult = parseCoord(trimmed)
    if (coordResult) {
      logger.info('useSearch', '识别为经纬度输入', coordResult)
      searchError.value = ''
      return coordResult
    }

    // 否则作为地点名称搜索
    return await searchPlace(trimmed)
  }

  return {
    isSearching,
    searchError,
    parseCoord,
    search
  }
}

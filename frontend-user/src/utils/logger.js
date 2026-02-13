/**
 * 日志工具模块
 * 提供统一的日志输出接口，便于问题定位和调试
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
}

// 当前日志级别，生产环境可设为 WARN
const currentLevel = import.meta.env.DEV ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO

const formatTime = () => {
  return new Date().toISOString()
}

const logger = {
  debug(module, message, data = null) {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      console.log(`[${formatTime()}] [DEBUG] [${module}]`, message, data || '')
    }
  },

  info(module, message, data = null) {
    if (currentLevel <= LOG_LEVELS.INFO) {
      console.info(`[${formatTime()}] [INFO] [${module}]`, message, data || '')
    }
  },

  warn(module, message, data = null) {
    if (currentLevel <= LOG_LEVELS.WARN) {
      console.warn(`[${formatTime()}] [WARN] [${module}]`, message, data || '')
    }
  },

  error(module, message, data = null) {
    if (currentLevel <= LOG_LEVELS.ERROR) {
      console.error(`[${formatTime()}] [ERROR] [${module}]`, message, data || '')
    }
  }
}

export default logger

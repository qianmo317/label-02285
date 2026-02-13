/**
 * Toast 提示 Composable
 * 提供统一的轻量级提示功能
 */

import { ref } from 'vue'

const visible = ref(false)
const message = ref('')
const type = ref('info')
let timer = null

export function useToast() {
  const show = (msg, toastType = 'info', duration = 2000) => {
    clearTimeout(timer)
    message.value = msg
    type.value = toastType
    visible.value = true

    if (duration > 0) {
      timer = setTimeout(() => {
        visible.value = false
      }, duration)
    }
  }

  const success = (msg, duration) => show(msg, 'success', duration)
  const error = (msg, duration) => show(msg, 'error', duration)
  const warning = (msg, duration) => show(msg, 'warning', duration)
  const info = (msg, duration) => show(msg, 'info', duration)

  const hide = () => {
    clearTimeout(timer)
    visible.value = false
  }

  return {
    visible,
    message,
    type,
    show,
    success,
    error,
    warning,
    info,
    hide
  }
}

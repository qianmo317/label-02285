/**
 * Dialog 对话框 Composable
 * 提供统一的对话框功能
 */

import { ref } from 'vue'

const visible = ref(false)
const title = ref('提示')
const message = ref('')
const type = ref('info')
const showCancel = ref(false)
const confirmText = ref('确定')
const cancelText = ref('取消')

let resolvePromise = null

export function useDialog() {
  const show = (options) => {
    return new Promise((resolve) => {
      resolvePromise = resolve
      title.value = options.title || '提示'
      message.value = options.message || ''
      type.value = options.type || 'info'
      showCancel.value = options.showCancel || false
      confirmText.value = options.confirmText || '确定'
      cancelText.value = options.cancelText || '取消'
      visible.value = true
    })
  }

  const alert = (msg, alertTitle = '提示', alertType = 'info') => {
    return show({
      title: alertTitle,
      message: msg,
      type: alertType,
      showCancel: false
    })
  }

  const confirm = (msg, confirmTitle = '确认') => {
    return show({
      title: confirmTitle,
      message: msg,
      type: 'confirm',
      showCancel: true
    })
  }

  const handleConfirm = () => {
    visible.value = false
    resolvePromise?.(true)
  }

  const handleCancel = () => {
    visible.value = false
    resolvePromise?.(false)
  }

  const handleClose = () => {
    visible.value = false
    resolvePromise?.(false)
  }

  return {
    visible,
    title,
    message,
    type,
    showCancel,
    confirmText,
    cancelText,
    show,
    alert,
    confirm,
    handleConfirm,
    handleCancel,
    handleClose
  }
}

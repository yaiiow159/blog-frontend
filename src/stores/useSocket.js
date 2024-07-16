import { ref, watchEffect, watch } from 'vue'
import useWebSocket, { SocketStatus } from '../utils/userWebsocket'
import { useUserStore } from './user'

export default function useSocket() {
  const { status, message, error, connect, disconnect } = useWebSocket({
    url: 'ws://localhost:9090/',
    heartBeatData: 'your heart data'
  })
  const userStore = useUserStore()

  const { isLogin } = storeToRefs(userStore)
  const chatMessage = ref(null)
  const socketStatusText = ref('')

  window.addEventListener('offline', function () {
    console.log('websocket斷開連接')
  })

  window.addEventListener('online', function () {
    console.log('websocket重新連接')
    retryConnect()
  })

  watch(
    () => status.value,
    newVal => {
      if (newVal != SocketStatus.Connected) {
        socketStatusText.value = newVal
      }
    }
  )

  watch(
    () => message.value,
    newVal => {
      if (newVal) {
        chatMessage.value = newVal
      }
    }
  )

  watchEffect(() => {
    // 檢查用戶是否已登錄，已登入則連接Websocket
    if (isLogin.value) {
      connect()
    } else {
      disconnect()
    }
  })

  const retryConnect = () => {
    if (status.value !== SocketStatus.Connected) {
      connect()
    }
  }

  return {
    socketStatusText,
    chatMessage,
    retryConnect
  }
}

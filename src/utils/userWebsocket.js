import { ref } from 'vue'

const DEFAULT_OPTIONS = {
  url: 'ws://localhost:9090/', // websocket url
  heartBeatData: 'test-heartbeat', // 心跳數據
  heartBeatInterval: 60 * 1000, // 心跳間隔，單位ms
  reconnectInterval: 5000, // 重連間隔，单位ms
  maxReconnectAttempts: 10 // 最大重連次數
}

export const SocketStatus = {
  Connecting: '正在連接...', //表示正在连接，这是初始状态。
  Connected: '連接已建立', //表示连接已经建立。
  Disconnecting: '連接正在關閉', //表示连接正在关闭。
  Disconnected: '連接已斷開' //表示连接已经关闭
}

const SocketCloseCode = 1000

export default function useWebSocket(options = {}) {
  const state = {
    options: { ...DEFAULT_OPTIONS, ...options },

    socket: null,
    reconnectAttempts: 0,
    reconnectTimeout: null,

    heartBetaSendTimer: null, // 心跳發送定時器
    heartBetaTimeoutTimer: null // 心跳超時定時器
  }

  // 狀態
  const status = ref(SocketStatus.Disconnected)
  const message = ref(null)
  const error = ref(null)

  // 連接
  const connect = () => {
    disconnect()

    status.value = SocketStatus.Connecting
    if (!window.navigator.onLine) {
      setTimeout(() => {
        status.value = SocketStatus.Disconnected
      }, 500)
      return
    }

    state.socket = new WebSocket(state.options.url)

    state.socket.onopen = openEvent => {
      console.log('socket连接:', openEvent)
      state.reconnectAttempts = 0
      status.value = SocketStatus.Connected
      error.value = null
      startHeartBeat()
    }

    state.socket.onmessage = msgEvent => {
      console.log('socket消息:', msgEvent)

      // 收到任何数据，重新开始心跳
      startHeartBeat()

      const { data } = msgEvent
      const msg = JSON.parse(data)

      //心跳数据, 可自行修改
      if (+msg.msg_id === 0) {
        return
      }
      message.value = msg
    }

    state.socket.onclose = closeEvent => {
      console.log('socket关闭:', closeEvent)
      status.value = SocketStatus.Disconnected
      // 非正常关闭,尝试重连
      if (closeEvent.code !== SocketCloseCode) {
        reconnect()
      }
    }

    state.socket.onerror = errEvent => {
      console.log('socket报错:', errEvent)
      status.value = SocketStatus.Disconnected
      error.value = errEvent
      // 连接失败，尝试重连
      reconnect()
    }
  }

  const disconnect = () => {
    if (state.socket && (state.socket.OPEN || state.socket.CONNECTING)) {
      console.log('socket正在關閉')
      status.value = SocketStatus.Disconnecting
      state.socket.onmessage = null
      state.socket.onerror = null
      state.socket.onclose = null
      // 關閉socket
      state.socket.close(SocketCloseCode, '斷開socket連接')
      status.value = SocketStatus.Disconnected
      state.socket = null
    }
    stopHeartBeat()
    stopReconnect()
  }

  const startHeartBeat = () => {
    stopHeartBeat()
    onHeartBeat(() => {
      if (status.value === SocketStatus.Connected) {
        state.socket.send(state.options.heartBeatData)
        console.log('socket心跳送:', state.options.heartBeatData)
      }
    })
  }

  const onHeartBeat = callback => {
    state.heartBetaSendTimer = setTimeout(() => {
      callback && callback()
      state.heartBetaTimeoutTimer = setTimeout(() => {
        // 心跳超时,直接關閉socket 不嘗試重新連接
        state.socket.close(4444, '心跳超時')
      }, state.options.heartBeatInterval)
    }, state.options.heartBeatInterval)
  }

  const stopHeartBeat = () => {
    state.heartBetaSendTimer && clearTimeout(state.heartBetaSendTimer)
    state.heartBetaTimeoutTimer && clearTimeout(state.heartBetaTimeoutTimer)
  }

  // 重连
  const reconnect = () => {
    if (status.value === SocketStatus.Connected || status.value === SocketStatus.Connecting) {
      return
    }
    stopHeartBeat()
    if (state.reconnectAttempts < state.options.maxReconnectAttempts) {
      console.log('重新連接次數:', state.reconnectAttempts)

      // 重連間隔次數 每次 + 1000
      const interval = Math.max(state.options.reconnectInterval, state.reconnectAttempts * 1000)
      console.log('間隔時間：', interval)
      state.reconnectTimeout = setTimeout(() => {
        if (status.value !== SocketStatus.Connected && status.value !== SocketStatus.Connecting) {
          connect()
        }
      }, interval)
      state.reconnectAttempts += 1
    } else {
      status.value = SocketStatus.Disconnected
      stopReconnect()
    }
  }

  // 停止重连
  const stopReconnect = () => {
    state.reconnectTimeout && clearTimeout(state.reconnectTimeout)
  }

  return {
    status,
    message,
    error,
    connect,
    disconnect
  }
}

import { useEffect, useRef, useState, useCallback } from 'react'
import useChatStore from '../store/chatStore'

const RECONNECT_DELAY = 3000
const MAX_RECONNECTS  = 5

export default function useChat(slug) {
  const wsRef          = useRef(null)
  const reconnectCount = useRef(0)
  const reconnectTimer = useRef(null)
  const activeToken    = useRef(null)   // unique token per connection lifecycle

  const [status, setStatus] = useState('disconnected')
  const { setHistory, addMessage } = useChatStore()

  const sendMessage = useCallback((content) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ content }))
    }
  }, [])

  useEffect(() => {
    if (!slug) return

    // Generate a unique token for this effect run
    const token = Symbol()
    activeToken.current = token

    // Close any existing connection first
    clearTimeout(reconnectTimer.current)
    if (wsRef.current) {
      wsRef.current.onclose = null  // prevent reconnect from old socket
      wsRef.current.close()
      wsRef.current = null
    }

    reconnectCount.current = 0

    function connect() {
      // If this effect was superseded, stop
      if (activeToken.current !== token) return

      const proto  = window.location.protocol === 'https:' ? 'wss' : 'ws'
      const socket = new WebSocket(`${proto}://${window.location.host}/ws/chat/${slug}/`)
      wsRef.current = socket
      setStatus('connecting')

      socket.onopen = () => {
        if (activeToken.current !== token) { socket.close(); return }
        setStatus('connected')
        reconnectCount.current = 0
      }

      socket.onmessage = (e) => {
        if (activeToken.current !== token) return
        let data
        try { data = JSON.parse(e.data) } catch { return }

        switch (data.type) {
          case 'history':
            setHistory(slug, data.messages)
            break
          case 'message':
            addMessage(slug, {
              id:         data.id,
              sender:     data.sender,
              sender_id:  data.sender_id,
              content:    data.content,
              created_at: data.created_at,
            })
            break
          case 'error':
            console.warn('[ws] error:', data.detail)
            break
          default:
            break
        }
      }

      socket.onclose = () => {
        if (activeToken.current !== token) return
        setStatus('disconnected')
        if (reconnectCount.current >= MAX_RECONNECTS) return
        reconnectCount.current += 1
        reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY)
      }

      socket.onerror = () => socket.close()
    }

    connect()

    return () => {
      // Invalidate this token — any in-flight messages will be ignored
      activeToken.current = null
      clearTimeout(reconnectTimer.current)
      if (wsRef.current) {
        wsRef.current.onclose = null
        wsRef.current.close()
        wsRef.current = null
      }
      setStatus('disconnected')
    }
  }, [slug])

  return { status, sendMessage }
}
import { useEffect, useState } from 'react'
import useChatStore from '../store/chatStore'
import useChat from '../hooks/useChat'
import Sidebar from '../components/layout/Sidebar'
import ChatWindow from '../components/layout/ChatWindow'

export default function ChatPage() {
  const { loadRooms, activeSlug } = useChatStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Single WebSocket instance at page level — not inside ChatWindow
  const { status, sendMessage } = useChat(activeSlug)

  useEffect(() => {
    loadRooms()
  }, [])

  return (
    <div className="layout">
      <div
        className={`sidebar-overlay${sidebarOpen ? ' sidebar-overlay--visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <ChatWindow
        onMenuClick={() => setSidebarOpen(o => !o)}
        status={status}
        sendMessage={sendMessage}
      />
    </div>
  )
}
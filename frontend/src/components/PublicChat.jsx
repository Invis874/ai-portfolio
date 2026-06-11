import React, { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'

function PublicChat({ user }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatIdentifier, setChatIdentifier] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { darkMode } = useTheme()
  
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)
  const inputRef = useRef(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const isAuth = !!token
    
    setIsAuthenticated(isAuth)
    
    if (isAuth && user?.id) {
      setChatIdentifier({ type: 'user', id: user.id })
    } else {
      let session = localStorage.getItem('chat_session')
      if (!session) {
        session = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('chat_session', session)
      }
      setChatIdentifier({ type: 'guest', id: session })
    }
  }, [user])

  useEffect(() => {
    if (chatIdentifier) {
      fetchMessages()
      const interval = setInterval(fetchMessages, 5000)
      return () => clearInterval(interval)
    }
  }, [chatIdentifier])

  const fetchMessages = async () => {
    try {
      let url
      const headers = {}
      
      if (chatIdentifier.type === 'user') {
        const token = localStorage.getItem('access_token')
        headers['Authorization'] = `Bearer ${token}`
        url = `${import.meta.env.VITE_API_URL}/chat/`
      } else {
        url = `${import.meta.env.VITE_API_URL}/chat/?session_key=${chatIdentifier.id}`
      }
      
      const response = await axios.get(url, { headers })
      const sorted = response.data.sort((a, b) => 
        new Date(a.created_at) - new Date(b.created_at)
      )
      setMessages(sorted)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || !chatIdentifier) return

    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      const headers = { 'Content-Type': 'application/json' }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      } else if (chatIdentifier.type === 'guest') {
        headers['X-Session-Key'] = chatIdentifier.id
      }
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/chat/send/`,
        { message: input },
        { headers }
      )
      
      setMessages(prev => [...prev, response.data])
      setInput('')
      setShouldAutoScroll(true)
      
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Ошибка отправки сообщения')
    } finally {
      setLoading(false)
    }
  }

  const handleScroll = useCallback(() => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50
      setShouldAutoScroll(isAtBottom)
    }
  }, [])

  const scrollToBottom = useCallback(() => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [shouldAutoScroll])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className={`fixed inset-0 top-16 flex flex-col items-center transition-all duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-100'
    }`}>
      {/* Заголовок */}
      <div className={`w-3/4 p-4 rounded-t-lg shadow-lg transition-all duration-300 ${
        darkMode ? 'bg-blue-900 text-white' : 'bg-blue-600 text-white'
      }`}>
        <h2 className="text-xl font-bold">💬 Чат поддержки</h2>
        <p className={`text-sm transition-all duration-300 ${darkMode ? 'text-blue-200' : 'text-blue-100'}`}>
          {isAuthenticated 
            ? `Вы: ${user?.username} (авторизован)` 
            : 'Режим: Гость'}
        </p>
      </div>
      
      {/* Область сообщений - плавный переход фона */}
      <div 
        ref={chatContainerRef}
        onScroll={handleScroll}
        className={`w-3/4 flex-1 shadow-lg overflow-y-auto p-4 space-y-3 transition-colors duration-150 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        {messages.length === 0 && (
          <div className={`text-center mt-32 transition-all duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <p className="text-2xl mb-2">🤖</p>
            <p>Напишите что-нибудь!</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className="space-y-2">
            {/* Сообщение пользователя */}
            {msg.user_message && (
              <div className="flex justify-end">
                <div className={`rounded-lg px-4 py-2 max-w-md transition-all duration-300 ${
                  darkMode ? 'bg-blue-700 text-white' : 'bg-blue-500 text-white'
                }`}>
                  <p className={`text-xs mb-1 transition-all duration-300 ${darkMode ? 'text-blue-200' : 'text-blue-100'}`}>
                    {msg.user?.username || 'Гость'}
                  </p>
                  <p>{msg.user_message}</p>
                  <p className={`text-xs mt-1 text-right transition-all duration-300 ${darkMode ? 'text-blue-200' : 'text-blue-100'}`}>
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            )}
            
            {/* Ответ бота */}
            {msg.bot_response && !msg.operator_response && (
              <div className="flex justify-start">
                <div className={`rounded-lg px-4 py-2 max-w-md transition-all duration-300 ${
                  darkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-200 text-gray-800'
                }`}>
                  <p className={`text-xs font-semibold mb-1 transition-all duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    🤖 Бот
                  </p>
                  <p className="whitespace-pre-wrap">{msg.bot_response}</p>
                  <p className={`text-xs mt-1 transition-all duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            )}
            
            {/* Ответ оператора */}
            {msg.operator_response && (
              <div className="flex justify-start">
                <div className={`rounded-lg px-4 py-2 max-w-md transition-all duration-300 ${
                  darkMode ? 'bg-green-800 text-white' : 'bg-green-600 text-white'
                }`}>
                  <p className={`text-xs mb-1 transition-all duration-300 ${darkMode ? 'text-green-200' : 'text-green-100'}`}>
                    👨‍💼 Оператор
                  </p>
                  <p>{msg.operator_response}</p>
                  <p className={`text-xs mt-1 transition-all duration-300 ${darkMode ? 'text-green-200' : 'text-green-100'}`}>
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Инпут */}
      <div className={`w-3/4 border-t p-4 rounded-b-lg shadow-lg transition-all duration-300 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Напишите сообщение..."
            className={`flex-1 px-4 py-2 border rounded-full focus:outline-none focus:border-blue-500 transition-all duration-300 ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className={`px-6 py-2 rounded-full transition-all duration-300 ${
              darkMode 
                ? 'bg-blue-700 hover:bg-blue-800 disabled:bg-blue-500' 
                : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
            } text-white`}
          >
            {loading ? '⏳' : '📤'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PublicChat
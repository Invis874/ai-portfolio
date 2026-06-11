import React, { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'

function OperatorChat({ token, user }) {
  const [sessions, setSessions] = useState([])
  const [selectedSession, setSelectedSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const { darkMode } = useTheme()
  
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)
  const inputRef = useRef(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)

  useEffect(() => {
    fetchAllSessions()
    const interval = setInterval(fetchAllSessions, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchAllSessions = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/chat/all_sessions/`)
      setSessions(response.data)
    } catch (error) {
      console.error('Error fetching sessions:', error)
    }
  }

  const loadSessionMessages = async (session) => {
    try {
      let url = `${import.meta.env.VITE_API_URL}/chat/session_messages/?`
      if (session.type === 'guest') {
        url += `session_key=${session.session_key}`
      } else {
        url += `user_id=${session.user_id}`
      }
      
      const response = await axios.get(url)
      setMessages(response.data)
      setSelectedSession(session)
      setShouldAutoScroll(true)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const sendReply = async () => {
    if (!input.trim() || !selectedSession) return

    setLoading(true)
    try {
      const payload = { reply: input }
      if (selectedSession.type === 'guest') {
        payload.session_key = selectedSession.session_key
      } else {
        payload.user_id = selectedSession.user_id
      }
      
      await axios.post(`${import.meta.env.VITE_API_URL}/chat/operator_reply/`, payload)
      
      setInput('')
      setShouldAutoScroll(true)
      fetchAllSessions()
      if (selectedSession) loadSessionMessages(selectedSession)
      
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } catch (error) {
      console.error('Error sending reply:', error)
      alert('Ошибка отправки ответа')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault()
      sendReply()
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
  }, [selectedSession])

  return (
    <div className={`fixed inset-0 top-16 flex transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-100'
    }`}>
      {/* Левая панель - список чатов */}
      <div className={`w-80 border-r flex flex-col transition-all duration-300 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className={`p-4 transition-all duration-300 ${
          darkMode ? 'bg-green-900 text-white' : 'bg-green-600 text-white'
        }`}>
          <h2 className="text-xl font-bold">🎧 Чат оператора</h2>
          <p className={`text-sm transition-all duration-300 ${darkMode ? 'text-green-200' : 'text-green-100'}`}>
            {user?.username}
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 && (
            <div className={`text-center mt-8 transition-all duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <p>Нет активных чатов</p>
            </div>
          )}
          
          {sessions.map((session, idx) => (
            <div
              key={idx}
              onClick={() => loadSessionMessages(session)}
              className={`p-4 border-b cursor-pointer transition-all duration-300 ${
                (selectedSession?.type === 'guest' && selectedSession?.session_key === session.session_key) ||
                (selectedSession?.type === 'user' && selectedSession?.user_id === session.user_id && session.type === 'user') ||
                (selectedSession?.type === 'operator' && selectedSession?.user_id === session.user_id && session.type === 'operator')
                  ? darkMode 
                    ? 'bg-green-900 border-l-4 border-l-green-600' 
                    : 'bg-green-50 border-l-4 border-l-green-500'
                  : darkMode 
                    ? 'hover:bg-gray-700 border-gray-700' 
                    : 'hover:bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <p className={`font-semibold text-sm truncate flex-1 transition-all duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {session.name}
                </p>
                {session.unread_count > 0 && (
                  <span className="bg-red-600 text-white text-xs rounded-full px-2 py-1 ml-2">
                    {session.unread_count}
                  </span>
                )}
              </div>
              <p className={`text-xs mt-1 transition-all duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {session.last_message ? new Date(session.last_message).toLocaleString() : 'Нет сообщений'}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Правая панель - чат */}
      <div className="flex-1 flex flex-col">
        {selectedSession ? (
          <>
            <div className={`border-b p-4 shadow-sm transition-all duration-300 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`font-semibold transition-all duration-300 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedSession.name}
              </h3>
              <p className={`text-xs transition-all duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {selectedSession.type === 'guest' ? 'Чат гостя' : 'Чат пользователя'}
              </p>
            </div>
            
            <div 
              ref={chatContainerRef}
              onScroll={handleScroll}
              className={`flex-1 overflow-y-auto p-4 space-y-3 transition-all duration-150 ${
                darkMode ? 'bg-gray-900' : 'bg-gray-50'
              }`}
            >
              {messages.map((msg, idx) => (
                <div key={idx} className="space-y-2">
                  {/* Сообщение от пользователя/гостя */}
                  {msg.user_message && (
                    <div className="flex justify-end">
                      <div className={`rounded-lg px-4 py-2 max-w-md transition-all duration-300 ${
                        darkMode ? 'bg-blue-800 text-white' : 'bg-blue-500 text-white'
                      }`}>
                        <p className={`text-xs mb-1 transition-all duration-300 ${darkMode ? 'text-blue-200' : 'text-blue-100'}`}>
                          {msg.user ? msg.user.username : 'Гость'}
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
                        darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
                      }`}>
                        <p className={`text-xs font-semibold mb-1 transition-all duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          🤖 Бот
                        </p>
                        <p>{msg.bot_response}</p>
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
                        <p className={`text-xs font-semibold mb-1 transition-all duration-300 ${darkMode ? 'text-green-200' : 'text-green-100'}`}>
                          👨‍💼 {msg.user?.username || 'Оператор'}
                        </p>
                        <p>{msg.operator_response}</p>
                        {/* Исправлено: время теперь белое/светлое в светлой теме */}
                        <p className={`text-xs mt-1 transition-all duration-300 ${
                          darkMode ? 'text-green-200' : 'text-green-100'
                        }`}>
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <div className={`border-t p-4 transition-all duration-300 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Напишите ответ..."
                  className={`flex-1 px-4 py-2 border rounded-full focus:outline-none focus:border-green-500 transition-all duration-300 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  disabled={loading}
                />
                <button
                  onClick={sendReply}
                  disabled={loading || !input.trim()}
                  className={`px-6 py-2 rounded-full transition-all duration-300 ${
                    darkMode 
                      ? 'bg-green-700 hover:bg-green-800 disabled:bg-green-600' 
                      : 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
                  } text-white`}
                >
                  {loading ? '⏳' : '📤'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className={`flex-1 flex items-center justify-center transition-all duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="text-center">
              <p className="text-4xl mb-2">💬</p>
              <p>Выберите чат для ответа</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OperatorChat
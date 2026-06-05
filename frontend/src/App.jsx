import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import axios from 'axios'
import { ThemeProvider, useTheme } from './context/ThemeContext'

// Компоненты
import ThemeToggle from './components/ThemeToggle'
import PublicChat from './components/PublicChat'
import OperatorChat from './components/OperatorChat'
import DataTable from './components/DataTable'
import Dashboard from './components/Dashboard'
import Login from './components/Login'
import Register from './components/Register'

function AppContent() {
  const [token, setToken] = useState(localStorage.getItem('access_token'))
  const [user, setUser] = useState(null)
  const [role, setRole] = useState('guest')
  const { darkMode } = useTheme()

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      delete axios.defaults.headers.common['Authorization']
      setUser(null)
      setRole('guest')
    }
  }, [token])

  const fetchUser = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/users/me/')
      setUser(response.data)
      const profileRes = await axios.get('http://localhost:8000/api/users/profile/')
      setRole(profileRes.data.role)
    } catch (error) {
      console.error('Auth error:', error)
      logout()
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setToken(null)
    setUser(null)
    setRole('guest')
  }

  return (
    <BrowserRouter>
      <div className={`min-h-screen transition-colors duration-300 ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
      }`}>
        {/* Навигация */}
        <nav className={`shadow-md p-4 transition-colors duration-300 ${
          darkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-white'
        }`}>
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className={`text-xl font-bold transition-colors ${
              darkMode ? 'text-blue-400' : 'text-blue-600'
            }`}>
              🚀 AI Automation Portfolio
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/" className={`hover:${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>🏠 Главная</Link>
              <Link to="/chat" className={`hover:${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>💬 Чат</Link>
              <Link to="/table" className={`hover:${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>📊 Таблица</Link>
              <Link to="/dashboard" className={`hover:${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>📈 Дашборд</Link>
              {role === 'operator' && (
                <Link to="/operator-chat" className={`hover:${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>🎧 Чат оператора</Link>
              )}
              <ThemeToggle />
              {user ? (
                <button onClick={logout} className={`${
                  darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'
                }`}>
                  Выйти ({user.username})
                </button>
              ) : (
                <>
                  <Link to="/login" className={`${
                    darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-800'
                  }`}>Вход</Link>
                  <Link to="/register" className={`${
                    darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                  }`}>Регистрация</Link>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Контент */}
        <main className="container mx-auto p-6">
          <Routes>
            <Route path="/" element={<Home role={role} darkMode={darkMode} />} />
            <Route path="/chat" element={<PublicChat user={user} />} />
            <Route path="/table" element={<DataTable userRole={role} token={token} />} />
            <Route path="/dashboard" element={<Dashboard token={token} />} />
            <Route path="/operator-chat" element={
              role === 'operator' ? <OperatorChat token={token} user={user} /> : <Navigate to="/" />
            } />
            <Route path="/login" element={<Login setToken={setToken} />} />
            <Route path="/register" element={<Register setToken={setToken} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

// Главная страница
function Home({ role, darkMode }) {
  return (
    <div className="text-center py-12">
      <h1 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        🤖 AI Automation Engineer
      </h1>
      <p className={`text-xl mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        Автоматизация бизнес-процессов с помощью ИИ
      </p>
      
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className={`p-6 rounded-lg shadow transition-colors ${
          darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }`}>
          <h3 className="text-2xl mb-3">💬 Умный чат-бот</h3>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>AI бот с распознаванием намерений</p>
        </div>
        <div className={`p-6 rounded-lg shadow transition-colors ${
          darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }`}>
          <h3 className="text-2xl mb-3">📊 Управление данными</h3>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>CRUD таблица с ролевой моделью</p>
        </div>
        <div className={`p-6 rounded-lg shadow transition-colors ${
          darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }`}>
          <h3 className="text-2xl mb-3">📈 Дашборд аналитики</h3>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Графики и статистика</p>
        </div>
      </div>

      <div className={`mt-8 p-4 rounded-lg ${
        darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
      }`}>
        <p className="font-semibold">
          {role === 'operator' 
            ? '✅ Вы вошли как ОПЕРАТОР — доступно редактирование таблицы и ответы в чате'
            : '👋 Вы в режиме ГОСТЯ — только просмотр. Войдите как оператор для полного доступа'}
        </p>
      </div>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App
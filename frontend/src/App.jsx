import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import ThemeToggle from './components/ThemeToggle'

// Компоненты
import StoryBook from './components/storybook/StoryBook'
import FloatingMenu from './components/storybook/FloatingMenu'
import PublicChat from './components/PublicChat'
import OperatorChat from './components/OperatorChat'
import DataTable from './components/DataTable'
import Dashboard from './components/Dashboard'
import Login from './components/Login'
import Register from './components/Register'
import SuppliersList from './components/suppliers/SuppliersList'
import SupplierDetail from './components/suppliers/SupplierDetail'
import SupplierForm from './components/suppliers/SupplierForm'

function AppContent() {
  const [token, setToken] = useState(localStorage.getItem('access_token'))
  const [user, setUser] = useState(null)
  const [role, setRole] = useState('guest')
  const { darkMode } = useTheme()
  const location = useLocation()
  const isHome = location.pathname === '/'

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
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/me/`)
      setUser(response.data)
      const profileRes = await axios.get(`${import.meta.env.VITE_API_URL}/users/profile/`)
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
    <div className={`min-h-screen theme-transition ${isHome ? 'table-bg' : ''} ${
      darkMode ? 'text-white' : 'text-gray-900'
    }`}>

      {/* Шапка только НЕ на главной */}
      {!isHome && (
        <nav className={`shadow-md p-4 theme-transition ${
          darkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-white'
        }`}>
          <div className="container mx-auto flex justify-between items-center flex-wrap gap-2">
            <Link to="/" className={`text-xl font-bold theme-transition ${
              darkMode ? 'text-blue-400' : 'text-blue-600'
            }`}>
              🚀 AI Automation Portfolio
            </Link>
            <div className="flex items-center space-x-4 flex-wrap gap-2">
              <Link to="/" className={`hover:${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>🏠 Главная</Link>
              <Link to="/chat" className={`hover:${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>💬 Чат</Link>
              <Link to="/table" className={`hover:${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>📊 Таблица</Link>
              <Link to="/dashboard" className={`hover:${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>📈 Дашборд</Link>
              <Link to="/suppliers" className={`hover:${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>📦 Поставщики</Link>
              {role === 'operator' && (
                <>
                  <Link to="/operator-chat" className={`hover:${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>🎧 Чат оператора</Link>
                  <Link to="/suppliers/add" className={`hover:${darkMode ? 'text-green-400' : 'text-green-600'}`}>➕ Добавить поставщика</Link>
                </>
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
      )}

      {/* Руна только на главной */}
      {isHome && <FloatingMenu user={user} role={role} onLogout={logout} />}

      {/* Контент */}
      <main className={isHome ? '' : 'container mx-auto'}>
        <Routes>
          <Route path="/" element={<StoryBook />} />
          <Route path="/chat" element={<PublicChat user={user} />} />
          <Route path="/table" element={<DataTable userRole={role} token={token} />} />
          <Route path="/dashboard" element={<Dashboard token={token} />} />
          <Route path="/suppliers" element={<SuppliersList />} />
          <Route path="/suppliers/:id" element={<SupplierDetail />} />
          <Route path="/suppliers/add" element={
            role === 'operator' ? <SupplierForm /> : <Navigate to="/suppliers" />
          } />
          <Route path="/suppliers/edit/:id" element={
            role === 'operator' ? <SupplierForm /> : <Navigate to="/suppliers" />
          } />
          <Route path="/operator-chat" element={
            role === 'operator' ? <OperatorChat token={token} user={user} /> : <Navigate to="/" />
          } />
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/register" element={<Register setToken={setToken} />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
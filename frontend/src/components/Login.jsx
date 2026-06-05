import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Login({ setToken }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await axios.post('http://localhost:8000/api/users/login/', {
        username,
        password
      })
      
      const { access, refresh, user } = response.data
      
      // Сохраняем токены
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
      
      // Устанавливаем токен в axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`
      
      setToken(access)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">🔐 Вход в систему</h2>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Имя пользователя</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>
      
      <div className="mt-4 text-center text-sm text-gray-600">
        <p>Тестовый оператор: admin / admin123</p>
        <p>Или <a href="/register" className="text-blue-600">зарегистрируйтесь</a></p>
      </div>
    </div>
  )
}

export default Login
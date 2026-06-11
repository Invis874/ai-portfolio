import React, { useState } from 'react'
import axios from 'axios'
import { useTheme } from '../../context/ThemeContext'

function AutoCollect({ onCollected }) {
  const { darkMode } = useTheme()
  const [query, setQuery] = useState('продукты питания')
  const [city, setCity] = useState('Москва')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleCollect = async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      alert('Необходимо войти как оператор')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/suppliers/auto_collect/`, {
        query, city
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setResult(response.data)
      if (onCollected) onCollected()
    } catch (error) {
      console.error('Error collecting:', error)
      alert('Ошибка при сборе данных')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
      <h3 className={`font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        🤖 Автоматический сбор поставщиков
      </h3>
      <div className="grid md:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Что ищем?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`px-3 py-2 border rounded ${
            darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
          }`}
        />
        <input
          type="text"
          placeholder="Город"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className={`px-3 py-2 border rounded ${
            darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
          }`}
        />
        <button
          onClick={handleCollect}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400"
        >
          {loading ? 'Сбор данных...' : '🚀 Найти поставщиков'}
        </button>
      </div>
      
      {result && (
        <div className={`mt-3 p-3 rounded ${darkMode ? 'bg-gray-600' : 'bg-white'}`}>
          <p>🔍 Найдено: {result.found} | ✅ Добавлено: {result.saved}</p>
        </div>
      )}
    </div>
  )
}

export default AutoCollect
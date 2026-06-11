import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useTheme } from '../context/ThemeContext'

function Dashboard({ token }) {
  const { darkMode } = useTheme()
  const [stats, setStats] = useState(null)
  const [period, setPeriod] = useState('week')

  useEffect(() => {
    fetchStats()
  }, [period])

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/sales/stats/?period=${period}`)
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}`
  }

  if (!stats) {
    return <div className={`text-center p-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Загрузка данных...</div>
  }

  const dailyStatsFormatted = stats.daily_stats?.map(item => ({
    ...item,
    dateFormatted: formatDate(item.date),
    date: item.date
  })) || []

  // Кастомный Tooltip для тёмной темы
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 border rounded shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
          <p className="font-semibold">{label}</p>
          {payload.map((p, idx) => (
            <p key={idx} style={{ color: p.color }}>
              {p.name}: {p.name === 'Выручка (₽)' 
                ? `${p.value?.toLocaleString()} ₽` 
                : p.value?.toLocaleString()}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className={`rounded-lg shadow-md p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            📈 Дашборд аналитики
          </h2>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className={`px-3 py-2 border rounded focus:outline-none focus:border-blue-500 transition-colors ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="day">За день</option>
            <option value="week">За неделю</option>
            <option value="month">За месяц</option>
          </select>
        </div>

        {/* Карточки с метриками */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className={`p-4 rounded-lg text-center transition-colors ${
            darkMode ? 'bg-blue-900/30' : 'bg-blue-50'
          }`}>
            <p className={darkMode ? 'text-blue-300' : 'text-gray-600'}>Общая выручка</p>
            <p className={`text-3xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {stats.total_revenue?.toLocaleString()} ₽
            </p>
          </div>
          <div className={`p-4 rounded-lg text-center transition-colors ${
            darkMode ? 'bg-green-900/30' : 'bg-green-50'
          }`}>
            <p className={darkMode ? 'text-green-300' : 'text-gray-600'}>Всего продаж</p>
            <p className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              {stats.total_quantity?.toLocaleString()} шт.
            </p>
          </div>
          <div className={`p-4 rounded-lg text-center transition-colors ${
            darkMode ? 'bg-purple-900/30' : 'bg-purple-50'
          }`}>
            <p className={darkMode ? 'text-purple-300' : 'text-gray-600'}>Количество заказов</p>
            <p className={`text-3xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              {stats.total_orders?.toLocaleString()}
            </p>
          </div>
        </div>

        {/* График по категориям */}
        <div className="mb-8">
          <h3 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Продажи по категориям</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.by_category}>
              <CartesianGrid stroke={darkMode ? '#374151' : '#e5e7eb'} strokeDasharray="3 3" />
              <XAxis 
                dataKey="category" 
                tick={{ fill: darkMode ? '#deecfe' : '#3b424d' }}
              />
              <YAxis 
                yAxisId="left" 
                tick={{ fill: darkMode ? '#60a5fa' : '#4b5563' }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tick={{ fill: darkMode ? '#4ade80' : '#4b5563' }}
              />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ 
                  fill: darkMode ? '#374151' : '#e5e7eb',
                  opacity: 0.3
                }}
              />
              <Legend 
                wrapperStyle={{ color: darkMode ? '#f3f4f6' : '#111827' }}
              />
              <Bar 
                yAxisId="left" 
                dataKey="revenue" 
                fill={darkMode ? '#60a5fa' : '#8884d8'} 
                name="Выручка (₽)" 
              />
              <Bar 
                yAxisId="right" 
                dataKey="quantity" 
                fill={darkMode ? '#4ade80' : '#82ca9d'} 
                name="Количество (шт.)" 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* График по дням */}
        <div className="mb-8">
          <h3 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Динамика продаж</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyStatsFormatted}>
              <CartesianGrid stroke={darkMode ? '#374151' : '#e5e7eb'} strokeDasharray="3 3" />
              <XAxis 
                dataKey="dateFormatted" 
                tick={{ fill: darkMode ? '#deecfe' : '#3b424d' }}
                label={{ 
                  value: 'Дата', 
                  position: 'insideBottom', 
                  offset: -5,
                  fill: darkMode ? '#9ca3af' : '#4b5563'
                }}
              />
              <YAxis 
                yAxisId="left" 
                tick={{ fill: darkMode ? '#60a5fa' : '#4b5563' }}
                label={{ 
                  value: 'Выручка (₽)', 
                  angle: -90, 
                  position: 'insideLeft',
                  fill: darkMode ? '#9ca3af' : '#4b5563'
                }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tick={{ fill: darkMode ? '#4ade80' : '#4b5563' }}
                label={{ 
                  value: 'Количество (шт.)', 
                  angle: 90, 
                  position: 'insideRight',
                  fill: darkMode ? '#9ca3af' : '#4b5563'
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ color: darkMode ? '#f3f4f6' : '#111827' }}
              />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="revenue" 
                stroke={darkMode ? '#60a5fa' : '#8884d8'} 
                name="Выручка (₽)" 
                strokeWidth={2}
                dot={{ r: 3, fill: darkMode ? '#60a5fa' : '#8884d8' }}
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="quantity" 
                stroke={darkMode ? '#4ade80' : '#82ca9d'} 
                name="Количество (шт.)" 
                strokeWidth={2}
                dot={{ r: 3, fill: darkMode ? '#4ade80' : '#82ca9d' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Дополнительная статистика */}
        {stats.by_category && stats.by_category.length > 0 && (
          <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              📊 Детальная статистика по категориям
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {stats.by_category.map((cat, idx) => (
                <div key={idx} className={`p-3 rounded-lg transition-colors ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <p className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {cat.category === 'pizza' && '🍕'}
                    {cat.category === 'rolls' && '🍣'}
                    {cat.category === 'salads' && '🥗'}
                    {cat.category === 'drinks' && '🥤'}
                    {' '}
                    {cat.category === 'pizza' && 'Пицца'}
                    {cat.category === 'rolls' && 'Роллы'}
                    {cat.category === 'salads' && 'Салаты'}
                    {cat.category === 'drinks' && 'Напитки'}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Выручка: <span className={`font-semibold ${darkMode ? 'text-blue-400' : 'text-gray-900'}`}>
                      {cat.revenue?.toLocaleString()} ₽
                    </span>
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Продано: <span className={`font-semibold ${darkMode ? 'text-green-400' : 'text-gray-900'}`}>
                      {cat.quantity?.toLocaleString()} шт.
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
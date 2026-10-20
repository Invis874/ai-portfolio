import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, startOfWeek, eachDayOfInterval } from 'date-fns'
import { useTheme } from '../context/ThemeContext'
import DateRangeFilter from './common/DateRangeFilter'
import { SkeletonLine, SkeletonValue } from './common/Skeleton'

const CATEGORY_LABELS = {
  pizza: 'Пицца',
  rolls: 'Роллы',
  salads: 'Салаты',
  drinks: 'Напитки',
}

const CATEGORY_EMOJIS = {
  pizza: '🍕',
  rolls: '🍣',
  salads: '🥗',
  drinks: '🥤',
}

function Dashboard({ token }) {
  const { darkMode } = useTheme()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // По умолчанию — текущая неделя
  const [dateRange, setDateRange] = useState([
    {
      startDate: startOfWeek(new Date(), { weekStartsOn: 1 }),
      endDate: new Date(),
      key: 'selection'
    }
  ])

  useEffect(() => {
    fetchStats()
  }, [dateRange])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const start = format(dateRange[0].startDate, 'yyyy-MM-dd')
      const end = format(dateRange[0].endDate, 'yyyy-MM-dd')
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/sales/stats/?start_date=${start}&end_date=${end}`
      )
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}`
  }

  // Кастомный Tooltip для тёмной темы
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 border rounded shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
          <p className="font-semibold">{CATEGORY_LABELS[label] || label}</p>
          {payload.map((p, idx) => (
            <p key={idx} style={{ color: p.color }}>
              {p.name}: {p.name === 'Выручка (₽)' ? `${p.value?.toLocaleString('ru-RU')} ₽` : p.value?.toLocaleString('ru-RU')}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Скелетон для графика
  const ChartSkeleton = () => (
    <div className={`h-[300px] w-full rounded-lg animate-pulse ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`} />
  )

  const ALL_CATEGORIES = ['pizza', 'rolls', 'salads', 'drinks']

  const fillDailyStatsWithZeros = (dailyStats, startDate, endDate) => {
      const days = eachDayOfInterval({ start: startDate, end: endDate })
      const statsMap = new Map((dailyStats || []).map(item => [item.date, item]))
      
      return days.map(day => {
        const key = format(day, 'yyyy-MM-dd')
        const existing = statsMap.get(key)
        return {
          date: key,
          revenue: existing?.revenue ?? 0,
          quantity: existing?.quantity ?? 0,
        }
      })
    }

    const fillCategoriesWithZeros = (byCategory) => {
      const categoryMap = new Map((byCategory || []).map(item => [item.category, item]))
      
      return ALL_CATEGORIES.map(cat => {
        const existing = categoryMap.get(cat)
        return {
          category: cat,
          revenue: existing?.revenue ?? 0,
          quantity: existing?.quantity ?? 0,
        }
      })
    }

  const dailyStatsWithZeros = fillDailyStatsWithZeros(
    stats?.daily_stats,
    dateRange[0].startDate,
    dateRange[0].endDate
  ).map(item => ({
    ...item,
    dateFormatted: formatDate(item.date),
  }))

  const categoriesWithZeros = fillCategoriesWithZeros(stats?.by_category)

  return (
    <div className="space-y-6">
      <div className={`rounded-lg shadow-md p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        
        {/* Заголовок + фильтр дат */}
        <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              📈 Дашборд аналитики
            </h2>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Данные за выбранный период
            </p>
          </div>
          <DateRangeFilter dateRange={dateRange} setDateRange={setDateRange} />
        </div>

        {/* Карточки с метриками */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className={`p-4 rounded-lg text-center transition-colors ${
            darkMode ? 'bg-blue-900/30' : 'bg-blue-50'
          }`}>
            <p className={darkMode ? 'text-blue-300' : 'text-gray-600'}>Общая выручка</p>
            {loading ? (
              <SkeletonValue />
            ) : (
              <p className={`text-3xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                {stats?.total_revenue?.toLocaleString('ru-RU')} ₽
              </p>
            )}
          </div>
          <div className={`p-4 rounded-lg text-center transition-colors ${
            darkMode ? 'bg-green-900/30' : 'bg-green-50'
          }`}>
            <p className={darkMode ? 'text-green-300' : 'text-gray-600'}>Всего продаж</p>
            {loading ? (
              <SkeletonValue />
            ) : (
              <p className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                {stats?.total_quantity?.toLocaleString('ru-RU')} шт.
              </p>
            )}
          </div>
          <div className={`p-4 rounded-lg text-center transition-colors ${
            darkMode ? 'bg-purple-900/30' : 'bg-purple-50'
          }`}>
            <p className={darkMode ? 'text-purple-300' : 'text-gray-600'}>Количество заказов</p>
            {loading ? (
              <SkeletonValue />
            ) : (
              <p className={`text-3xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                {stats?.total_orders?.toLocaleString('ru-RU')}
              </p>
            )}
          </div>
        </div>

        {/* График по категориям */}
        <div className="mb-8">
          <h3 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Продажи по категориям</h3>
          {loading ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoriesWithZeros}>
                <CartesianGrid stroke={darkMode ? '#374151' : '#e5e7eb'} strokeDasharray="3 3" />
                <XAxis 
                  dataKey="category" 
                  tick={{ fill: darkMode ? '#deecfe' : '#3b424d' }}
                  tickFormatter={(value) => CATEGORY_LABELS[value] || value}
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
          )}
        </div>

        {/* График по дням */}
        <div className="mb-8">
          <h3 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Динамика продаж</h3>
          {loading ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyStatsWithZeros}>
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
          )}
        </div>

        {/* Дополнительная статистика */}
        <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            📊 Детальная статистика по категориям
          </h3>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`p-3 rounded-lg animate-pulse ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className={`h-4 w-20 mb-2 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
                  <div className={`h-3 w-24 mb-1 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
                  <div className={`h-3 w-24 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categoriesWithZeros.map((cat, idx) => (
                <div key={idx} className={`p-3 rounded-lg transition-colors ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <p className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {CATEGORY_EMOJIS[cat.category]} {CATEGORY_LABELS[cat.category] || cat.category}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Выручка: <span className={`font-semibold ${darkMode ? 'text-blue-400' : 'text-gray-900'}`}>
                      {cat.revenue?.toLocaleString('ru-RU')} ₽
                    </span>
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Продано: <span className={`font-semibold ${darkMode ? 'text-green-400' : 'text-gray-900'}`}>
                      {cat.quantity?.toLocaleString('ru-RU')} шт.
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
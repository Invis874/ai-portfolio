import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { DateRangePicker } from 'react-date-range'
import { format, subDays, startOfMonth } from 'date-fns'
import { ru } from 'date-fns/locale'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import { useTheme } from '../context/ThemeContext'

function DataTable({ userRole, token }) {
  const { darkMode } = useTheme()
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    product_name: '',
    category: 'pizza',
    quantity: 1,
    revenue: 0
  })
  
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [dateRange, setDateRange] = useState([
    {
      startDate: subDays(new Date(), 30),
      endDate: new Date(),
      key: 'selection'
    }
  ])

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [data, dateRange, selectedCategory])

  const fetchData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/sales/`)
      setData(response.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const applyFilters = () => {
    let filtered = [...data]
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }
    
    const start = format(dateRange[0].startDate, 'yyyy-MM-dd')
    const end = format(dateRange[0].endDate, 'yyyy-MM-dd')
    filtered = filtered.filter(item => item.date >= start && item.date <= end)
    
    setFilteredData(filtered)
  }

  const handleCreate = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/sales/`, formData)
      fetchData()
      setFormData({ product_name: '', category: 'pizza', quantity: 1, revenue: 0 })
    } catch (error) {
      console.error('Error creating:', error)
    }
  }

  const handleUpdate = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/sales/${editingItem.id}/`, formData)
      fetchData()
      setEditingItem(null)
      setFormData({ product_name: '', category: 'pizza', quantity: 1, revenue: 0 })
    } catch (error) {
      console.error('Error updating:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Удалить запись?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/sales/${id}/`)
        fetchData()
      } catch (error) {
        console.error('Error deleting:', error)
      }
    }
  }

  const startEdit = (item) => {
    setEditingItem(item)
    setFormData({
      product_name: item.product_name,
      category: item.category,
      quantity: item.quantity,
      revenue: item.revenue
    })
  }

  const clearFilters = () => {
    setDateRange([
      {
        startDate: subDays(new Date(), 30),
        endDate: new Date(),
        key: 'selection'
      }
    ])
    setSelectedCategory('all')
  }

  const setLast7Days = () => {
    setDateRange([
      {
        startDate: subDays(new Date(), 7),
        endDate: new Date(),
        key: 'selection'
      }
    ])
    setShowDatePicker(false)
  }

  const setLast30Days = () => {
    setDateRange([
      {
        startDate: subDays(new Date(), 30),
        endDate: new Date(),
        key: 'selection'
      }
    ])
    setShowDatePicker(false)
  }

  const setThisMonth = () => {
    setDateRange([
      {
        startDate: startOfMonth(new Date()),
        endDate: new Date(),
        key: 'selection'
      }
    ])
    setShowDatePicker(false)
  }

  const categories = {
    pizza: '🍕 Пицца',
    rolls: '🍣 Роллы',
    salads: '🥗 Салаты',
    drinks: '🥤 Напитки'
  }

  const totals = filteredData.reduce((acc, item) => {
    acc.quantity += item.quantity
    acc.revenue += item.revenue
    return acc
  }, { quantity: 0, revenue: 0 })

  return (
    <div className={`rounded-lg shadow-md p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          📊 Данные продаж
        </h2>
        {userRole === 'operator' && (
          <span className={`px-3 py-1 rounded-full text-sm ${
            darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
          }`}>
            Режим редактирования
          </span>
        )}
      </div>

      {/* Панель фильтров */}
      <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h3 className={`font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>🔍 Фильтры</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="relative">
            <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Период</label>
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`w-full px-3 py-2 border rounded text-left flex justify-between items-center transition-colors ${
                darkMode 
                  ? 'bg-gray-600 border-gray-500 text-white hover:bg-gray-500' 
                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span>
                {format(dateRange[0].startDate, 'dd.MM.yyyy')} — {format(dateRange[0].endDate, 'dd.MM.yyyy')}
              </span>
              <span className="text-gray-400">📅</span>
            </button>
            
            <div className="flex gap-2 mt-2">
              <button
                onClick={setLast7Days}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  darkMode 
                    ? 'bg-gray-600 text-white hover:bg-gray-500' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                7 дней
              </button>
              <button
                onClick={setLast30Days}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  darkMode 
                    ? 'bg-gray-600 text-white hover:bg-gray-500' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                30 дней
              </button>
              <button
                onClick={setThisMonth}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  darkMode 
                    ? 'bg-gray-600 text-white hover:bg-gray-500' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Этот месяц
              </button>
            </div>
            
            {showDatePicker && (
              <div className="absolute z-10 mt-2 shadow-lg rounded-lg">
                <DateRangePicker
                  ranges={dateRange}
                  onChange={(item) => setDateRange([item.selection])}
                  locale={ru}
                  months={2}
                  direction="horizontal"
                  showDateDisplay={false}
                />
              </div>
            )}
          </div>
          
          <div>
            <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Категория</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500 transition-colors ${
                darkMode 
                  ? 'bg-gray-600 border-gray-500 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">📋 Все категории</option>
              {Object.entries(categories).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className={`px-4 py-2 rounded transition-colors ${
                darkMode 
                  ? 'bg-gray-600 text-white hover:bg-gray-500' 
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
              Сбросить фильтры
            </button>
          </div>
        </div>
        
        <div className={`mt-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Показано: {filteredData.length} из {data.length} записей
          {totals.revenue > 0 && (
            <span className="ml-4">
              | Итого: {totals.quantity.toLocaleString()} шт. на {totals.revenue.toLocaleString()} ₽
            </span>
          )}
        </div>
      </div>

      {/* Форма для создания/редактирования */}
      {userRole === 'operator' && (
        <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {editingItem ? '✏️ Редактирование' : '➕ Добавить запись'}
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Название продукта"
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              className={`px-3 py-2 border rounded transition-colors ${
                darkMode 
                  ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className={`px-3 py-2 border rounded transition-colors ${
                darkMode 
                  ? 'bg-gray-600 border-gray-500 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {Object.entries(categories).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Количество"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              className={`px-3 py-2 border rounded transition-colors ${
                darkMode 
                  ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            <input
              type="number"
              placeholder="Выручка"
              value={formData.revenue}
              onChange={(e) => setFormData({ ...formData, revenue: parseFloat(e.target.value) || 0 })}
              className={`px-3 py-2 border rounded transition-colors ${
                darkMode 
                  ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={editingItem ? handleUpdate : handleCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              {editingItem ? 'Сохранить' : 'Добавить'}
            </button>
            {editingItem && (
              <button
                onClick={() => {
                  setEditingItem(null)
                  setFormData({ product_name: '', category: 'pizza', quantity: 1, revenue: 0 })
                }}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition-colors"
              >
                Отмена
              </button>
            )}
          </div>
        </div>
      )}

      {/* Таблица данных */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className={darkMode ? 'bg-gray-700' : 'bg-gray-100'}>
              <th className={`p-3 text-left ${darkMode ? 'text-white' : 'text-gray-900'}`}>Продукт</th>
              <th className={`p-3 text-left ${darkMode ? 'text-white' : 'text-gray-900'}`}>Категория</th>
              <th className={`p-3 text-right ${darkMode ? 'text-white' : 'text-gray-900'}`}>Кол-во</th>
              <th className={`p-3 text-right ${darkMode ? 'text-white' : 'text-gray-900'}`}>Выручка</th>
              <th className={`p-3 text-left ${darkMode ? 'text-white' : 'text-gray-900'}`}>Дата</th>
              {userRole === 'operator' && <th className={`p-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Действия</th>}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={userRole === 'operator' ? 6 : 5} className={`p-3 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Нет данных за выбранный период
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.id} className={`border-t transition-colors ${
                  darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <td className={`p-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{item.product_name}</td>
                  <td className={`p-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{categories[item.category] || item.category}</td>
                  <td className={`p-3 text-right ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{item.quantity.toLocaleString()}</td>
                  <td className={`p-3 text-right ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{item.revenue.toLocaleString()} ₽</td>
                  <td className={`p-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{new Date(item.date).toLocaleDateString()}</td>
                  {userRole === 'operator' && (
                    <td className="p-3">
                      <button
                        onClick={() => startEdit(item)}
                        className={`mr-2 transition-colors ${
                          darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                        }`}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className={`transition-colors ${
                          darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'
                        }`}
                      >
                        🗑️
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DataTable
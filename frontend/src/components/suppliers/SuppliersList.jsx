import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useTheme } from '../../context/ThemeContext'
import SupplierCard from './SupplierCard'
import SupplierCompare from './SupplierCompare'
import AutoCollect from './AutoCollect'

function SuppliersList() {
  const { darkMode } = useTheme()
  const [suppliers, setSuppliers] = useState([])
  const [categories, setCategories] = useState([])
  const [filtersInfo, setFiltersInfo] = useState({ cities: [], regions: [] })
  const [loading, setLoading] = useState(true)
  const [compareMode, setCompareMode] = useState(false)
  const [selectedForCompare, setSelectedForCompare] = useState([])
  
  // Фильтры
  const [filters, setFilters] = useState({
    search: '',
    categories: [],
    city: '',
    region: '',
    min_amount: '',
    has_certificates: false,
    min_rating: '',
    ordering: '-rating'
  })
  
  // Пагинация
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchFiltersInfo()
  }, [])

  useEffect(() => {
    fetchSuppliers()
  }, [filters, page])

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/categories/`)
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchFiltersInfo = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/suppliers/filters_info/`)
      setFiltersInfo(response.data)
    } catch (error) {
      console.error('Error fetching filters info:', error)
    }
  }

  const fetchSuppliers = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
      
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.categories.length) params.append('categories', filters.categories.join(','))
      if (filters.city) params.append('city', filters.city)
      if (filters.region) params.append('region', filters.region)
      if (filters.min_amount) params.append('min_amount', filters.min_amount)
      if (filters.has_certificates) params.append('has_certificates', 'true')
      if (filters.min_rating) params.append('min_rating', filters.min_rating)
      if (filters.ordering) params.append('ordering', filters.ordering)
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/suppliers/?${params.toString()}`, { headers })
      setSuppliers(response.data)
      setHasMore(response.data.length === 10)
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value })
    setPage(1)
  }

  const toggleCategory = (categoryId) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(id => id !== categoryId)
      : [...filters.categories, categoryId]
    setFilters({ ...filters, categories: newCategories })
    setPage(1)
  }

  const toggleCompare = (supplier) => {
    if (selectedForCompare.find(s => s.id === supplier.id)) {
      setSelectedForCompare(selectedForCompare.filter(s => s.id !== supplier.id))
    } else if (selectedForCompare.length < 3) {
      setSelectedForCompare([...selectedForCompare, supplier])
    } else {
      alert('Можно сравнить не более 3 поставщиков')
    }
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      categories: [],
      city: '',
      region: '',
      min_amount: '',
      has_certificates: false,
      min_rating: '',
      ordering: '-rating'
    })
    setPage(1)
  }

  const orderingOptions = [
    { value: '-rating', label: 'По рейтингу (сначала высокий)' },
    { value: 'rating', label: 'По рейтингу (сначала низкий)' },
    { value: 'name', label: 'По названию (А-Я)' },
    { value: '-name', label: 'По названию (Я-А)' },
    { value: 'city', label: 'По городу' },
  ]

  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-6">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            📦 Поиск поставщиков
          </h1>
          <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Находите и сравнивайте поставщиков продуктов питания
          </p>
        </div>

        {/* Режим сравнения */}
        {selectedForCompare.length > 0 && (
          <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <div className="flex justify-between items-center">
              <div>
                <span className="font-semibold">Выбрано для сравнения: {selectedForCompare.length}/3</span>
              </div>
              <div className="space-x-2">
                {selectedForCompare.length >= 2 && (
                  <button
                    onClick={() => setCompareMode(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Сравнить
                  </button>
                )}
                <button
                  onClick={() => setSelectedForCompare([])}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Очистить
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно сравнения */}
        {compareMode && (
          <SupplierCompare
            suppliers={selectedForCompare}
            onClose={() => setCompareMode(false)}
          />
        )}

        {/* Фильтры */}
        <div className={`mb-6 p-4 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            {/* Поиск */}
            <input
              type="text"
              placeholder="🔍 Поиск по названию..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className={`px-3 py-2 border rounded focus:outline-none focus:border-blue-500 ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            />

            {/* Город */}
            <select
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className={`px-3 py-2 border rounded focus:outline-none ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            >
              <option value="">Все города</option>
              {[...new Set(filtersInfo.cities)].map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            {/* Регион */}
            <select
              value={filters.region}
              onChange={(e) => handleFilterChange('region', e.target.value)}
              className={`px-3 py-2 border rounded focus:outline-none ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            >
              <option value="">Все регионы</option>
              {[...new Set(filtersInfo.regions)].map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>

            {/* Сортировка */}
            <select
              value={filters.ordering}
              onChange={(e) => handleFilterChange('ordering', e.target.value)}
              className={`px-3 py-2 border rounded focus:outline-none ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            >
              {orderingOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            {/* Мин. сумма заказа */}
            <input
              type="number"
              placeholder="Мин. сумма заказа (₽)"
              value={filters.min_amount}
              onChange={(e) => handleFilterChange('min_amount', e.target.value)}
              className={`px-3 py-2 border rounded focus:outline-none ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            />

            {/* Мин. рейтинг */}
            <select
              value={filters.min_rating}
              onChange={(e) => handleFilterChange('min_rating', e.target.value)}
              className={`px-3 py-2 border rounded focus:outline-none ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            >
              <option value="">Любой рейтинг</option>
              <option value="4">★ 4+</option>
              <option value="3">★ 3+</option>
              <option value="2">★ 2+</option>
            </select>

            {/* Сертификаты */}
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.has_certificates}
                onChange={(e) => handleFilterChange('has_certificates', e.target.checked)}
                className="w-4 h-4"
              />
              <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                Только с сертификатами
              </span>
            </label>
          </div>

          {/* Категории */}
          <div className="mb-4">
            <p className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Категории товаров:
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.categories.includes(cat.id)
                      ? 'bg-blue-600 text-white'
                      : darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>

          {localStorage.getItem('access_token') && (
            <AutoCollect onCollected={fetchSuppliers} />
          )}

          {/* Кнопка сброса */}
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Сбросить все фильтры
          </button>
        </div>

        {/* Список поставщиков */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Загрузка...</p>
          </div>
        ) : suppliers.length === 0 ? (
          <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <p className="text-2xl mb-2">📭</p>
            <p>Поставщики не найдены</p>
            <p className="text-sm mt-2">Попробуйте изменить параметры фильтрации</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.map(supplier => (
              <SupplierCard
                key={supplier.id}
                supplier={supplier}
                isSelected={selectedForCompare.some(s => s.id === supplier.id)}
                onToggleCompare={() => toggleCompare(supplier)}
                compareMode={selectedForCompare.length > 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SuppliersList
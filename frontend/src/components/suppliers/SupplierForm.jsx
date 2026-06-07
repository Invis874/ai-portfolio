import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { useTheme } from '../../context/ThemeContext'

function SupplierForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { darkMode } = useTheme()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    category_ids: [],
    city: '',
    region: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    min_order_amount: '',
    min_order_quantity: '',
    price_info: '',
    delivery_terms: '',
    has_certificates: false,
    notes: ''
  })

  useEffect(() => {
    fetchCategories()
    if (id) {
      fetchSupplier()
    }
  }, [id])

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/categories/')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchSupplier = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/suppliers/${id}/`)
      const supplier = response.data
      setFormData({
        name: supplier.name,
        category_ids: supplier.categories.map(c => c.id),
        city: supplier.city,
        region: supplier.region,
        address: supplier.address || '',
        phone: supplier.phone,
        email: supplier.email,
        website: supplier.website || '',
        min_order_amount: supplier.min_order_amount || '',
        min_order_quantity: supplier.min_order_quantity || '',
        price_info: supplier.price_info || '',
        delivery_terms: supplier.delivery_terms || '',
        has_certificates: supplier.has_certificates,
        notes: supplier.notes || ''
      })
    } catch (error) {
      console.error('Error fetching supplier:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleCategoryToggle = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      category_ids: prev.category_ids.includes(categoryId)
        ? prev.category_ids.filter(id => id !== categoryId)
        : [...prev.category_ids, categoryId]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const token = localStorage.getItem('access_token')
    if (!token) {
      alert('Необходимо войти в аккаунт')
      setLoading(false)
      return
    }

    try {
      if (id) {
        await axios.put(`http://localhost:8000/api/suppliers/${id}/`, formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        alert('Поставщик обновлён!')
      } else {
        await axios.post('http://localhost:8000/api/suppliers/', formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        alert('Поставщик добавлен!')
      }
      navigate('/suppliers')
    } catch (error) {
      console.error('Error saving supplier:', error)
      alert('Ошибка при сохранении поставщика')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="max-w-3xl mx-auto">
        <h1 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {id ? '✏️ Редактирование поставщика' : '➕ Добавление поставщика'}
        </h1>

        <form onSubmit={handleSubmit} className={`rounded-lg shadow-md p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          {/* Подсказки */}
          <div className={`mb-6 p-3 rounded-lg ${darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
            <p className="text-sm">
              📌 <strong>Данные из API</strong> (заполняются автоматически): название, адрес, категории
            </p>
            <p className="text-sm mt-1">
              ✏️ <strong>Оператор может дополнить</strong>: телефон, email, сайт, условия доставки, цены, заметки
            </p>
          </div>
  
          {/* Основная информация */}
          <div className="mb-6">
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Основная информация</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Название компании *"
                value={formData.name}
                onChange={handleChange}
                required
                className={`px-3 py-2 border rounded focus:outline-none focus:border-blue-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
              <input
                type="text"
                name="city"
                placeholder="Город *"
                value={formData.city}
                onChange={handleChange}
                required
                className={`px-3 py-2 border rounded focus:outline-none focus:border-blue-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
              <input
                type="text"
                name="region"
                placeholder="Регион"
                value={formData.region}
                onChange={handleChange}
                className={`px-3 py-2 border rounded focus:outline-none focus:border-blue-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
              <input
                type="text"
                name="address"
                placeholder="Адрес"
                value={formData.address}
                onChange={handleChange}
                className={`px-3 py-2 border rounded focus:outline-none focus:border-blue-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
          </div>

          {/* Контакты */}
          <div className="mb-6">
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Контакты</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="tel"
                name="phone"
                placeholder="Телефон *"
                value={formData.phone}
                onChange={handleChange}
                required
                className={`px-3 py-2 border rounded focus:outline-none focus:border-blue-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
              <input
                type="email"
                name="email"
                placeholder="Email *"
                value={formData.email}
                onChange={handleChange}
                required
                className={`px-3 py-2 border rounded focus:outline-none focus:border-blue-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
              <input
                type="url"
                name="website"
                placeholder="Сайт"
                value={formData.website}
                onChange={handleChange}
                className={`px-3 py-2 border rounded focus:outline-none focus:border-blue-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
          </div>

          {/* Условия работы */}
          <div className="mb-6">
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Условия работы</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="number"
                name="min_order_amount"
                placeholder="Мин. сумма заказа (₽)"
                value={formData.min_order_amount}
                onChange={handleChange}
                className={`px-3 py-2 border rounded focus:outline-none focus:border-blue-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
              <input
                type="number"
                name="min_order_quantity"
                placeholder="Мин. объём (кг/шт)"
                value={formData.min_order_quantity}
                onChange={handleChange}
                className={`px-3 py-2 border rounded focus:outline-none focus:border-blue-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>
            <textarea
              name="delivery_terms"
              placeholder="Условия доставки"
              value={formData.delivery_terms}
              onChange={handleChange}
              rows="2"
              className={`w-full mt-2 px-3 py-2 border rounded focus:outline-none focus:border-blue-500 ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
            <textarea
              name="price_info"
              placeholder="Информация о ценах"
              value={formData.price_info}
              onChange={handleChange}
              rows="2"
              className={`w-full mt-2 px-3 py-2 border rounded focus:outline-none focus:border-blue-500 ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
          </div>

          {/* Категории */}
          <div className="mb-6">
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Категории товаров</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryToggle(cat.id)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    formData.category_ids.includes(cat.id)
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

          {/* Дополнительно */}
          <div className="mb-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="has_certificates"
                checked={formData.has_certificates}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Наличие сертификатов</span>
            </label>
            
            <textarea
              name="notes"
              placeholder="Заметки (внутренняя информация)"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className={`w-full mt-3 px-3 py-2 border rounded focus:outline-none focus:border-blue-500 ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/suppliers')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? 'Сохранение...' : (id ? 'Сохранить' : 'Добавить')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SupplierForm
import React from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'

function SupplierCard({ supplier, isSelected, onToggleCompare, compareMode }) {
  const { darkMode } = useTheme()

  const renderStars = () => {
    if (!supplier.rating_stars || supplier.rating_stars.text === 'Нет оценок') {
      return <span className="text-gray-400">Нет оценок</span>
    }
    
    const stars = []
    for (let i = 0; i < supplier.rating_stars.full; i++) {
      stars.push(<span key={`full-${i}`} className="text-yellow-400">★</span>)
    }
    if (supplier.rating_stars.half) {
      stars.push(<span key="half" className="text-yellow-400">½</span>)
    }
    for (let i = 0; i < supplier.rating_stars.empty; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">★</span>)
    }
    return <>{stars} <span className="text-sm ml-1">{supplier.rating_stars.text}</span></>
  }

  return (
    <div className={`rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {supplier.name}
          </h3>
          <div className="flex items-center space-x-1">
            {renderStars()}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {supplier.categories.slice(0, 3).map(cat => (
            <span key={cat.id} className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
              {cat.icon} {cat.name}
            </span>
          ))}
          {supplier.categories.length > 3 && (
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
              +{supplier.categories.length - 3}
            </span>
          )}
        </div>
        
        <div className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          📍 {supplier.city}, {supplier.region}
        </div>
        
        <div className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          📞 {supplier.phone}
        </div>
        
        <div className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          📞 {supplier.phone || 'Телефон не указан'}
          {!supplier.phone && !supplier.email && (
            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              Требует уточнения
            </span>
          )}
        </div>

        {supplier.email && (
          <div className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            📧 {supplier.email}
          </div>
        )}

        {supplier.min_order_amount && (
          <div className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            📦 Мин. заказ: {supplier.min_order_amount.toLocaleString()} ₽
          </div>
        )}
        
        {supplier.has_certificates && (
          <div className="text-sm mb-3 text-green-600">
            ✅ Есть сертификаты
          </div>
        )}
        
        <div className="flex space-x-2 mt-4">
          <Link
            to={`/suppliers/${supplier.id}`}
            className="flex-1 text-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Подробнее
          </Link>
          {compareMode && (
            <button
              onClick={onToggleCompare}
              className={`px-3 py-2 rounded transition ${
                isSelected
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
              {isSelected ? 'Убрать' : 'Сравнить'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default SupplierCard
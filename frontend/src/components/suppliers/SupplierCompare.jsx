import React from 'react'
import { useTheme } from '../../context/ThemeContext'

function SupplierCompare({ suppliers, onClose }) {
  const { darkMode } = useTheme()

  const renderStars = (rating) => {
    if (!rating || rating === 0) return <span className="text-gray-400">Нет оценок</span>
    const full = Math.floor(rating)
    const half = rating - full >= 0.5
    const empty = 5 - full - (half ? 1 : 0)
    
    return (
      <>
        {[...Array(full)].map((_, i) => <span key={`full-${i}`} className="text-yellow-400">★</span>)}
        {half && <span className="text-yellow-400">½</span>}
        {[...Array(empty)].map((_, i) => <span key={`empty-${i}`} className="text-gray-300">★</span>)}
        <span className="text-sm ml-1">{rating.toFixed(1)}</span>
      </>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className={`rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`sticky top-0 flex justify-between items-center p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Сравнение поставщиков
          </h2>
          <button
            onClick={onClose}
            className={`text-2xl ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            ×
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className={`p-4 text-left ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Характеристика</th>
                {suppliers.map(supplier => (
                  <th key={supplier.id} className="p-4 text-left min-w-[200px]">
                    <div className="font-bold text-lg">{supplier.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <td className={`p-4 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>📍 Город</td>
                {suppliers.map(supplier => (
                  <td key={supplier.id} className="p-4">{supplier.city}</td>
                ))}
              </tr>
              <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <td className={`p-4 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>📍 Регион</td>
                {suppliers.map(supplier => (
                  <td key={supplier.id} className="p-4">{supplier.region}</td>
                ))}
              </tr>
              <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <td className={`p-4 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>🏷️ Категории</td>
                {suppliers.map(supplier => (
                  <td key={supplier.id} className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {supplier.categories?.map(cat => (
                        <span key={cat} className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
              <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <td className={`p-4 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>📦 Мин. заказ</td>
                {suppliers.map(supplier => (
                  <td key={supplier.id} className="p-4">
                    {supplier.min_order_amount ? `${supplier.min_order_amount.toLocaleString()} ₽` : '—'}
                  </td>
                ))}
              </tr>
              <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <td className={`p-4 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>🚚 Доставка</td>
                {suppliers.map(supplier => (
                  <td key={supplier.id} className="p-4 text-sm">
                    {supplier.delivery_terms || '—'}
                  </td>
                ))}
              </tr>
              <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <td className={`p-4 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>✅ Сертификаты</td>
                {suppliers.map(supplier => (
                  <td key={supplier.id} className="p-4">
                    {supplier.has_certificates ? '✅ Да' : '❌ Нет'}
                  </td>
                ))}
              </tr>
              <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <td className={`p-4 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>⭐ Рейтинг</td>
                {suppliers.map(supplier => (
                  <td key={supplier.id} className="p-4">
                    <div className="flex items-center">
                      {renderStars(supplier.rating)}
                    </div>
                  </td>
                ))}
              </tr>
              <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <td className={`p-4 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>📞 Контакты</td>
                {suppliers.map(supplier => (
                  <td key={supplier.id} className="p-4">
                    <div className="text-sm">
                      <div>{supplier.phone}</div>
                      <div className="text-xs text-gray-500">{supplier.email}</div>
                      {supplier.website && (
                        <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs hover:underline">
                          {supplier.website}
                        </a>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className={`sticky bottom-0 flex justify-end p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  )
}

export default SupplierCompare
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useTheme } from '../../context/ThemeContext'

function SupplierDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { darkMode } = useTheme()
  const [supplier, setSupplier] = useState(null)
  const [loading, setLoading] = useState(true)
  const [review, setReview] = useState({ rating: 5, comment: '' })
  const [submitting, setSubmitting] = useState(false)
  const [userReview, setUserReview] = useState(null)
  const [userRole, setUserRole] = useState('guest')  // Добавь эту строку

  // Получаем роль пользователя
  useEffect(() => {
    const fetchUserRole = async () => {
      const token = localStorage.getItem('access_token')
      if (token) {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/profile/`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          setUserRole(response.data.role)
        } catch (error) {
          console.error('Error fetching user role:', error)
        }
      }
    }
    fetchUserRole()
  }, [])

  useEffect(() => {
    fetchSupplier()
    checkUserReview()
  }, [id])

  const fetchSupplier = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/suppliers/${id}/`, { headers })
      setSupplier(response.data)
    } catch (error) {
      console.error('Error fetching supplier:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkUserReview = async () => {
    const token = localStorage.getItem('access_token')
    if (!token) return

    try {
      const headers = { 'Authorization': `Bearer ${token}` }
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/reviews/?supplier_id=${id}`, { headers })
      const myReview = response.data.find(r => r.user?.username === JSON.parse(atob(token.split('.')[1])).username)
      if (myReview) {
        setUserReview(myReview)
        setReview({ rating: myReview.rating, comment: myReview.comment })
      }
    } catch (error) {
      console.error('Error checking user review:', error)
    }
  }

  const submitReview = async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      alert('Войдите в аккаунт, чтобы оставить отзыв')
      return
    }

    setSubmitting(true)
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/reviews/`, {
        supplier_id: parseInt(id),
        rating: review.rating,
        comment: review.comment
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      alert(userReview ? 'Отзыв обновлён!' : 'Отзыв добавлен!')
      fetchSupplier()
      checkUserReview()
      setReview({ rating: 5, comment: '' })
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Ошибка при отправке отзыва')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = () => {
    if (!supplier?.rating_stars || supplier.rating_stars.text === 'Нет оценок') {
      return <span className="text-gray-400">Нет оценок</span>
    }
    
    const stars = []
    for (let i = 0; i < supplier.rating_stars.full; i++) {
      stars.push(<span key={`full-${i}`} className="text-yellow-400 text-2xl">★</span>)
    }
    if (supplier.rating_stars.half) {
      stars.push(<span key="half" className="text-yellow-400 text-2xl">½</span>)
    }
    for (let i = 0; i < supplier.rating_stars.empty; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300 text-2xl">★</span>)
    }
    return <>{stars}</>
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Загрузка...</p>
      </div>
    )
  }

  if (!supplier) {
    return (
      <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <p className="text-2xl mb-2">❌</p>
        <p>Поставщик не найден</p>
        <button
          onClick={() => navigate('/suppliers')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Вернуться к списку
        </button>
      </div>
    )
  }

  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Кнопки навигации */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate('/suppliers')}
            className={`px-4 py-2 rounded transition-colors ${
              darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            ← Назад к списку
          </button>
          
          {userRole === 'operator' && (
            <Link
              to={`/suppliers/edit/${supplier.id}`}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
            >
              ✏️ Редактировать
            </Link>
          )}
        </div>

        {/* Карточка поставщика */}
        <div className={`rounded-lg shadow-md overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          {/* Шапка */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {supplier.name}
                </h1>
                <div className="flex items-center mt-2 space-x-2">
                  <div className="flex">{renderStars()}</div>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    ({supplier.reviews_count} отзывов)
                  </span>
                </div>
              </div>
              {supplier.has_certificates && (
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  ✅ Сертифицирован
                </div>
              )}
            </div>
          </div>

          {/* Контакты */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              📞 Контактная информация
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>📍 Адрес</p>
                <p className={darkMode ? 'text-white' : 'text-gray-900'}>{supplier.address || supplier.city}</p>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>📞 Телефон</p>
                <p className={darkMode ? 'text-white' : 'text-gray-900'}>{supplier.phone}</p>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>📧 Email</p>
                <p className={darkMode ? 'text-white' : 'text-gray-900'}>{supplier.email}</p>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>🌐 Сайт</p>
                {supplier.website ? (
                  <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {supplier.website}
                  </a>
                ) : (
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Не указан</p>
                )}
              </div>
            </div>
          </div>

          {/* Условия работы */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              📦 Условия работы
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {supplier.min_order_amount && (
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Минимальная сумма заказа</p>
                  <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {supplier.min_order_amount.toLocaleString()} ₽
                  </p>
                </div>
              )}
              {supplier.min_order_quantity && (
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Минимальный объём</p>
                  <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {supplier.min_order_quantity} кг/шт
                  </p>
                </div>
              )}
              {supplier.delivery_terms && (
                <div className="md:col-span-2">
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Условия доставки</p>
                  <p className={darkMode ? 'text-white' : 'text-gray-900'}>{supplier.delivery_terms}</p>
                </div>
              )}
              {supplier.price_info && (
                <div className="md:col-span-2">
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Информация о ценах</p>
                  <p className={darkMode ? 'text-white' : 'text-gray-900'}>{supplier.price_info}</p>
                </div>
              )}
            </div>
          </div>

          {/* Категории */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              🏷️ Категории товаров
            </h2>
            <div className="flex flex-wrap gap-2">
              {supplier.categories.map(cat => (
                <span key={cat.id} className="px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                  {cat.icon} {cat.name}
                </span>
              ))}
            </div>
          </div>

          {/* Заметки */}
          {supplier.notes && (
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                📝 Заметки
              </h2>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{supplier.notes}</p>
            </div>
          )}

          {/* Отзывы */}
          <div className="p-6">
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              💬 Отзывы ({supplier.reviews_count})
            </h2>

            {/* Форма отзыва */}
            <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {userReview ? 'Редактировать отзыв' : 'Оставить отзыв'}
              </h3>
              <div className="flex items-center space-x-2 mb-3">
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Оценка:</span>
                {[1, 2, 3, 4, 5].map(r => (
                  <button
                    key={r}
                    onClick={() => setReview({ ...review, rating: r })}
                    className={`text-2xl ${review.rating >= r ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={review.comment}
                onChange={(e) => setReview({ ...review, comment: e.target.value })}
                placeholder="Ваш комментарий..."
                rows="3"
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500 ${
                  darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                }`}
              />
              <button
                onClick={submitReview}
                disabled={submitting || !review.comment.trim()}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
              >
                {submitting ? 'Отправка...' : (userReview ? 'Обновить отзыв' : 'Отправить отзыв')}
              </button>
            </div>

            {/* Список отзывов */}
            {supplier.reviews?.length > 0 ? (
              <div className="space-y-4">
                {supplier.reviews.map(rev => (
                  <div key={rev.id} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-semibold">{rev.username}</span>
                        <div className="flex items-center mt-1">
                          {[1, 2, 3, 4, 5].map(r => (
                            <span key={r} className={`text-sm ${rev.rating >= r ? 'text-yellow-400' : 'text-gray-300'}`}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(rev.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{rev.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Пока нет отзывов. Будьте первым!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SupplierDetail
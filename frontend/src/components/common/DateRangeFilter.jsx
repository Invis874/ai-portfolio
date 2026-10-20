import React, { useState } from 'react'
import { DateRangePicker } from 'react-date-range'
import { format, subDays, startOfWeek, startOfMonth } from 'date-fns'
import { ru } from 'date-fns/locale'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import { useTheme } from '../../context/ThemeContext'

function DateRangeFilter({ dateRange, setDateRange, presets = true }) {
  const { darkMode } = useTheme()
  const [showDatePicker, setShowDatePicker] = useState(false)

  const setThisWeek = () => {
    setDateRange([{
      startDate: startOfWeek(new Date(), { weekStartsOn: 1 }),
      endDate: new Date(),
      key: 'selection'
    }])
    setShowDatePicker(false)
  }

  const setLast7Days = () => {
    setDateRange([{
      startDate: subDays(new Date(), 7),
      endDate: new Date(),
      key: 'selection'
    }])
    setShowDatePicker(false)
  }

  const setLast30Days = () => {
    setDateRange([{
      startDate: subDays(new Date(), 30),
      endDate: new Date(),
      key: 'selection'
    }])
    setShowDatePicker(false)
  }

  const setThisMonth = () => {
    setDateRange([{
      startDate: startOfMonth(new Date()),
      endDate: new Date(),
      key: 'selection'
    }])
    setShowDatePicker(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDatePicker(!showDatePicker)}
        className={`w-full px-3 py-2 border rounded flex items-center gap-2 transition-colors text-sm ${
          darkMode 
            ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
            : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
        }`}
      >
        <span>📅</span>
        <span>
          {format(dateRange[0].startDate, 'dd.MM.yyyy')} — {format(dateRange[0].endDate, 'dd.MM.yyyy')}
        </span>
      </button>

      {presets && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {[
            { label: 'Неделя', onClick: setThisWeek },
            { label: '7 дней', onClick: setLast7Days },
            { label: '30 дней', onClick: setLast30Days },
            { label: 'Месяц', onClick: setThisMonth },
          ].map((p) => (
            <button
              key={p.label}
              onClick={p.onClick}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                darkMode 
                  ? 'bg-gray-600 text-white hover:bg-gray-500' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {showDatePicker && (
        <>
          {/* Оверлей для закрытия */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDatePicker(false)}
          />
          <div className="absolute right-0 z-20 mt-2 shadow-lg rounded-lg">
            <DateRangePicker
              ranges={dateRange}
              onChange={(item) => {
                setDateRange([item.selection])
                setShowDatePicker(false)
              }}
              locale={ru}
              months={2}
              direction="horizontal"
              showDateDisplay={false}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default DateRangeFilter
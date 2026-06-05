import React from 'react'
import { useTheme } from '../context/ThemeContext'

function ThemeToggle() {
  const { darkMode, toggleDarkMode } = useTheme()

  return (
    <button
      onClick={toggleDarkMode}
      className="relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none"
      style={{
        backgroundColor: darkMode ? '#4ade80' : '#94a3b8'
      }}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 flex items-center justify-center text-sm ${
          darkMode ? 'transform translate-x-6' : ''
        }`}
      >
        {darkMode ? '🌙' : '☀️'}
      </span>
    </button>
  )
}

export default ThemeToggle
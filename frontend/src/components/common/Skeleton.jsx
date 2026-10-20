import React from 'react'
import { useTheme } from '../../context/ThemeContext'

export function SkeletonLine({ width = 'w-full', height = 'h-4' }) {
  const { darkMode } = useTheme()
  return (
    <div className={`${width} ${height} rounded animate-pulse ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
  )
}

export function SkeletonValue() {
  const { darkMode } = useTheme()
  return <div className={`h-8 w-32 mx-auto rounded animate-pulse ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
}
import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [colorTheme, setColorTheme] = useState('default')

  // Color themes with enhanced options
  const colorThemes = {
    default: {
      primary: 'from-blue-500 to-cyan-600',
      secondary: 'blue',
      accent: 'from-purple-500 to-pink-600',
      background: isDarkMode ? 'from-gray-900 via-blue-900 to-purple-900' : 'from-green-50 via-blue-50 to-purple-50',
      card: isDarkMode ? 'bg-gray-800' : 'bg-white',
      text: isDarkMode ? 'text-white' : 'text-gray-900',
      textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
      border: isDarkMode ? 'border-gray-700' : 'border-gray-200'
    },
    farmer: {
      primary: 'from-green-500 to-emerald-600',
      secondary: 'green',
      accent: 'from-lime-500 to-green-600',
      background: isDarkMode ? 'from-gray-900 via-green-900 to-emerald-900' : 'from-green-50 via-emerald-50 to-lime-50',
      card: isDarkMode ? 'bg-gray-800' : 'bg-white',
      text: isDarkMode ? 'text-white' : 'text-gray-900',
      textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
      border: isDarkMode ? 'border-gray-700' : 'border-gray-200'
    },
    distributor: {
      primary: 'from-blue-500 to-cyan-600',
      secondary: 'blue',
      accent: 'from-cyan-500 to-blue-600',
      background: isDarkMode ? 'from-gray-900 via-blue-900 to-cyan-900' : 'from-blue-50 via-cyan-50 to-sky-50',
      card: isDarkMode ? 'bg-gray-800' : 'bg-white',
      text: isDarkMode ? 'text-white' : 'text-gray-900',
      textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
      border: isDarkMode ? 'border-gray-700' : 'border-gray-200'
    },
    retailer: {
      primary: 'from-purple-500 to-indigo-600',
      secondary: 'purple',
      accent: 'from-violet-500 to-purple-600',
      background: isDarkMode ? 'from-gray-900 via-purple-900 to-indigo-900' : 'from-purple-50 via-violet-50 to-indigo-50',
      card: isDarkMode ? 'bg-gray-800' : 'bg-white',
      text: isDarkMode ? 'text-white' : 'text-gray-900',
      textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
      border: isDarkMode ? 'border-gray-700' : 'border-gray-200'
    },
    consumer: {
      primary: 'from-orange-500 to-amber-600',
      secondary: 'orange',
      accent: 'from-yellow-500 to-orange-600',
      background: isDarkMode ? 'from-gray-900 via-orange-900 to-amber-900' : 'from-orange-50 via-amber-50 to-yellow-50',
      card: isDarkMode ? 'bg-gray-800' : 'bg-white',
      text: isDarkMode ? 'text-white' : 'text-gray-900',
      textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
      border: isDarkMode ? 'border-gray-700' : 'border-gray-200'
    },
    government: {
      primary: 'from-gray-500 to-slate-700',
      secondary: 'gray',
      accent: 'from-slate-500 to-gray-600',
      background: isDarkMode ? 'from-gray-900 via-slate-900 to-zinc-900' : 'from-gray-50 via-slate-50 to-zinc-50',
      card: isDarkMode ? 'bg-gray-800' : 'bg-white',
      text: isDarkMode ? 'text-white' : 'text-gray-900',
      textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
      border: isDarkMode ? 'border-gray-700' : 'border-gray-200'
    }
  }

  const currentTheme = colorThemes[colorTheme] || colorThemes.default

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    const savedColorTheme = localStorage.getItem('colorTheme') || 'default'
    setIsDarkMode(savedDarkMode)
    setColorTheme(savedColorTheme)
  }, [])

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString())
    localStorage.setItem('colorTheme', colorTheme)
  }, [isDarkMode, colorTheme])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  const setTheme = (theme) => {
    setColorTheme(theme)
  }

  const value = {
    isDarkMode,
    colorTheme,
    currentTheme,
    colorThemes,
    toggleDarkMode,
    setTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}


import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const PriceTicker = ({ data, loading }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (data.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % data.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [data.length])

  const getPriceChange = (price) => {
    // Simulate price change for demo
    const change = (Math.random() - 0.5) * 10
    return {
      value: change,
      percentage: ((change / price.average) * 100).toFixed(1),
      isPositive: change > 0
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/6"></div>
                <div className="h-6 bg-gray-200 rounded w-1/6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <p className="text-gray-500">No price data available</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-primary-600 to-secondary-500 p-6">
        <h3 className="text-2xl font-bold text-white flex items-center">
          <TrendingUp className="w-6 h-6 mr-2" />
          Live Market Prices
        </h3>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.map((crop, index) => {
            const change = getPriceChange(crop.latestPrice)
            
            return (
              <motion.div
                key={crop._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 capitalize">
                    {crop._id}
                  </h4>
                  <div className={`flex items-center text-sm ${
                    change.isPositive ? 'text-green-600' : 
                    change.value === 0 ? 'text-gray-600' : 'text-red-600'
                  }`}>
                    {change.isPositive ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : change.value === 0 ? (
                      <Minus className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    {change.percentage}%
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Min:</span>
                    <span>₹{crop.latestPrice.min}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Max:</span>
                    <span>₹{crop.latestPrice.max}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-gray-900">
                    <span>Avg:</span>
                    <span>₹{crop.latestPrice.average}</span>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  {crop.market?.name || 'Market'}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default PriceTicker



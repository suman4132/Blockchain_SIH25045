import { useState, useEffect, useRef } from 'react'
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  QrCode, 
  TrendingUp, 
  MapPin, 
  Shield, 
  Users, 
  Truck,
  ArrowRight,
  Star,
  Sparkles,
  Leaf,
  Target,
  BarChart3,
  Calendar,
  Globe,
  CheckCircle,
  PieChart,
  Activity,
  TrendingDown,
  LineChart,
  AreaChart,
  Database,
  Zap,
  Cloud,
  Lock
} from 'lucide-react'
import MapHeatmap from '../components/home/MapHeatmap'
import StatsSection from '../components/home/StatsSection'
import api from '../services/api'

// Enhanced PriceTicker with hover effects and more data
const PriceTicker = ({ data, loading }) => {
  const getPriceChange = (priceData) => {
    if (!priceData || typeof priceData.change === 'undefined') {
      return { change: 0, isPositive: true }
    }
    const change = priceData.change || 0
    return {
      change: Math.abs(change),
      isPositive: change >= 0
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-4">No price data available at the moment</div>
        <div className="text-sm text-gray-400">Please check back later for market updates</div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-white via-primary-50/30 to-secondary-50/30 rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 transform rotate-12 scale-150"></div>
      </div>
      
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-gray-200">
        {data.map((item, index) => {
          const { change, isPositive } = getPriceChange(item)
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              whileHover={{ 
                scale: 1.08, 
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
              }}
              className="p-6 text-center cursor-pointer transition-all duration-300 group relative overflow-hidden"
            >
              {/* Hover effect background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary-100/50 to-green-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />
              
              <div className="relative z-10">
                <motion.h3 
                  className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  {item.crop || 'N/A'}
                </motion.h3>
                
                <motion.div 
                  className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary-800 transition-colors duration-300"
                  whileHover={{ scale: 1.1 }}
                >
                  ₹{item.price ? item.price.toLocaleString('en-IN') : 'N/A'}
                </motion.div>
                
                <motion.div 
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                    isPositive 
                      ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 group-hover:from-green-200 group-hover:to-emerald-200' 
                      : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 group-hover:from-red-200 group-hover:to-rose-200'
                  }`}
                  whileHover={{ scale: 1.1, y: -2 }}
                >
                  <motion.div
                    animate={{ 
                      y: isPositive ? [0, -2, 0] : [0, 2, 0],
                      rotate: isPositive ? [0, 5, 0] : [0, -5, 0]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                  >
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                  </motion.div>
                  {change}%
                </motion.div>
                
                <motion.div 
                  className="mt-2 text-sm text-gray-500 group-hover:text-gray-700 transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  Vol: {item.volume?.toLocaleString() || 'N/A'}
                </motion.div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// Animated counter remains the same
const AnimatedCounter = ({ value, decimal = 0, suffix = '' }) => {
  const [currentValue, setCurrentValue] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  useEffect(() => {
    if (isInView) {
      const duration = 2000 // ms
      const steps = 60
      const stepValue = value / steps
      let step = 0

      const timer = setInterval(() => {
        step += 1
        const nextValue = step * stepValue
        setCurrentValue(nextValue > value ? value : nextValue)

        if (step >= steps) clearInterval(timer)
      }, duration / steps)

      return () => clearInterval(timer)
    }
  }, [isInView, value])

  return (
    <span ref={ref} className="font-bold">
      {currentValue.toFixed(decimal)}{suffix}
    </span>
  )
}

// Updated TrendingPriceGraph with enhanced animations, area fill, and unique effects
const TrendingPriceGraph = ({ data, title, color = 'bg-primary-500' }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const lineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { pathLength: 1, opacity: 1, transition: { duration: 1.5, ease: "easeInOut" } }
  }
  const areaVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 0.3, y: 0, transition: { duration: 1.5, ease: "easeInOut" } }
  }

  // Normalize data for SVG
  const maxValue = Math.max(...data.map(item => item.value))
  const minValue = Math.min(...data.map(item => item.value))
  const points = data.map((item, i) => {
    const x = (i / (data.length - 1)) * 300
    const y = 150 - ((item.value - minValue) / (maxValue - minValue)) * 140 - 5 // Adjusted for padding
    return `${x},${y}`
  }).join(' ')

  // Area fill points
  const areaPoints = `0,150 ${points} 300,150`

  const colorHex = color.replace('bg-', '#')

  return (
    <motion.div 
      className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
      }}
    >
      {/* Background grid lines */}
      <div className="absolute inset-0 px-6 pb-4 pt-16 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-0 right-0 h-[1px] bg-gray-100"
            style={{ bottom: `${(i / 4) * 100}%` }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 1, delay: i * 0.1 }}
          />
        ))}
      </div>

      <div className="flex justify-between items-center mb-6 relative z-10">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center text-sm text-green-500">
          <TrendingUp className="w-4 h-4 mr-1" />
          <span>+12.5%</span>
        </div>
      </div>
      <div className="relative h-40">
        <svg width="100%" height="100%" viewBox="0 0 300 150" preserveAspectRatio="none">
          {/* Gradient defs */}
          <defs>
            <linearGradient id={`gradient-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colorHex} stopOpacity="0.3" />
              <stop offset="100%" stopColor={colorHex} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area fill with glow */}
          <motion.path
            d={`M ${areaPoints}`}
            fill={`url(#gradient-${title})`}
            initial="hidden"
            whileInView="visible"
            variants={areaVariants}
            viewport={{ once: true }}
            filter="url(#glow)"
          />
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Animated line */}
          <motion.polyline
            points={points}
            fill="none"
            stroke={colorHex}
            strokeWidth="3"
            strokeLinecap="round"
            initial="hidden"
            whileInView="visible"
            variants={lineVariants}
            viewport={{ once: true }}
          />

          {/* Data points with pulse animation */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 300
            const y = 150 - ((item.value - minValue) / (maxValue - minValue)) * 140 - 5
            return (
              <g key={index}>
                <motion.circle
                  cx={x}
                  cy={y}
                  r="5"
                  fill={colorHex}
                  stroke="white"
                  strokeWidth="2"
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  animate={{
                    scale: hoveredIndex === index ? 1.5 : 1,
                    transition: { duration: 0.3 }
                  }}
                  onHoverStart={() => setHoveredIndex(index)}
                  onHoverEnd={() => setHoveredIndex(null)}
                />
                {/* Pulse ring */}
                <motion.circle
                  cx={x}
                  cy={y}
                  r="5"
                  fill="none"
                  stroke={colorHex}
                  strokeWidth="2"
                  initial={{ scale: 1, opacity: 0 }}
                  animate={{
                    scale: [1, 2, 1],
                    opacity: [0, 0.5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.2,
                    ease: "easeOut"
                  }}
                />
                <AnimatePresence>
                  {hoveredIndex === index && (
                    <motion.g
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <rect
                        x={x - 40}
                        y={y - 35}
                        width="80"
                        height="25"
                        rx="4"
                        fill="white"
                        stroke={colorHex}
                        filter="url(#shadow)"
                      />
                      <text x={x} y={y - 15} textAnchor="middle" fill="black" fontSize="12" fontWeight="bold">
                        {item.value}
                      </text>
                    </motion.g>
                  )}
                </AnimatePresence>
              </g>
            )
          })}
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.1"/>
            </filter>
          </defs>
        </svg>
      </div>
      <div className="flex justify-between mt-4 relative z-10">
        {data.map((item, index) => (
          <motion.span 
            key={item.label} 
            className="text-xs text-gray-500 cursor-pointer"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ color: colorHex, scale: 1.1 }}
          >
            {item.label}
          </motion.span>
        ))}
      </div>
    </motion.div>
  )
}

// Updated MarketData without pie chart, enhanced with more animations
const MarketData = () => {
  const wheatData = [
    { label: 'Jan', value: 65 },
    { label: 'Feb', value: 78 },
    { label: 'Mar', value: 72 },
    { label: 'Apr', value: 85 },
    { label: 'May', value: 90 },
    { label: 'Jun', value: 96 },
  ]

  const riceData = [
    { label: 'Jan', value: 58 },
    { label: 'Feb', value: 62 },
    { label: 'Mar', value: 70 },
    { label: 'Apr', value: 75 },
    { label: 'May', value: 82 },
    { label: 'Jun', value: 88 },
  ]

  const cornData = [
    { label: 'Jan', value: 70 },
    { label: 'Feb', value: 75 },
    { label: 'Mar', value: 80 },
    { label: 'Apr', value: 78 },
    { label: 'May', value: 85 },
    { label: 'Jun', value: 92 },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <TrendingPriceGraph data={wheatData} title="Wheat Price Trend" color="bg-amber-500" />
      <TrendingPriceGraph data={riceData} title="Rice Price Trend" color="bg-emerald-500" />
      <TrendingPriceGraph data={cornData} title="Corn Price Trend" color="bg-blue-500" />
    </div>
  )
}

// Enhanced SupplyChainViz with more steps and tooltips
const SupplyChainViz = () => {
  const steps = [
    { name: 'Sourcing', icon: Globe, color: 'bg-blue-500', description: 'Sustainable farm selection' },
    { name: 'Planting', icon: Leaf, color: 'bg-green-500', description: 'Eco-friendly cultivation' },
    { name: 'Harvesting', icon: Target, color: 'bg-yellow-500', description: 'Optimal timing & quality check' },
    { name: 'Processing', icon: Activity, color: 'bg-orange-500', description: 'Hygienic handling' },
    { name: 'Storage', icon: Database, color: 'bg-indigo-500', description: 'Climate-controlled facilities' },
    { name: 'Distribution', icon: Truck, color: 'bg-purple-500', description: 'Efficient logistics' },
    { name: 'Retail', icon: BarChart3, color: 'bg-pink-500', description: 'Smart inventory management' },
    { name: 'Consumer', icon: Users, color: 'bg-primary-500', description: 'Transparent delivery' },
  ]

  const [hoveredStep, setHoveredStep] = useState(null)

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mt-12">
      <h3 className="text-xl font-semibold text-gray-900 mb-8 text-center">Enhanced Supply Chain Journey</h3>
      <div className="flex flex-wrap justify-between relative">
        {/* Connection line with animation */}
        <motion.div 
          className="absolute top-10 left-0 right-0 h-1 bg-gray-200 z-0"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true }}
        />
        
        {steps.map((step, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.1 }}
            onHoverStart={() => setHoveredStep(index)}
            onHoverEnd={() => setHoveredStep(null)}
            className="relative z-10 flex flex-col items-center mb-8 w-1/2 sm:w-1/4 md:w-auto cursor-pointer"
          >
            <div className={`w-20 h-20 ${step.color} rounded-full flex items-center justify-center text-white shadow-lg mb-3`}>
              <step.icon className="w-8 h-8" />
            </div>
            <span className="text-sm font-medium text-gray-700">{step.name}</span>
            <AnimatePresence>
              {hoveredStep === index && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-24 bg-white p-2 rounded-lg shadow-md text-sm text-gray-600 border border-gray-200"
                >
                  {step.description}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// New component: Testimonials
const Testimonials = () => {
  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'Farmer, Punjab',
      content: 'Farm2Shelf has revolutionized how I sell my produce. Real-time prices and transparent tracking have increased my earnings by 30%!',
      rating: 5,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh'
    },
    {
      name: 'Priya Sharma',
      role: 'Distributor, Mumbai',
      content: 'The blockchain security ensures no tampering in the supply chain. Our efficiency has improved dramatically.',
      rating: 5,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya'
    },
    {
      name: 'Amit Patel',
      role: 'Consumer, Delhi',
      content: 'Being able to scan QR and see the entire journey of my food gives me peace of mind about what my family eats.',
      rating: 4,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit'
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-800 text-sm font-medium mb-4">
            <Star className="w-4 h-4 mr-2" />
            What Our Users Say
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hear from farmers, distributors, and consumers who love Farm2Shelf
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center mb-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <p className="text-gray-600">{testimonial.content}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// New component: Advanced Features Section
const AdvancedFeatures = () => {
  const advancedFeatures = [
    {
      icon: Zap,
      title: 'AI-Powered Predictions',
      description: 'Machine learning algorithms forecast crop prices and supply chain disruptions.',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      icon: Cloud,
      title: 'IoT Integration',
      description: 'Real-time monitoring of storage conditions using IoT sensors.',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      icon: Lock,
      title: 'Advanced Analytics',
      description: 'Deep insights into supply chain metrics with customizable dashboards.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: AreaChart,
      title: 'Sustainability Tracking',
      description: 'Carbon footprint calculation and eco-friendly route optimization.',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-800 text-sm font-medium mb-4">
            <Zap className="w-4 h-4 mr-2" />
            Cutting-Edge Tech
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Advanced Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Leveraging the latest technologies for a smarter supply chain
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {advancedFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className={`w-14 h-14 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4 relative z-10`}>
                <feature.icon className={`w-7 h-7 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 relative z-10">
                {feature.title}
              </h3>
              <p className="text-gray-600 relative z-10">
                {feature.description}
              </p>
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ArrowRight className={`w-5 h-5 ${feature.color}`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const HomePage = () => {
  const [priceData, setPriceData] = useState([])
  const [loading, setLoading] = useState(true)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8])

  useEffect(() => {
    fetchPriceData()
  }, [])

  const fetchPriceData = async () => {
    try {
      // Enhanced mock data with more crops and volume
      const mockData = [
        { crop: 'Wheat', price: 2150, change: 2.5, volume: 150000 },
        { crop: 'Rice', price: 2850, change: 1.8, volume: 120000 },
        { crop: 'Corn', price: 1950, change: -0.7, volume: 80000 },
        { crop: 'Tomato', price: 3250, change: 4.2, volume: 95000 },
        { crop: 'Potato', price: 1750, change: 0.5, volume: 110000 },
        { crop: 'Onion', price: 1450, change: -1.2, volume: 70000 },
      ]
      
      setPriceData(mockData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching price data:', error)
      const mockData = [
        { crop: 'Wheat', price: 2150, change: 2.5, volume: 150000 },
        { crop: 'Rice', price: 2850, change: 1.8, volume: 120000 },
        { crop: 'Corn', price: 1950, change: -0.7, volume: 80000 },
        { crop: 'Tomato', price: 3250, change: 4.2, volume: 95000 },
        { crop: 'Potato', price: 1750, change: 0.5, volume: 110000 },
        { crop: 'Onion', price: 1450, change: -1.2, volume: 70000 },
      ]
      setPriceData(mockData)
      setLoading(false)
    }
  }

  const features = [
    {
      icon: QrCode,
      title: 'QR Code Tracking',
      description: 'Scan QR codes to trace your food from farm to shelf with complete transparency.',
      color: 'text-primary-600',
      bgColor: 'bg-primary-100'
    },
    {
      icon: Shield,
      title: 'Blockchain Security',
      description: 'Immutable records on blockchain ensure data integrity and prevent fraud.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: Users,
      title: 'Multi-Role Platform',
      description: 'Connect farmers, distributors, retailers, and consumers in one ecosystem.',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: TrendingUp,
      title: 'Price Transparency',
      description: 'Real-time price updates and market trends for better decision making.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  const stats = [
    { label: 'Active Farmers', value: 15000, icon: Users, suffix: '+' },
    { label: 'Batches Tracked', value: 75000, icon: QrCode, suffix: '+' },
    { label: 'Cities Covered', value: 750, icon: MapPin, suffix: '+' },
    { label: 'Trust Score', value: 4.9, icon: Star, suffix: '/5', decimal: 1 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-primary-50/20 to-secondary-50/30">
      {/* Hero Section with enhanced animations */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20 overflow-hidden">
        {/* Enhanced background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          {/* Floating geometric shapes */}
          <motion.div 
            className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-primary-200/30 to-primary-300/20 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1], 
              opacity: [0.5, 0.8, 0.5],
              x: [0, 20, 0],
              y: [0, -10, 0]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-br from-secondary-200/30 to-orange-300/20 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.1, 1], 
              opacity: [0.5, 0.7, 0.5],
              x: [0, -15, 0],
              y: [0, 15, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-green-200/20 to-emerald-300/10 rounded-full blur-3xl"
            animate={{ 
              rotate: 360,
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Additional floating elements */}
          <motion.div 
            className="absolute top-32 right-32 w-4 h-4 bg-primary-400 rounded-full"
            animate={{ 
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-32 left-32 w-6 h-6 bg-secondary-400 rounded-full"
            animate={{ 
              y: [0, 15, 0],
              opacity: [0.4, 0.9, 0.4]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
          <motion.div 
            className="absolute top-1/3 right-1/4 w-3 h-3 bg-green-400 rounded-full"
            animate={{ 
              x: [0, 25, 0],
              opacity: [0.2, 0.7, 0.2]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-800 text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                Transforming Food Supply Chains
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                From{' '}
                <motion.span 
                  className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-green-600 to-emerald-600"
                  whileHover={{ 
                    scale: 1.05,
                    backgroundPosition: "200% center"
                  }}
                  animate={{
                    backgroundPosition: ["0% center", "200% center", "0% center"]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    backgroundSize: "200% 100%"
                  }}
                >Farm</motion.span>
                {' '}to{' '}
                <motion.span 
                  className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-600 via-orange-600 to-red-600"
                  whileHover={{ 
                    scale: 1.05,
                    backgroundPosition: "200% center"
                  }}
                  animate={{
                    backgroundPosition: ["0% center", "200% center", "0% center"]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                  style={{
                    backgroundSize: "200% 100%"
                  }}
                >Shelf</motion.span>
                {' '}with{' '}
                <motion.span 
                  className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600"
                  whileHover={{ 
                    scale: 1.05,
                    backgroundPosition: "200% center"
                  }}
                  animate={{
                    backgroundPosition: ["0% center", "200% center", "0% center"]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                  }}
                  style={{
                    backgroundSize: "200% 100%"
                  }}
                >Trust</motion.span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Track your food's journey from harvest to your table with complete transparency, 
                blockchain security, and real-time price updates.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/scan"
                    className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-600 via-green-600 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-700 via-green-700 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{
                        x: ["-100%", "100%"]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <QrCode className="w-6 h-6 mr-2 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="relative z-10">Scan QR Code</span>
                    <ArrowRight className="w-5 h-5 ml-2 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/register"
                    className="group relative inline-flex items-center justify-center px-8 py-4 border-2 border-primary-600 text-primary-600 font-semibold rounded-xl hover:bg-primary-600 hover:text-white transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      animate={{
                        x: ["-100%", "100%"]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                      }}
                    />
                    <span className="relative z-10">Get Started</span>
                    <ArrowRight className="w-5 h-5 ml-2 relative z-10 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  </Link>
                </motion.div>
              </div>
              
              <motion.div 
                className="flex items-center pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <motion.div 
                      key={item} 
                      className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-primary-100 to-green-100 flex items-center justify-center shadow-lg"
                      whileHover={{ 
                        scale: 1.3, 
                        zIndex: 10,
                        rotate: 360,
                        boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
                      }}
                      animate={{
                        y: [0, -5, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: item * 0.1
                      }}
                    >
                      <Users className="w-5 h-5 text-primary-600" />
                    </motion.div>
                  ))}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">
                    Join <AnimatedCounter value={15000} suffix="+" /> users
                  </p>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.div
                        key={star}
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: star * 0.1
                        }}
                      >
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      </motion.div>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      <AnimatedCounter value={4.9} decimal={1} />/5 rating
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-8 border-white">
                <MapHeatmap />
              </div>
              
              {/* Enhanced floating elements */}
              <motion.div
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, 5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                whileHover={{ 
                  scale: 1.1,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
                }}
                className="absolute -top-4 -left-4 bg-gradient-to-br from-white to-primary-50 p-3 rounded-xl shadow-lg border border-primary-200"
              >
                <div className="flex items-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Target className="w-5 h-5 text-primary-600 mr-2" />
                  </motion.div>
                  <span className="text-sm font-semibold text-primary-800">Live Tracking</span>
                </div>
              </motion.div>
              
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, -3, 0],
                  scale: [1, 1.02, 1]
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                whileHover={{ 
                  scale: 1.1,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
                }}
                className="absolute -bottom-4 -right-4 bg-gradient-to-br from-white to-green-50 p-3 rounded-xl shadow-lg border border-green-200"
              >
                <div className="flex items-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Leaf className="w-5 h-5 text-green-600 mr-2" />
                  </motion.div>
                  <span className="text-sm font-semibold text-green-800">Organic Farms</span>
                </div>
              </motion.div>
              
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 3, 0],
                  scale: [1, 1.03, 1]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                whileHover={{ 
                  scale: 1.1,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
                }}
                className="absolute top-10 right-10 bg-gradient-to-br from-white to-yellow-50 p-3 rounded-xl shadow-lg border border-yellow-200"
              >
                <div className="flex items-center">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Zap className="w-5 h-5 text-yellow-600 mr-2" />
                  </motion.div>
                  <span className="text-sm font-semibold text-yellow-800">AI Insights</span>
                </div>
              </motion.div>
              
              {/* Floating QR Scan Button */}
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                whileHover={{
                  scale: 1.2,
                  rotate: 360
                }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
              >
                <Link
                  to="/scan"
                  className="group relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-600 via-green-600 to-emerald-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    <QrCode className="w-8 h-8" />
                  </motion.div>
                  <div className="absolute inset-0 rounded-full border-2 border-primary-400 animate-ping opacity-75 group-hover:opacity-100"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping delay-1000 opacity-50 group-hover:opacity-75"></div>
                  <div className="absolute inset-0 rounded-full border-6 border-emerald-400 animate-ping delay-2000 opacity-25 group-hover:opacity-50"></div>
                  
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                      x: ["-100%", "100%"]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Price Ticker Section */}
      <section className="py-16 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-50/30 to-secondary-50/30 -skew-y-2 transform origin-center"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-800 text-sm font-medium mb-4">
              <BarChart3 className="w-4 h-4 mr-2" />
              Live Market Data
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Real-time Crop Prices
            </h2>
            <p className="text-xl text-gray-600">
              Track market fluctuations across India with volume insights
            </p>
          </motion.div>
          
          <PriceTicker data={priceData} loading={loading} />
          
          {/* Enhanced Market Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16"
          >
            <MarketData />
          </motion.div>
          
          {/* Supply Chain Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <SupplyChainViz />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-white"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-800 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              Why Choose Us
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Revolutionizing Food Supply Chains
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We combine cutting-edge technology with transparent processes to build trust across the supply chain.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                whileHover={{ 
                  y: -15, 
                  scale: 1.05,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                }}
                className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden"
              >
                {/* Animated background gradient */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-primary-100/20 via-green-100/20 to-emerald-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  initial={{ scale: 0, rotate: 0 }}
                  whileHover={{ scale: 1, rotate: 5 }}
                  transition={{ duration: 0.5 }}
                />
                
                {/* Floating particles effect */}
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-primary-400 rounded-full opacity-0 group-hover:opacity-60"
                      style={{
                        left: `${20 + i * 30}%`,
                        top: `${20 + i * 20}%`
                      }}
                      animate={{
                        y: [0, -20, 0],
                        opacity: [0, 0.6, 0],
                        scale: [0, 1, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.5
                      }}
                    />
                  ))}
                </div>
                
                <div className="relative z-10">
                  <motion.div 
                    className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, 0]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: index * 0.5
                      }}
                    >
                      <feature.icon className={`w-8 h-8 ${feature.color}`} />
                    </motion.div>
                  </motion.div>
                  
                  <motion.h3 
                    className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors duration-300"
                    whileHover={{ scale: 1.05 }}
                  >
                    {feature.title}
                  </motion.h3>
                  
                  <motion.p 
                    className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300"
                    whileHover={{ scale: 1.02 }}
                  >
                    {feature.description}
                  </motion.p>
                  
                  <motion.div 
                    className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300"
                    whileHover={{ 
                      scale: 1.2, 
                      x: 5,
                      rotate: 15
                    }}
                  >
                    <ArrowRight className={`w-6 h-6 ${feature.color}`} />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features Section */}
      <AdvancedFeatures />

      {/* Stats Section */}
      <StatsSection stats={stats} />

      {/* Testimonials Section */}
      <Testimonials />

      {/* Additional Data Visualization Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-800 text-sm font-medium mb-4">
              <Globe className="w-4 h-4 mr-2" />
              Supply Chain Impact
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Transforming Agriculture
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how Farm2Shelf is making a difference across the agricultural ecosystem
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <h3 className="text-2xl font-semibold text-gray-900">Key Performance Indicators</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-2xl">
                  <div className="text-3xl font-bold text-primary-600 mb-2">
                    <AnimatedCounter value={45} suffix="%" />
                  </div>
                  <p className="text-gray-600">Reduction in food waste</p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-2xl">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    <AnimatedCounter value={40} suffix="%" />
                  </div>
                  <p className="text-gray-600">Increase in farmer income</p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-2xl">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    <AnimatedCounter value={25} suffix=" days" />
                  </div>
                  <p className="text-gray-600">Faster to market</p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-2xl">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    <AnimatedCounter value={75} suffix="%" />
                  </div>
                  <p className="text-gray-600">Supply chain transparency</p>
                </div>
              </div>
              
              <div className="bg-primary-50 p-6 rounded-2xl">
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Verified Sustainability</h4>
                    <p className="text-gray-600">
                      Our partners have reduced carbon emissions by <span className="font-semibold text-primary-600">20%</span> on average through optimized supply chains and AI routing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Market Coverage</h3>
              <div className="bg-gradient-to-br from-primary-600 to-secondary-500 p-6 rounded-2xl text-white">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <div className="text-2xl font-bold"><AnimatedCounter value={28} suffix=" states" /></div>
                    <p className="opacity-80">Across India</p>
                  </div>
                  <MapPin className="w-8 h-8" />
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Northern Region</span>
                    <span className="font-bold">45%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: '45%' }}
                      transition={{ duration: 1 }}
                      viewport={{ once: true }}
                      className="bg-white h-2 rounded-full"
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Southern Region</span>
                    <span className="font-bold">30%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: '30%' }}
                      transition={{ duration: 1, delay: 0.2 }}
                      viewport={{ once: true }}
                      className="bg-white h-2 rounded-full"
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Eastern Region</span>
                    <span className="font-bold">15%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: '15%' }}
                      transition={{ duration: 1, delay: 0.4 }}
                      viewport={{ once: true }}
                      className="bg-white h-2 rounded-full"
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Western Region</span>
                    <span className="font-bold">10%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: '10%' }}
                      transition={{ duration: 1, delay: 0.6 }}
                      viewport={{ once: true }}
                      className="bg-white h-2 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with enhanced background */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMjgiLz48L2c+PC9zdmc+')] opacity-50"></div>
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Ready to Transform Your Food Supply Chain?
            </h2>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Join thousands of farmers, distributors, and retailers who trust Farm2Shelf 
              for transparent, secure, and efficient supply chain management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="group relative inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10">Start Your Journey</span>
                <ArrowRight className="w-5 h-5 ml-2 relative z-10 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/scan"
                className="group relative inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-primary-600 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <QrCode className="w-5 h-5 mr-2 relative z-10" />
                <span className="relative z-10">Try QR Scanner</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
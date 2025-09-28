import { useState, useEffect } from 'react'

import { motion, AnimatePresence } from 'framer-motion'

import { useAuthStore } from '../stores/authStore'

import { useTheme } from '../contexts/ThemeContext'

import { 

  QrCode, 

  Plus, 

  TrendingUp, 

  Package, 

  Users, 

  MapPin,

  ArrowRight,

  Eye,

  DollarSign,

  BarChart3,

  PieChart,

  Activity,

  Star,

  Calendar,

  Clock,

  CheckCircle,

  AlertCircle,

  TrendingDown,

  RefreshCw,

  ChevronDown,

  ChevronUp,

  Search,

  Filter,

  Download,

  Sun,

  Moon,

  Palette,

  Sparkles,

  Zap,

  Target,

  Globe,

  Heart,

  Shield,

  Award,

  Rocket,

  Truck

} from 'lucide-react'

import { Link } from 'react-router-dom'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'

import api from '../services/api'



const DashboardPage = () => {

  const { user } = useAuthStore()

  const { isDarkMode, colorTheme, currentTheme, colorThemes, toggleDarkMode, setTheme } = useTheme()

  const [stats, setStats] = useState({})

  const [recentBatches, setRecentBatches] = useState([])

  const [loading, setLoading] = useState(true)

  const [timeRange, setTimeRange] = useState('monthly')

  const [expandedCards, setExpandedCards] = useState({})

  const [searchQuery, setSearchQuery] = useState('')

  const [activeTab, setActiveTab] = useState('overview')

  const [showThemeSelector, setShowThemeSelector] = useState(false)



  // Using theme context for colors



  // Beautiful mock data with more variety

  const mockStats = {

    totalBatches: 24,

    totalRevenue: 125000,

    activeOrders: 8,

    customerRating: 4.8,

    monthlyGrowth: 23.5,

    completedOrders: 156,

    pendingApprovals: 3,

    totalUsers: 89,

    sustainabilityScore: 87,

    carbonSaved: 1240, // in kg

    waterSaved: 5600, // in liters

    communityImpact: 12 // villages impacted

  }



  const mockBatches = [

    {

      _id: '1',

      crop: 'Organic Tomatoes',

      variety: 'Cherry',

      quantity: 150,

      unit: 'kg',

      farmer: { name: 'Rajesh Kumar' },

      expectedPrice: 85,

      status: 'harvested',

      harvestDate: '2024-01-15',

      origin: { state: 'Maharashtra', district: 'Nashik' },

      qualityScore: 92,

      sustainability: 88

    },

    {

      _id: '2',

      crop: 'Premium Rice',

      variety: 'Basmati',

      quantity: 500,

      unit: 'kg',

      farmer: { name: 'Priya Sharma' },

      expectedPrice: 120,

      status: 'in-transit',

      harvestDate: '2024-01-12',

      origin: { state: 'Punjab', district: 'Amritsar' },

      qualityScore: 96,

      sustainability: 91

    },

    {

      _id: '3',

      crop: 'Fresh Spinach',

      variety: 'Baby',

      quantity: 75,

      unit: 'kg',

      farmer: { name: 'Amit Patel' },

      expectedPrice: 45,

      status: 'sold',

      harvestDate: '2024-01-10',

      origin: { state: 'Gujarat', district: 'Ahmedabad' },

      qualityScore: 89,

      sustainability: 94

    },

    {

      _id: '4',

      crop: 'Organic Wheat',

      variety: 'Durum',

      quantity: 800,

      unit: 'kg',

      farmer: { name: 'Sunita Devi' },

      expectedPrice: 35,

      status: 'processing',

      harvestDate: '2024-01-08',

      origin: { state: 'Haryana', district: 'Karnal' },

      qualityScore: 87,

      sustainability: 90

    },

    {

      _id: '5',

      crop: 'Premium Mangoes',

      variety: 'Alphonso',

      quantity: 200,

      unit: 'kg',

      farmer: { name: 'Vikram Singh' },

      expectedPrice: 180,

      status: 'harvested',

      harvestDate: '2024-01-05',

      origin: { state: 'Maharashtra', district: 'Ratnagiri' },

      qualityScore: 95,

      sustainability: 86

    }

  ]



  // Dynamic chart data based on time range

  const getPriceTrendData = () => {

    if (timeRange === 'weekly') {

      return [

        { day: 'Mon', tomatoes: 78, rice: 112, wheat: 30, mangoes: 170 },

        { day: 'Tue', tomatoes: 80, rice: 115, wheat: 32, mangoes: 172 },

        { day: 'Wed', tomatoes: 82, rice: 118, wheat: 33, mangoes: 175 },

        { day: 'Thu', tomatoes: 85, rice: 120, wheat: 35, mangoes: 178 },

        { day: 'Fri', tomatoes: 87, rice: 122, wheat: 36, mangoes: 180 },

        { day: 'Sat', tomatoes: 90, rice: 125, wheat: 38, mangoes: 185 },

        { day: 'Sun', tomatoes: 88, rice: 123, wheat: 37, mangoes: 182 }

      ]

    } else if (timeRange === 'monthly') {

      return [

        { month: 'Jan', tomatoes: 80, rice: 115, wheat: 32, mangoes: 175 },

        { month: 'Feb', tomatoes: 85, rice: 120, wheat: 35, mangoes: 180 },

        { month: 'Mar', tomatoes: 82, rice: 118, wheat: 33, mangoes: 185 },

        { month: 'Apr', tomatoes: 88, rice: 125, wheat: 36, mangoes: 190 },

        { month: 'May', tomatoes: 90, rice: 130, wheat: 38, mangoes: 195 },

        { month: 'Jun', tomatoes: 87, rice: 128, wheat: 37, mangoes: 200 }

      ]

    } else {

      return [

        { quarter: 'Q1', tomatoes: 82, rice: 118, wheat: 33, mangoes: 180 },

        { quarter: 'Q2', tomatoes: 88, rice: 125, wheat: 36, mangoes: 195 },

        { quarter: 'Q3', tomatoes: 95, rice: 135, wheat: 40, mangoes: 210 },

        { quarter: 'Q4', tomatoes: 92, rice: 130, wheat: 38, mangoes: 205 }

      ]

    }

  }



  const getRevenueData = () => {

    if (timeRange === 'weekly') {

      return [

        { day: 'Mon', revenue: 12000, orders: 8 },

        { day: 'Tue', revenue: 15000, orders: 10 },

        { day: 'Wed', revenue: 18000, orders: 12 },

        { day: 'Thu', revenue: 22000, orders: 14 },

        { day: 'Fri', revenue: 25000, orders: 16 },

        { day: 'Sat', revenue: 28000, orders: 18 },

        { day: 'Sun', revenue: 20000, orders: 13 }

      ]

    } else if (timeRange === 'monthly') {

      return [

        { month: 'Jan', revenue: 45000, orders: 12 },

        { month: 'Feb', revenue: 52000, orders: 15 },

        { month: 'Mar', revenue: 48000, orders: 13 },

        { month: 'Apr', revenue: 61000, orders: 18 },

        { month: 'May', revenue: 68000, orders: 20 },

        { month: 'Jun', revenue: 75000, orders: 22 }

      ]

    } else {

      return [

        { quarter: 'Q1', revenue: 145000, orders: 40 },

        { quarter: 'Q2', revenue: 204000, orders: 60 },

        { quarter: 'Q3', revenue: 235000, orders: 65 },

        { quarter: 'Q4', revenue: 280000, orders: 75 }

      ]

    }

  }



  const cropDistributionData = [

    { name: 'Rice', value: 35, color: '#10B981' },

    { name: 'Wheat', value: 25, color: '#F59E0B' },

    { name: 'Tomatoes', value: 20, color: '#EF4444' },

    { name: 'Mangoes', value: 15, color: '#8B5CF6' },

    { name: 'Others', value: 5, color: '#6B7280' }

  ]



  const sustainabilityData = [

    { subject: 'Water Usage', current: 87, average: 75, fullMark: 100 },

    { subject: 'Carbon Footprint', current: 92, average: 70, fullMark: 100 },

    { subject: 'Soil Health', current: 78, average: 65, fullMark: 100 },

    { subject: 'Biodiversity', current: 85, average: 60, fullMark: 100 },

    { subject: 'Community Impact', current: 90, average: 68, fullMark: 100 }

  ]



  useEffect(() => {

    // Simulate API call

    setTimeout(() => {

      setStats(mockStats)

      setRecentBatches(mockBatches)

      setLoading(false)

    }, 1000)

  }, [])



  const getRoleBasedContent = () => {

    switch (user?.role) {

      case 'farmer':

        return {

          title: 'Mandi Dashboard',

          description: 'Manage your produce batches and track sales',

          quickActions: [

            { name: 'Create New Batch', icon: Plus, href: '/batches/create', color: 'bg-green-500' },

            { name: 'View My Batches', icon: Package, href: '/batches/my', color: 'bg-blue-500' },

            { name: 'Generate QR Code', icon: QrCode, href: '/qr/generate', color: 'bg-purple-500' },

            { name: 'Market Trends', icon: TrendingUp, href: '/trends', color: 'bg-orange-500' }

          ]

        }

      case 'distributor':

        return {

          title: 'Distributor Dashboard',

          description: 'Manage purchases and distribution',

          quickActions: [

            { name: 'Scan QR Code', icon: QrCode, href: '/scan', color: 'bg-green-500' },

            { name: 'View Inventory', icon: Package, href: '/inventory', color: 'bg-blue-500' },

            { name: 'Price Updates', icon: TrendingUp, href: '/prices', color: 'bg-orange-500' },

            { name: 'Supplier Network', icon: Users, href: '/suppliers', color: 'bg-purple-500' }

          ]

        }

      case 'retailer':

        return {

          title: 'Retailer Dashboard',

          description: 'Manage your store and customer interactions',

          quickActions: [

            { name: 'Scan QR Code', icon: QrCode, href: '/scan', color: 'bg-green-500' },

            { name: 'View Inventory', icon: Package, href: '/inventory', color: 'bg-blue-500' },

            { name: 'Customer Reviews', icon: Users, href: '/reviews', color: 'bg-purple-500' },

            { name: 'Sales Reports', icon: BarChart3, href: '/reports', color: 'bg-orange-500' }

          ]

        }

      case 'consumer':

        return {

          title: 'Consumer Dashboard',

          description: 'Track your food purchases and learn about their journey',

          quickActions: [

            { name: 'Scan QR Code', icon: QrCode, href: '/scan', color: 'bg-green-500' },

            { name: 'Purchase History', icon: Package, href: '/purchases', color: 'bg-blue-500' },

            { name: 'Find Local Stores', icon: MapPin, href: '/stores', color: 'bg-orange-500' },

            { name: 'Sustainability Impact', icon: TrendingUp, href: '/impact', color: 'bg-purple-500' }

          ]

        }

      case 'government':

        return {

          title: 'Government Dashboard',

          description: 'Monitor supply chain and ensure compliance',

          quickActions: [

            { name: 'View Reports', icon: TrendingUp, href: '/reports', color: 'bg-green-500' },

            { name: 'Audit Trails', icon: Eye, href: '/audit', color: 'bg-blue-500' },

            { name: 'Price Monitoring', icon: TrendingUp, href: '/prices', color: 'bg-orange-500' },

            { name: 'Compliance Checks', icon: CheckCircle, href: '/compliance', color: 'bg-purple-500' }

          ]

        }

      default:

        return {

          title: 'Dashboard',

          description: 'Welcome to Farm2Shelf',

          quickActions: []

        }

    }

  }



  const toggleCardExpansion = (cardId) => {

    setExpandedCards(prev => ({

      ...prev,

      [cardId]: !prev[cardId]

    }))

  }



  const refreshData = () => {

    setLoading(true)

    setTimeout(() => {

      setLoading(false)

    }, 800)

  }



  const content = getRoleBasedContent()



  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">

        <motion.div

          initial={{ scale: 0.8, opacity: 0 }}

          animate={{ scale: 1, opacity: 1 }}

          className="text-center"

        >

          <div className="animate-spin rounded-full h-32 w-32 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>

          <p className="text-xl text-gray-600 font-medium">Loading your dashboard...</p>

        </motion.div>

      </div>

    )

  }



  return (

    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.background} py-8 transition-all duration-500`}>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Enhanced Header with Theme Controls */}

        <motion.div

          initial={{ opacity: 0, y: -20 }}

          animate={{ opacity: 1, y: 0 }}

          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0"

        >

          <div className="flex-1">

            <motion.h1 

              className={`text-4xl font-bold bg-gradient-to-r ${currentTheme.primary} bg-clip-text text-transparent mb-2`}

              animate={{ 

                backgroundPosition: ["0% center", "100% center", "0% center"]

              }}

              transition={{ 

                duration: 3, 

                repeat: Infinity, 

                ease: "easeInOut" 

              }}

              style={{ backgroundSize: "200% 100%" }}

            >

              {content.title}

            </motion.h1>

            <p className={`text-xl ${currentTheme.textSecondary}`}>

              {content.description}

            </p>

          </div>

          

          {/* Theme Controls */}

          <div className="flex items-center space-x-3">

            {/* Theme Selector */}

            <div className="relative">

              <motion.button

                whileHover={{ scale: 1.05 }}

                whileTap={{ scale: 0.95 }}

                onClick={() => setShowThemeSelector(!showThemeSelector)}

                className={`flex items-center px-4 py-2 ${currentTheme.card} rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ${currentTheme.text} font-medium border border-gray-200`}

              >

                <Palette className="w-5 h-5 mr-2" />

                Theme

                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showThemeSelector ? 'rotate-180' : ''}`} />

              </motion.button>

              

              <AnimatePresence>

                {showThemeSelector && (

                  <motion.div

                    initial={{ opacity: 0, y: -10, scale: 0.95 }}

                    animate={{ opacity: 1, y: 0, scale: 1 }}

                    exit={{ opacity: 0, y: -10, scale: 0.95 }}

                    className={`absolute top-full right-0 mt-2 ${currentTheme.card} rounded-xl shadow-xl border border-gray-200 p-2 z-50`}

                  >

                    {Object.keys(colorThemes).map((theme) => (

                      <button

                        key={theme}

                        onClick={() => {

                          setTheme(theme)

                          setShowThemeSelector(false)

                        }}

                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${

                          colorTheme === theme 

                            ? `bg-gradient-to-r ${currentTheme.primary} text-white` 

                            : `${currentTheme.textSecondary} hover:${currentTheme.text}`

                        }`}

                      >

                        {theme.charAt(0).toUpperCase() + theme.slice(1)}

                      </button>

                    ))}

                  </motion.div>

                )}

              </AnimatePresence>

            </div>

            

            {/* Dark Mode Toggle */}

            <motion.button

              whileHover={{ scale: 1.05 }}

              whileTap={{ scale: 0.95 }}

              onClick={toggleDarkMode}

              className={`flex items-center px-4 py-2 ${currentTheme.card} rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ${currentTheme.text} font-medium border border-gray-200`}

            >

              <AnimatePresence mode="wait">

                {isDarkMode ? (

                  <motion.div

                    key="sun"

                    initial={{ rotate: -90, opacity: 0 }}

                    animate={{ rotate: 0, opacity: 1 }}

                    exit={{ rotate: 90, opacity: 0 }}

                    transition={{ duration: 0.2 }}

                  >

                    <Sun className="w-5 h-5 mr-2 text-yellow-500" />

                  </motion.div>

                ) : (

                  <motion.div

                    key="moon"

                    initial={{ rotate: 90, opacity: 0 }}

                    animate={{ rotate: 0, opacity: 1 }}

                    exit={{ rotate: -90, opacity: 0 }}

                    transition={{ duration: 0.2 }}

                  >

                    <Moon className="w-5 h-5 mr-2 text-blue-500" />

                  </motion.div>

                )}

              </AnimatePresence>

              {isDarkMode ? 'Light' : 'Dark'}

            </motion.button>

            

            {/* Refresh Button */}

            <motion.button

              whileHover={{ scale: 1.05 }}

              whileTap={{ scale: 0.95 }}

              onClick={refreshData}

              className={`flex items-center px-4 py-2 ${currentTheme.card} rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ${currentTheme.text} font-medium border border-gray-200`}

            >

              <motion.div

                animate={{ rotate: loading ? 360 : 0 }}

                transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}

              >

                <RefreshCw className="w-5 h-5 mr-2" />

              </motion.div>

              Refresh

            </motion.button>

          </div>

        </motion.div>



        {/* Enhanced Tab Navigation */}

        <motion.div 

          className={`flex space-x-4 mb-8 ${currentTheme.card} p-2 rounded-2xl shadow-md border border-gray-200`}

          initial={{ opacity: 0, y: 10 }}

          animate={{ opacity: 1, y: 0 }}

          transition={{ delay: 0.1 }}

        >

          {[

            { id: 'overview', label: 'Overview', icon: BarChart3 },

            { id: 'analytics', label: 'Analytics', icon: TrendingUp },

            { id: 'sustainability', label: 'Sustainability', icon: Globe },

            { id: 'reports', label: 'Reports', icon: Download }

          ].map((tab) => (

            <motion.button

              key={tab.id}

              onClick={() => setActiveTab(tab.id)}

              whileHover={{ scale: 1.02 }}

              whileTap={{ scale: 0.98 }}

              className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 ${

                activeTab === tab.id 

                  ? `bg-gradient-to-r ${currentTheme.primary} text-white shadow-lg` 

                  : `${currentTheme.textSecondary} hover:${currentTheme.text} hover:bg-gray-100`

              }`}

            >

              <tab.icon className="w-5 h-5 mr-2" />

              {tab.label}

              {activeTab === tab.id && (

                <motion.div

                  layoutId="activeTab"

                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-xl"

                  initial={false}

                  transition={{ type: "spring", stiffness: 500, damping: 30 }}

                />

              )}

            </motion.button>

          ))}

        </motion.div>



        {/* Enhanced Stats Cards with expandable details */}

        <motion.div

          initial={{ opacity: 0, y: 20 }}

          animate={{ opacity: 1, y: 0 }}

          transition={{ delay: 0.1 }}

          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"

        >

          {[

            { 

              key: 'totalBatches', 

              label: 'Total Batches', 

              value: mockStats.totalBatches, 

              icon: Package, 

              color: 'from-blue-500 to-blue-600', 

              accent: 'from-cyan-400 to-blue-500',

              change: '+12%',

              sparkle: true,

              details: [

                { label: 'Harvested', value: '14 batches', icon: CheckCircle },

                { label: 'In Transit', value: '5 batches', icon: Truck },

                { label: 'Processing', value: '3 batches', icon: Activity },

                { label: 'Sold', value: '2 batches', icon: Award }

              ]

            },

            { 

              key: 'totalRevenue', 

              label: 'Total Revenue', 

              value: `₹${mockStats.totalRevenue.toLocaleString()}`, 

              icon: DollarSign, 

              color: 'from-green-500 to-green-600', 

              accent: 'from-emerald-400 to-green-500',

              change: '+23%',

              sparkle: true,

              details: [

                { label: 'This Month', value: '₹42,500', icon: Calendar },

                { label: 'Avg. Order Value', value: '₹1,240', icon: BarChart3 },

                { label: 'Projected Revenue', value: '₹158,000', icon: TrendingUp }

              ]

            },

            { 

              key: 'activeOrders', 

              label: 'Active Orders', 

              value: mockStats.activeOrders, 

              icon: Activity, 

              color: 'from-purple-500 to-purple-600', 

              accent: 'from-violet-400 to-purple-500',

              change: '+5%',

              sparkle: false,

              details: [

                { label: 'Pending Approval', value: '2 orders', icon: Clock },

                { label: 'In Progress', value: '4 orders', icon: Activity },

                { label: 'Ready for Shipment', value: '2 orders', icon: Truck }

              ]

            },

            { 

              key: 'customerRating', 

              label: 'Rating', 

              value: mockStats.customerRating, 

              icon: Star, 

              color: 'from-yellow-500 to-yellow-600', 

              accent: 'from-amber-400 to-yellow-500',

              change: '+0.2',

              sparkle: true,

              details: [

                { label: '5 Stars', value: '84%', icon: Star },

                { label: '4 Stars', value: '12%', icon: Star },

                { label: '<4 Stars', value: '4%', icon: Star },

                { label: 'Total Reviews', value: '156', icon: Users }

              ]

            }

          ].map((stat, index) => (

            <motion.div

              key={stat.key}

              initial={{ opacity: 0, y: 20, scale: 0.9 }}

              animate={{ opacity: 1, y: 0, scale: 1 }}

              transition={{ delay: 0.1 + index * 0.1, type: "spring", stiffness: 100 }}

              whileHover={{ 

                y: -5, 

                scale: 1.02,

                boxShadow: "0 20px 40px rgba(0,0,0,0.1)"

              }}

              className={`relative overflow-hidden rounded-2xl ${currentTheme.card} shadow-lg hover:shadow-2xl transition-all duration-500 group cursor-pointer border border-gray-200`}

              onClick={() => toggleCardExpansion(stat.key)}

            >

              {/* Animated background gradient */}

              <motion.div 

                className={`absolute inset-0 bg-gradient-to-br ${stat.accent} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}

                initial={{ scale: 0, rotate: 0 }}

                whileHover={{ scale: 1, rotate: 5 }}

                transition={{ duration: 0.5 }}

              />

              

              {/* Floating particles */}

              {stat.sparkle && (

                <div className="absolute inset-0 overflow-hidden">

                  {[...Array(3)].map((_, i) => (

                    <motion.div

                      key={i}

                      className="absolute w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-60"

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

              )}

              

              <div className="relative p-6">

                <div className="flex items-center justify-between mb-4">

                  <motion.div 

                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}

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

                      <stat.icon className="w-7 h-7 text-white" />

                    </motion.div>

                  </motion.div>

                  <div className="text-right">

                    <motion.span 

                      className="text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full flex items-center"

                      whileHover={{ scale: 1.05 }}

                    >

                      <TrendingUp className="w-3 h-3 mr-1" />

                      {stat.change}

                    </motion.span>

                  </div>

                </div>

                <div>

                  <p className={`text-sm font-medium ${currentTheme.textSecondary} mb-1`}>{stat.label}</p>

                  <motion.p 

                    className={`text-3xl font-bold ${currentTheme.text} group-hover:scale-105 transition-transform duration-300`}

                    whileHover={{ scale: 1.05 }}

                  >

                    {stat.value}

                  </motion.p>

                </div>

                

                {/* Expandable details */}

                <AnimatePresence>

                  {expandedCards[stat.key] && (

                    <motion.div 

                      initial={{ opacity: 0, height: 0 }}

                      animate={{ opacity: 1, height: 'auto' }}

                      exit={{ opacity: 0, height: 0 }}

                      className="mt-4 pt-4 border-t border-gray-200"

                    >

                      {stat.details.map((detail, idx) => (

                        <motion.div 

                          key={idx} 

                          className="flex justify-between items-center text-sm mb-3 last:mb-0"

                          initial={{ opacity: 0, x: -20 }}

                          animate={{ opacity: 1, x: 0 }}

                          transition={{ delay: idx * 0.1 }}

                        >

                          <div className="flex items-center">

                            <detail.icon className="w-4 h-4 mr-2 text-gray-500" />

                            <span className={currentTheme.textSecondary}>{detail.label}</span>

                          </div>

                          <span className={`font-medium ${currentTheme.text}`}>{detail.value}</span>

                        </motion.div>

                      ))}

                    </motion.div>

                  )}

                </AnimatePresence>

                

                <motion.div 

                  className="absolute bottom-3 right-3"

                  whileHover={{ scale: 1.2 }}

                >

                  {expandedCards[stat.key] ? (

                    <ChevronUp className="w-4 h-4 text-gray-400" />

                  ) : (

                    <ChevronDown className="w-4 h-4 text-gray-400" />

                  )}

                </motion.div>

              </div>

            </motion.div>

          ))}

        </motion.div>



        {/* Enhanced Time Range Selector */}

        <motion.div 

          className="flex justify-end mb-6"

          initial={{ opacity: 0 }}

          animate={{ opacity: 1 }}

          transition={{ delay: 0.2 }}

        >

          <div className={`${currentTheme.card} rounded-xl shadow-md p-2 flex border border-gray-200`}>

            {[

              { id: 'weekly', label: 'Weekly', icon: Calendar },

              { id: 'monthly', label: 'Monthly', icon: BarChart3 },

              { id: 'quarterly', label: 'Quarterly', icon: TrendingUp }

            ].map((range) => (

              <motion.button

                key={range.id}

                onClick={() => setTimeRange(range.id)}

                whileHover={{ scale: 1.05 }}

                whileTap={{ scale: 0.95 }}

                className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${

                  timeRange === range.id 

                    ? `bg-gradient-to-r ${currentTheme.primary} text-white shadow-md` 

                    : `${currentTheme.textSecondary} hover:${currentTheme.text}`

                }`}

              >

                <range.icon className="w-4 h-4 mr-2" />

                {range.label}

              </motion.button>

            ))}

          </div>

        </motion.div>



        {/* Enhanced Charts Section */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

          {/* Price Trend Chart */}

          <motion.div

            initial={{ opacity: 0, x: -20 }}

            animate={{ opacity: 1, x: 0 }}

            transition={{ delay: 0.2 }}

            className="lg:col-span-2"

          >

            <div className={`${currentTheme.card} rounded-2xl shadow-lg p-6 border border-gray-200`}>

              <div className="flex items-center justify-between mb-6">

                <div className="flex items-center">

                  <motion.div

                    animate={{ rotate: 360 }}

                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}

                    className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mr-3"

                  >

                    <TrendingUp className="w-4 h-4 text-white" />

                  </motion.div>

                  <h2 className={`text-xl font-semibold ${currentTheme.text}`}>Price Trends</h2>

                </div>

                <div className="flex space-x-2">

                  <motion.span 

                    className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full flex items-center"

                    animate={{ scale: [1, 1.05, 1] }}

                    transition={{ duration: 2, repeat: Infinity }}

                  >

                    <Activity className="w-4 h-4 mr-1" /> Live

                  </motion.span>

                </div>

              </div>

              <div className="h-80">

                <ResponsiveContainer width="100%" height="100%">

                  <AreaChart data={getPriceTrendData()}>

                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

                    <XAxis 

                      dataKey={timeRange === 'weekly' ? 'day' : timeRange === 'monthly' ? 'month' : 'quarter'} 

                      stroke="#666" 

                    />

                    <YAxis stroke="#666" />

                    <Tooltip 

                      contentStyle={{ 

                        backgroundColor: 'white', 

                        border: 'none', 

                        borderRadius: '12px',

                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'

                      }} 

                    />

                    <Area type="monotone" dataKey="tomatoes" stackId="1" stroke="#EF4444" fill="url(#colorTomatoes)" />

                    <Area type="monotone" dataKey="rice" stackId="1" stroke="#10B981" fill="url(#colorRice)" />

                    <Area type="monotone" dataKey="wheat" stackId="1" stroke="#F59E0B" fill="url(#colorWheat)" />

                    <Area type="monotone" dataKey="mangoes" stackId="1" stroke="#8B5CF6" fill="url(#colorMangoes)" />

                    <defs>

                      <linearGradient id="colorTomatoes" x1="0" y1="0" x2="0" y2="1">

                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>

                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>

                      </linearGradient>

                      <linearGradient id="colorRice" x1="0" y1="0" x2="0" y2="1">

                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>

                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>

                      </linearGradient>

                      <linearGradient id="colorWheat" x1="0" y1="0" x2="0" y2="1">

                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>

                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>

                      </linearGradient>

                      <linearGradient id="colorMangoes" x1="0" y1="0" x2="0" y2="1">

                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>

                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>

                      </linearGradient>

                    </defs>

                  </AreaChart>

                </ResponsiveContainer>

              </div>

            </div>

          </motion.div>



          {/* Crop Distribution & Sustainability */}

          <motion.div

            initial={{ opacity: 0, x: 20 }}

            animate={{ opacity: 1, x: 0 }}

            transition={{ delay: 0.3 }}

            className="lg:col-span-1 space-y-6"

          >

            {/* Crop Distribution */}

            <div className="bg-white rounded-2xl shadow-lg p-6">

              <h2 className="text-xl font-semibold text-gray-900 mb-6">Crop Distribution</h2>

              <div className="h-64">

                <ResponsiveContainer width="100%" height="100%">

                  <RechartsPieChart>

                    <Pie

                      data={cropDistributionData}

                      cx="50%"

                      cy="50%"

                      innerRadius={60}

                      outerRadius={100}

                      paddingAngle={5}

                      dataKey="value"

                    >

                      {cropDistributionData.map((entry, index) => (

                        <Cell key={`cell-${index}`} fill={entry.color} />

                      ))}

                    </Pie>

                    <Tooltip />

                  </RechartsPieChart>

                </ResponsiveContainer>

              </div>

              <div className="mt-4 space-y-2">

                {cropDistributionData.map((item, index) => (

                  <div key={index} className="flex items-center justify-between">

                    <div className="flex items-center">

                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>

                      <span className="text-sm text-gray-600">{item.name}</span>

                    </div>

                    <span className="text-sm font-medium text-gray-900">{item.value}%</span>

                  </div>

                ))}

              </div>

            </div>



            {/* Sustainability Score */}

            {/* <div className="bg-white rounded-2xl shadow-lg p-6">

              <h2 className="text-xl font-semibold text-gray-900 mb-6">Sustainability Score</h2>

              <div className="h-64">

                <ResponsiveContainer width="100%" height="100%">

                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={sustainabilityData}>

                    <PolarGrid />

                    <PolarAngleAxis dataKey="subject" />

                    <PolarRadiusAxis angle={30} domain={[0, 100]} />

                    <Radar name="Current" dataKey="current" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />

                    <Radar name="Industry Average" dataKey="average" stroke="#6B7280" fill="#6B7280" fillOpacity={0.3} />

                    <Tooltip />

                  </RadarChart>

                </ResponsiveContainer>

              </div>

            </div> */}

          </motion.div>

        </div>



        {/* Revenue & Orders Section - Enhanced */}

<motion.div

  initial={{ opacity: 0, y: 20 }}

  animate={{ opacity: 1, y: 0 }}

  transition={{ delay: 0.6 }}

  className="mb-8"

>

  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

    {/* Header with gradient background */}

    <div className={`bg-gradient-to-r ${currentTheme.primary} p-6 text-white`}>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between">

        <div>

          <h2 className="text-2xl font-bold mb-2">Revenue & Orders Analytics</h2>

          <p className="opacity-90">Track your financial performance and order metrics</p>

        </div>

        <div className="flex items-center space-x-4 mt-4 md:mt-0">

          <div className="text-center">

            <div className="flex items-center justify-center">

              <TrendingUp className="w-5 h-5 mr-1" />

              <span className="text-sm font-medium">+23.5%</span>

            </div>

            <p className="text-xs opacity-80">Growth</p>

          </div>

          <div className="h-6 w-px bg-white bg-opacity-30"></div>

          <div className="text-center">

            <div className="flex items-center justify-center">

              <Calendar className="w-5 h-5 mr-1" />

              <span className="text-sm font-medium">

                {timeRange === 'weekly' ? 'This Week' : timeRange === 'monthly' ? 'This Month' : 'This Quarter'}

              </span>

            </div>

            <p className="text-xs opacity-80">Period</p>

          </div>

        </div>

      </div>

    </div>



    <div className="p-6">

      {/* Key Metrics Cards */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

        <motion.div 

          whileHover={{ scale: 1.02 }}

          className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200"

        >

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-green-600 font-medium">Total Revenue</p>

              <p className="text-2xl font-bold text-green-800">

                ₹{getRevenueData().reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}

              </p>

            </div>

            <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">

              <DollarSign className="w-5 h-5 text-green-700" />

            </div>

          </div>

          <div className="flex items-center mt-2">

            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />

            <span className="text-xs text-green-600">+18.2% from last period</span>

          </div>

        </motion.div>



        <motion.div 

          whileHover={{ scale: 1.02 }}

          className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200"

        >

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-blue-600 font-medium">Total Orders</p>

              <p className="text-2xl font-bold text-blue-800">

                {getRevenueData().reduce((sum, item) => sum + item.orders, 0)}

              </p>

            </div>

            <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">

              <Package className="w-5 h-5 text-blue-700" />

            </div>

          </div>

          <div className="flex items-center mt-2">

            <TrendingUp className="w-4 h-4 text-blue-600 mr-1" />

            <span className="text-xs text-blue-600">+12.7% from last period</span>

          </div>

        </motion.div>



        <motion.div 

          whileHover={{ scale: 1.02 }}

          className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200"

        >

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-purple-600 font-medium">Avg. Order Value</p>

              <p className="text-2xl font-bold text-purple-800">

                ₹{Math.round(getRevenueData().reduce((sum, item) => sum + item.revenue, 0) / getRevenueData().reduce((sum, item) => sum + item.orders, 0))}

              </p>

            </div>

            <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">

              <BarChart3 className="w-5 h-5 text-purple-700" />

            </div>

          </div>

          <div className="flex items-center mt-2">

            <TrendingUp className="w-4 h-4 text-purple-600 mr-1" />

            <span className="text-xs text-purple-600">+4.9% from last period</span>

          </div>

        </motion.div>



        <motion.div 

          whileHover={{ scale: 1.02 }}

          className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200"

        >

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-amber-600 font-medium">Conversion Rate</p>

              <p className="text-2xl font-bold text-amber-800">8.7%</p>

            </div>

            <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center">

              <TrendingUp className="w-5 h-5 text-amber-700" />

            </div>

          </div>

          <div className="flex items-center mt-2">

            <TrendingUp className="w-4 h-4 text-amber-600 mr-1" />

            <span className="text-xs text-amber-600">+2.3% from last period</span>

          </div>

        </motion.div>

      </div>



      {/* Interactive Chart */}

      <div className="bg-gray-50 p-4 rounded-xl mb-6">

        <div className="h-80">

          <ResponsiveContainer width="100%" height="100%">

            <BarChart data={getRevenueData()}>

              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

              <XAxis 

                dataKey={timeRange === 'weekly' ? 'day' : timeRange === 'monthly' ? 'month' : 'quarter'} 

                stroke="#6b7280"

                fontSize={12}

              />

              <YAxis 

                yAxisId="left" 

                stroke="#6b7280"

                fontSize={12}

                tickFormatter={(value) => `₹${value / 1000}k`}

              />

              <YAxis 

                yAxisId="right" 

                orientation="right" 

                stroke="#6b7280"

                fontSize={12}

              />

              <Tooltip 

                contentStyle={{ 

                  backgroundColor: 'white', 

                  border: 'none', 

                  borderRadius: '12px',

                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',

                  padding: '12px'

                }}

                formatter={(value, name) => {

                  if (name === 'revenue') return [`₹${value.toLocaleString()}`, 'Revenue'];

                  return [value, 'Orders'];

                }}

              />

              <defs>

                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">

                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>

                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.2}/>

                </linearGradient>

                <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">

                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>

                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.2}/>

                </linearGradient>

              </defs>

              <Bar 

                yAxisId="left" 

                dataKey="revenue" 

                fill="url(#revenueGradient)" 

                radius={[4, 4, 0, 0]}

                name="Revenue"

              />

              <Line 

                yAxisId="right" 

                type="monotone" 

                dataKey="orders" 

                stroke="url(#ordersGradient)" 

                strokeWidth={3} 

                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}

                activeDot={{ r: 6, fill: '#3B82F6' }}

                name="Orders"

              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>



      {/* Performance Summary */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200">

          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">

            <Star className="w-5 h-5 text-yellow-500 mr-2" />

            Revenue Performance

          </h3>

          <div className="space-y-3">

            <div className="flex justify-between items-center">

              <span className="text-sm text-gray-600">Peak Revenue Day</span>

              <span className="text-sm font-medium text-gray-900">

                {getRevenueData().reduce((max, item) => item.revenue > max.revenue ? item : max, getRevenueData()[0]).month ||

                 getRevenueData().reduce((max, item) => item.revenue > max.revenue ? item : max, getRevenueData()[0]).day ||

                 getRevenueData().reduce((max, item) => item.revenue > max.revenue ? item : max, getRevenueData()[0]).quarter}

              </span>

            </div>

            <div className="flex justify-between items-center">

              <span className="text-sm text-gray-600">Average Daily Revenue</span>

              <span className="text-sm font-medium text-gray-900">

                ₹{Math.round(getRevenueData().reduce((sum, item) => sum + item.revenue, 0) / getRevenueData().length).toLocaleString()}

              </span>

            </div>

            <div className="flex justify-between items-center">

              <span className="text-sm text-gray-600">Revenue Growth</span>

              <span className="text-sm font-medium text-green-600 flex items-center">

                <TrendingUp className="w-4 h-4 mr-1" />

                +23.5%

              </span>

            </div>

          </div>

        </div>



        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200">

          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">

            <Activity className="w-5 h-5 text-blue-500 mr-2" />

            Orders Analysis

          </h3>

          <div className="space-y-3">

            <div className="flex justify-between items-center">

              <span className="text-sm text-gray-600">Peak Orders Day</span>

              <span className="text-sm font-medium text-gray-900">

                {getRevenueData().reduce((max, item) => item.orders > max.orders ? item : max, getRevenueData()[0]).month ||

                 getRevenueData().reduce((max, item) => item.orders > max.orders ? item : max, getRevenueData()[0]).day ||

                 getRevenueData().reduce((max, item) => item.orders > max.orders ? item : max, getRevenueData()[0]).quarter}

              </span>

            </div>

            <div className="flex justify-between items-center">

              <span className="text-sm text-gray-600">Orders per Day Avg.</span>

              <span className="text-sm font-medium text-gray-900">

                {Math.round(getRevenueData().reduce((sum, item) => sum + item.orders, 0) / getRevenueData().length)}

              </span>

            </div>

            <div className="flex justify-between items-center">

              <span className="text-sm text-gray-600">Order Growth</span>

              <span className="text-sm font-medium text-blue-600 flex items-center">

                <TrendingUp className="w-4 h-4 mr-1" />

                +18.2%

              </span>

            </div>

          </div>

        </div>

      </div>



      {/* Quick Insights */}

      <motion.div 

        initial={{ opacity: 0 }}

        animate={{ opacity: 1 }}

        transition={{ delay: 0.8 }}

        className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100"

      >

        <h3 className="text-lg font-semibold text-indigo-900 mb-3 flex items-center">

          <AlertCircle className="w-5 h-5 text-indigo-600 mr-2" />

          Quick Insights

        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="flex items-start">

            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">

              <TrendingUp className="w-4 h-4 text-green-600" />

            </div>

            <div>

              <p className="text-sm font-medium text-gray-900">Revenue trending upward</p>

              <p className="text-xs text-gray-600">23.5% increase from last period</p>

            </div>

          </div>

          <div className="flex items-start">

            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">

              <Package className="w-4 h-4 text-blue-600" />

            </div>

            <div>

              <p className="text-sm font-medium text-gray-900">Order volume stable</p>

              <p className="text-xs text-gray-600">Consistent growth in order count</p>

            </div>

          </div>

          <div className="flex items-start">

            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">

              <DollarSign className="w-4 h-4 text-amber-600" />

            </div>

            <div>

              <p className="text-sm font-medium text-gray-900">Higher AOV</p>

              <p className="text-xs text-gray-600">Average order value increased by 4.9%</p>

            </div>

          </div>

        </div>

      </motion.div>

    </div>

  </div>

</motion.div>



        {/* Progress Indicators */}

        <motion.div

          initial={{ opacity: 0, y: 20 }}

          animate={{ opacity: 1, y: 0 }}

          transition={{ delay: 0.7 }}

          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"

        >

          <div className="bg-white rounded-2xl shadow-lg p-6">

            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Target</h3>

            <div className="space-y-4">

              <div>

                <div className="flex justify-between text-sm text-gray-600 mb-2">

                  <span>Revenue Target</span>

                  <span>85%</span>

                </div>

                <div className="w-full bg-gray-200 rounded-full h-3">

                  <motion.div

                    initial={{ width: 0 }}

                    animate={{ width: "85%" }}

                    transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}

                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full"

                  ></motion.div>

                </div>

              </div>

              <div>

                <div className="flex justify-between text-sm text-gray-600 mb-2">

                  <span>Order Target</span>

                  <span>92%</span>

                </div>

                <div className="w-full bg-gray-200 rounded-full h-3">

                  <motion.div

                    initial={{ width: 0 }}

                    animate={{ width: "92%" }}

                    transition={{ delay: 1.2, duration: 1.5, ease: "easeOut" }}

                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full"

                  ></motion.div>

                </div>

              </div>

              <div>

                <div className="flex justify-between text-sm text-gray-600 mb-2">

                  <span>Sustainability Target</span>

                  <span>78%</span>

                </div>

                <div className="w-full bg-gray-200 rounded-full h-3">

                  <motion.div

                    initial={{ width: 0 }}

                    animate={{ width: "78%" }}

                    transition={{ delay: 1.4, duration: 1.5, ease: "easeOut" }}

                    className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-3 rounded-full"

                  ></motion.div>

                </div>

              </div>

            </div>

          </div>



          <div className="bg-white rounded-2xl shadow-lg p-6">

            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Metrics</h3>

            <div className="space-y-4">

              <div className="flex items-center justify-between">

                <span className="text-sm text-gray-600">Customer Satisfaction</span>

                <div className="flex items-center">

                  <Star className="w-4 h-4 text-yellow-400 fill-current" />

                  <span className="ml-1 text-sm font-medium">4.8/5</span>

                </div>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-sm text-gray-600">Delivery Success</span>

                <span className="text-sm font-medium text-green-600">98.5%</span>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-sm text-gray-600">Freshness Score</span>

                <span className="text-sm font-medium text-blue-600">9.2/10</span>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-sm text-gray-600">Quality Consistency</span>

                <span className="text-sm font-medium text-purple-600">94%</span>

              </div>

            </div>

          </div>



          <div className="bg-white rounded-2xl shadow-lg p-6">

            <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact Metrics</h3>

            <div className="space-y-4">

              <div className="flex items-center justify-between">

                <span className="text-sm text-gray-600">Carbon Saved</span>

                <span className="text-lg font-bold text-green-600">{mockStats.carbonSaved} kg</span>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-sm text-gray-600">Water Saved</span>

                <span className="text-lg font-bold text-blue-600">{mockStats.waterSaved} L</span>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-sm text-gray-600">Communities Impacted</span>

                <span className="text-lg font-bold text-purple-600">{mockStats.communityImpact}</span>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-sm text-gray-600">Sustainability Score</span>

                <span className="text-lg font-bold text-emerald-600">{mockStats.sustainabilityScore}/100</span>

              </div>

            </div>

          </div>

        </motion.div>



        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Quick Actions */}

          <motion.div

            initial={{ opacity: 0, x: -20 }}

            animate={{ opacity: 1, x: 0 }}

            transition={{ delay: 0.4 }}

            className="lg:col-span-1"

          >

            <div className="bg-white rounded-2xl shadow-lg p-6">

              <h2 className="text-xl font-semibold text-gray-900 mb-6">

                Quick Actions

              </h2>

              <div className="space-y-4">

                {content.quickActions.map((action, index) => (

                  <motion.div

                    key={action.name}

                    initial={{ opacity: 0, x: -20 }}

                    animate={{ opacity: 1, x: 0 }}

                    transition={{ delay: 0.4 + index * 0.1 }}

                  >

                    <Link

                      to={action.href}

                      className="group flex items-center p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-gradient-to-r hover:from-primary-50 hover:to-blue-50 transition-all duration-300 hover:shadow-md"

                    >

                      <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>

                        <action.icon className="w-6 h-6 text-white" />

                      </div>

                      <div className="flex-1">

                        <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">

                          {action.name}

                        </h3>

                      </div>

                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all duration-300" />

                    </Link>

                  </motion.div>

                ))}

              </div>

            </div>

          </motion.div>



          {/* Recent Activity */}

          <motion.div

            initial={{ opacity: 0, x: 20 }}

            animate={{ opacity: 1, x: 0 }}

            transition={{ delay: 0.5 }}

            className="lg:col-span-2"

          >

            <div className="bg-white rounded-2xl shadow-lg p-6">

              <div className="flex justify-between items-center mb-6">

                <h2 className="text-xl font-semibold text-gray-900">

                  Recent Batches

                </h2>

                <div className="flex space-x-2">

                  <div className="relative">

                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />

                    <input

                      type="text"

                      placeholder="Search batches..."

                      value={searchQuery}

                      onChange={(e) => setSearchQuery(e.target.value)}

                      className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"

                    />

                  </div>

                  <button className="flex items-center px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">

                    <Filter className="w-5 h-5 mr-2 text-gray-600" />

                    Filter

                  </button>

                  <button className="flex items-center px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">

                    <Download className="w-5 h-5 mr-2 text-gray-600" />

                    Export

                  </button>

                </div>

              </div>

              

              <div className="space-y-4">

                {mockBatches.map((batch, index) => (

                  <motion.div

                    key={batch._id}

                    initial={{ opacity: 0, y: 20 }}

                    animate={{ opacity: 1, y: 0 }}

                    transition={{ delay: 0.5 + index * 0.1 }}

                    className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-300 hover:shadow-md group"

                  >

                    <div className="flex items-center">

                      <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-blue-100 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">

                        <Package className="w-7 h-7 text-primary-600" />

                      </div>

                      <div>

                        <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">

                          {batch.crop} - {batch.variety}

                        </h3>

                        <p className="text-sm text-gray-600">

                          {batch.quantity} {batch.unit} • {batch.farmer?.name}

                        </p>

                        <div className="flex mt-1 space-x-2">

                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">

                            Quality: {batch.qualityScore}%

                          </span>

                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">

                            Sustainability: {batch.sustainability}%

                          </span>

                        </div>

                      </div>

                    </div>

                    <div className="text-right">

                      <p className="font-medium text-gray-900">

                        ₹{batch.expectedPrice}/{batch.unit}

                      </p>

                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${

                        batch.status === 'harvested' ? 'bg-green-100 text-green-800' :

                        batch.status === 'in-transit' ? 'bg-blue-100 text-blue-800' :

                        batch.status === 'sold' ? 'bg-gray-100 text-gray-800' :

                        'bg-yellow-100 text-yellow-800'

                      }`}>

                        {batch.status.replace('-', ' ').toUpperCase()}

                      </span>

                      <p className="text-xs text-gray-500 mt-1">

                        {new Date(batch.harvestDate).toLocaleDateString()}

                      </p>

                    </div>

                  </motion.div>

                ))}

              </div>

            </div>

          </motion.div>

        </div>



        {/* Enhanced Floating Action Button */}

        <motion.div

          initial={{ scale: 0 }}

          animate={{ scale: 1 }}

          transition={{ delay: 1, type: "spring", stiffness: 200 }}

          className="fixed bottom-8 right-8 z-50"

        >

          <Link

            to="/scan"

            className="group relative flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110"

          >

            {/* Pulsing rings */}

            <motion.div

              className="absolute inset-0 rounded-full border-2 border-green-400"

              animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}

              transition={{ duration: 2, repeat: Infinity }}

            />

            <motion.div

              className="absolute inset-0 rounded-full border-2 border-blue-400"

              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}

              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}

            />

            

            {/* Main icon */}

            <motion.div

              animate={{ rotate: 360 }}

              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}

            >

              <QrCode className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" />

            </motion.div>

            

            {/* Shimmer effect */}

            <motion.div

              className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent"

              animate={{ x: ["-100%", "100%"] }}

              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}

            />

          </Link>

        </motion.div>

      </div>

    </div>

  )

}



export default DashboardPage
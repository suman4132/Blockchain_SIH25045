import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  User, 
  Package, 
  Star,
  Truck,
  Shield,
  QrCode
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const BatchDetailsPage = () => {
  const { batchId } = useParams()
  const navigate = useNavigate()
  const [batch, setBatch] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBatchDetails()
  }, [batchId])

  const fetchBatchDetails = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/qr/batch/${batchId}`)
      setBatch(response.data.batch)
      setTransactions(response.data.transactions)
    } catch (error) {
      console.error('Error fetching batch details:', error)
      toast.error('Failed to load batch details')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      'harvested': 'text-green-600 bg-green-100',
      'in-transit': 'text-blue-600 bg-blue-100',
      'at-mandi': 'text-yellow-600 bg-yellow-100',
      'at-retailer': 'text-purple-600 bg-purple-100',
      'sold': 'text-gray-600 bg-gray-100'
    }
    return colors[status] || 'text-gray-600 bg-gray-100'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!batch) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Batch Not Found</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Go Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {batch.crop} - {batch.variety}
              </h1>
              <p className="text-xl text-gray-600">
                Batch ID: {batch.batchId}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(batch.status)}`}>
              {batch.status.replace('-', ' ').toUpperCase()}
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Batch Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Package className="w-6 h-6 mr-2 text-primary-600" />
                Batch Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Crop Type</label>
                    <p className="text-lg font-semibold text-gray-900 capitalize">{batch.crop}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Variety</label>
                    <p className="text-lg font-semibold text-gray-900">{batch.variety}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Quantity</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {batch.quantity} {batch.unit}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Expected Price</label>
                    <p className="text-lg font-semibold text-gray-900">
                      ₹{batch.expectedPrice}/{batch.unit}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Harvest Date</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(batch.harvestDate)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Quality Grade</label>
                    <p className="text-lg font-semibold text-gray-900">
                      Grade {batch.quality.grade}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Transaction History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Truck className="w-6 h-6 mr-2 text-primary-600" />
                Transaction History
              </h2>
              
              {transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((transaction, index) => (
                    <div key={transaction._id} className="border-l-4 border-primary-200 pl-4 py-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="font-semibold text-gray-900 mr-2">
                              {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                              transaction.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {transaction.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <p><strong>From:</strong> {transaction.from.name} ({transaction.from.role})</p>
                              <p><strong>To:</strong> {transaction.to.name} ({transaction.to.role})</p>
                            </div>
                            <div>
                              <p><strong>Quantity:</strong> {transaction.quantity} {transaction.unit}</p>
                              <p><strong>Price:</strong> ₹{transaction.pricePerUnit}/{transaction.unit}</p>
                            </div>
                          </div>
                          
                          <div className="mt-2 text-sm text-gray-500">
                            <p><strong>Date:</strong> {formatDate(transaction.createdAt)}</p>
                            {transaction.location?.address && (
                              <p><strong>Location:</strong> {transaction.location.address}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            ₹{transaction.totalAmount}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No transactions found</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Farmer Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="card"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-primary-600" />
                Farmer Details
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="font-semibold text-gray-900">{batch.farmer.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{batch.farmer.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-gray-900">{batch.farmer.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Rating</label>
                  <div className="flex items-center">
                    <div className="flex text-yellow-400 mr-2">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < Math.floor(batch.farmer.rating) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                      ))}
                    </div>
                    <span className="font-semibold text-gray-900">{batch.farmer.rating}/5</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Trust Score */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="card"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-primary-600" />
                Trust Score
              </h3>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  {batch.trustScore || 0}/5
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div 
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${((batch.trustScore || 0) / 5) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  Based on farmer rating, quality grade, and transaction history
                </p>
              </div>
            </motion.div>

            {/* QR Code */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="card"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <QrCode className="w-5 h-5 mr-2 text-primary-600" />
                QR Code
              </h3>
              
              {batch.qrCode?.imageUrl ? (
                <div className="text-center">
                  <img 
                    src={batch.qrCode.imageUrl} 
                    alt="Batch QR Code" 
                    className="w-32 h-32 mx-auto mb-4"
                  />
                  <p className="text-sm text-gray-600">
                    Scan this QR code to view batch details
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">QR code not generated</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BatchDetailsPage

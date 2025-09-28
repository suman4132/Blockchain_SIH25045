import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../stores/authStore'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit3, 
  Save, 
  X,
  Shield,
  Star
} from 'lucide-react'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    location: {
      latitude: '',
      longitude: ''
    }
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          pincode: user.address?.pincode || ''
        },
        location: {
          latitude: user.location?.coordinates?.[1] || '',
          longitude: user.location?.coordinates?.[0] || ''
        }
      })
    }
  }, [user])

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handlePasswordChange = (e) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await updateProfile(profileData)
      
      if (result.success) {
        toast.success('Profile updated successfully!')
        setIsEditing(false)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      
      if (result.success) {
        toast.success('Password changed successfully!')
        setIsChangingPassword(false)
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getRoleIcon = (role) => {
    const icons = {
      farmer: '🌾',
      distributor: '🚛',
      retailer: '🏪',
      consumer: '🛒',
      government: '🏛️',
      admin: '👑'
    }
    return icons[role] || '👤'
  }

  const getRoleColor = (role) => {
    const colors = {
      farmer: 'bg-green-100 text-green-800',
      distributor: 'bg-blue-100 text-blue-800',
      retailer: 'bg-purple-100 text-purple-800',
      consumer: 'bg-orange-100 text-orange-800',
      government: 'bg-red-100 text-red-800',
      admin: 'bg-gray-100 text-gray-800'
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Profile Settings
          </h1>
          <p className="text-xl text-gray-600">
            Manage your account information and preferences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <User className="w-6 h-6 mr-2 text-primary-600" />
                  Basic Information
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-outline flex items-center"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="btn-outline flex items-center"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      onClick={handleProfileSubmit}
                      disabled={loading}
                      className="btn-primary flex items-center"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="label">
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="label">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={user.email}
                      disabled
                      className="input-field bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be changed
                    </p>
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="label">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                  />
                </div>

                <div>
                  <label className="label">Address</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      name="address.street"
                      type="text"
                      value={profileData.address.street}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      placeholder="Street Address"
                      className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                    />
                    <input
                      name="address.city"
                      type="text"
                      value={profileData.address.city}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      placeholder="City"
                      className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                    />
                    <input
                      name="address.state"
                      type="text"
                      value={profileData.address.state}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      placeholder="State"
                      className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                    />
                    <input
                      name="address.pincode"
                      type="text"
                      value={profileData.address.pincode}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      placeholder="Pincode"
                      className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Location Coordinates (Optional)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      name="location.latitude"
                      type="number"
                      step="any"
                      value={profileData.location.latitude}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      placeholder="Latitude"
                      className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                    />
                    <input
                      name="location.longitude"
                      type="number"
                      step="any"
                      value={profileData.location.longitude}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      placeholder="Longitude"
                      className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                    />
                  </div>
                </div>
              </form>
            </motion.div>

            {/* Change Password */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Shield className="w-6 h-6 mr-2 text-primary-600" />
                  Change Password
                </h2>
                {!isChangingPassword ? (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="btn-outline"
                  >
                    Change Password
                  </button>
                ) : (
                  <button
                    onClick={() => setIsChangingPassword(false)}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {isChangingPassword && (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="label">
                      Current Password
                    </label>
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="label">
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="label">
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="input-field"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full"
                  >
                    {loading ? 'Changing Password...' : 'Change Password'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="card"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Account Summary
              </h3>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">{getRoleIcon(user.role)}</span>
                  </div>
                  <h4 className="font-semibold text-gray-900">{user.name}</h4>
                  <p className="text-gray-600">{user.email}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role:</span>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      user.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Rating:</span>
                    <div className="flex items-center">
                      <div className="flex text-yellow-400 mr-2">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < Math.floor(user.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                        ))}
                      </div>
                      <span className="font-semibold text-gray-900">{user.rating || 0}/5</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="card"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Stats
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Transactions:</span>
                  <span className="font-semibold text-gray-900">{user.totalTransactions || 0}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since:</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('en-IN', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage


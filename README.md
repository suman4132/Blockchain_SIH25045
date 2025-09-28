# Farm2Shelf - Farm-to-Shelf Provenance Platform

A comprehensive MERN stack application that provides transparent farm-to-shelf supply chain tracking with blockchain integration, QR code scanning, and real-time price monitoring.

## 🌟 Features

### Core Functionality
- **Multi-Role System**: Support for farmers, distributors, retailers, consumers, government, and admin
- **QR Code Tracking**: Generate and scan QR codes for complete batch provenance
- **Blockchain Integration**: Immutable records using Ethereum smart contracts
- **Real-time Price Updates**: Live market price monitoring with WebSocket updates
- **Interactive Maps**: Geographic visualization of produce origins and distribution
- **Trust Scoring**: Comprehensive rating system based on multiple factors
- **Transaction Ledger**: Complete audit trail of all batch movements

### User Roles & Capabilities

#### 🌾 Farmers
- Create and manage produce batches
- Generate QR codes for batches
- Upload images and quality certificates
- Track sales history and earnings
- View market prices and trends

#### 🚛 Distributors/Mandi
- Scan QR codes to verify batch origin
- Create purchase transactions
- Log transport and storage conditions
- Monitor inventory and sales
- Access market price data

#### 🏪 Retailers
- Scan batches at point of sale
- Display farm-to-shelf history to customers
- Manage bulk purchases
- Track vendor reputation scores
- Generate customer receipts with provenance

#### 🛒 Consumers
- Scan QR codes to view complete journey
- See farmer details and harvest information
- Compare mandi vs retail prices
- Rate and review products
- Access trust scores and certifications

#### 🏛️ Government/FPO
- Monitor price trends and market data
- Generate compliance reports
- Track subsidy distribution
- Detect fraud and anomalies
- Export data for analysis

#### 👑 Admin
- User management and approval
- System monitoring and analytics
- Generate comprehensive reports
- Manage platform settings
- Monitor blockchain transactions

## 🛠️ Technology Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** for responsive styling
- **Framer Motion** for smooth animations
- **React Router** for navigation
- **Zustand** for state management
- **React Query** for server state
- **Leaflet** for interactive maps
- **ZXing** for QR code scanning
- **Recharts** for data visualization

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Socket.io** for real-time updates
- **Multer** for file uploads
- **Ethers.js** for blockchain integration
- **QRCode** for QR generation
- **PDFKit** for report generation

### Blockchain
- **Solidity** smart contracts
- **Ethereum** testnet integration
- **Hardhat** for development
- **Ethers.js** for Web3 integration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 4.4+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd farm2shelf
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   
   # Install contract dependencies
   cd ../contracts
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Backend environment
   cd backend
   cp env.example .env
   # Edit .env with your configuration
   
   # Frontend environment
   cd ../frontend
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB (if not running)
   mongod
   
   # Seed the database
   cd backend
   npm run seed
   ```

5. **Start Development Servers**
   ```bash
   # From root directory
   npm run dev
   ```

This will start:
- Backend server on http://localhost:5000
- Frontend development server on http://localhost:5173

## 📁 Project Structure

```
farm2shelf/
├── backend/                 # Node.js/Express API
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── services/           # Business logic
│   ├── scripts/            # Database seeds
│   └── server.js           # Entry point
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── stores/         # State management
│   │   ├── services/       # API services
│   │   └── App.jsx         # Main app component
│   └── public/             # Static assets
├── contracts/              # Smart contracts
│   ├── Provenance.sol      # Main contract
│   ├── deploy.js           # Deployment script
│   └── hardhat.config.js   # Hardhat config
└── README.md               # This file
```

## 🔧 Configuration

### Backend Environment Variables
```env
# Database
MONGODB_URI=mongodb://localhost:27017/farm2shelf

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Blockchain
INFURA_API_KEY=your-infura-api-key
PRIVATE_KEY=your-private-key-for-deployment
CONTRACT_ADDRESS=0x... (set after deployment)
```

### Frontend Environment Variables
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Farm2Shelf
VITE_CONTRACT_ADDRESS=0x...
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Replit Deployment

1. **Import to Replit**
   - Create new Replit from GitHub
   - Import this repository

2. **Environment Variables**
   - Set all required environment variables in Replit secrets
   - Add MongoDB Atlas connection string
   - Configure Infura/Alchemy for blockchain

3. **Database Setup**
   ```bash
   npm run seed
   ```

4. **Deploy**
   - Replit will automatically deploy both frontend and backend

### Vercel Deployment (Frontend)

1. **Connect Repository**
   - Connect your GitHub repository to Vercel
   - Set build command: `cd frontend && npm run build`
   - Set output directory: `frontend/dist`

2. **Environment Variables**
   - Add all frontend environment variables

### Heroku Deployment (Backend)

1. **Create Heroku App**
   ```bash
   heroku create farm2shelf-api
   ```

2. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI=your-mongodb-uri
   heroku config:set JWT_SECRET=your-jwt-secret
   # ... other variables
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Batches
- `GET /api/batches` - List batches
- `POST /api/batches` - Create batch
- `GET /api/batches/:id` - Get batch details
- `PUT /api/batches/:id` - Update batch

### QR Codes
- `POST /api/qr/generate` - Generate QR code
- `POST /api/qr/scan` - Scan QR code
- `GET /api/qr/batch/:batchId` - Get batch by QR

### Transactions
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/:id` - Get transaction details

### Admin
- `GET /api/admin/dashboard` - Dashboard data
- `GET /api/admin/reports/export` - Export data
- `PUT /api/users/:id/approve` - Approve user

## 🔐 Smart Contract

### Deployment
```bash
cd contracts
npm run compile
npm run deploy:goerli
```

### Contract Functions
- `registerBatch(bytes32 batchId, string metadataHash)` - Register new batch
- `createTransaction(...)` - Create transaction
- `getBatch(bytes32 batchId)` - Get batch details
- `getBatchHistory(bytes32 batchId)` - Get transaction history

## 📊 Demo Accounts

The seed script creates demo accounts for testing:

- **Farmer**: rajesh@farmer.com / password123
- **Distributor**: amit@distributor.com / password123
- **Retailer**: priya@retailer.com / password123
- **Consumer**: suresh@consumer.com / password123
- **Government**: meera@gov.com / password123
- **Admin**: admin@farm2shelf.com / admin123

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@farm2shelf.com or create an issue in the repository.

## 🔮 Roadmap

- [ ] Mobile app (React Native)
- [ ] IoT sensor integration
- [ ] Machine learning for fraud detection
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Integration with payment gateways
- [ ] Carbon footprint tracking

---

Built with ❤️ for transparent and sustainable food supply chains.



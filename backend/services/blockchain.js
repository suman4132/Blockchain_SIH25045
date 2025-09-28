const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

class BlockchainService {
  constructor() {
    this.provider = null;
    this.contract = null;
    this.wallet = null;
    this.contractAddress = process.env.CONTRACT_ADDRESS;
    this.initialize();
  }

  async initialize() {
    try {
      if (!process.env.INFURA_API_KEY || !process.env.PRIVATE_KEY) {
        console.warn('Blockchain service not initialized: Missing environment variables');
        return;
      }

      // Connect to Goerli testnet
      this.provider = new ethers.JsonRpcProvider(
        `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`
      );

      // Create wallet
      this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);

      // Load contract ABI
      const contractPath = path.join(__dirname, '../../contracts/artifacts/contracts/Provenance.sol/Provenance.json');
      
      if (fs.existsSync(contractPath)) {
        const contractArtifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
        
        if (this.contractAddress) {
          this.contract = new ethers.Contract(
            this.contractAddress,
            contractArtifact.abi,
            this.wallet
          );
          console.log('Blockchain service initialized with contract:', this.contractAddress);
        } else {
          console.warn('Contract address not found. Please deploy the contract first.');
        }
      } else {
        console.warn('Contract ABI not found. Please compile the contracts first.');
      }
    } catch (error) {
      console.error('Failed to initialize blockchain service:', error.message);
    }
  }

  async registerBatch(batchId, metadataHash) {
    try {
      if (!this.contract) {
        throw new Error('Blockchain service not initialized');
      }

      const tx = await this.contract.registerBatch(batchId, metadataHash);
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Failed to register batch on blockchain:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async createTransaction(batchId, from, to, quantity, price) {
    try {
      if (!this.contract) {
        throw new Error('Blockchain service not initialized');
      }

      const tx = await this.contract.createTransaction(
        batchId,
        from,
        to,
        ethers.parseEther(quantity.toString()),
        ethers.parseEther(price.toString())
      );
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Failed to create transaction on blockchain:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getBatchDetails(batchId) {
    try {
      if (!this.contract) {
        throw new Error('Blockchain service not initialized');
      }

      const batch = await this.contract.getBatch(batchId);
      return {
        success: true,
        batch: {
          batchId: batch.batchId,
          metadataHash: batch.metadataHash,
          farmer: batch.farmer,
          timestamp: new Date(parseInt(batch.timestamp) * 1000)
        }
      };
    } catch (error) {
      console.error('Failed to get batch details from blockchain:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getBatchHistory(batchId) {
    try {
      if (!this.contract) {
        throw new Error('Blockchain service not initialized');
      }

      const transactions = await this.contract.getBatchHistory(batchId);
      return {
        success: true,
        transactions: transactions.map(tx => ({
          transactionId: tx.transactionId,
          batchId: tx.batchId,
          from: tx.from,
          to: tx.to,
          quantity: ethers.formatEther(tx.quantity),
          price: ethers.formatEther(tx.price),
          timestamp: new Date(parseInt(tx.timestamp) * 1000)
        }))
      };
    } catch (error) {
      console.error('Failed to get batch history from blockchain:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async verifyBatch(batchId) {
    try {
      if (!this.contract) {
        throw new Error('Blockchain service not initialized');
      }

      const exists = await this.contract.batchExists(batchId);
      return {
        success: true,
        exists
      };
    } catch (error) {
      console.error('Failed to verify batch on blockchain:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getContractStats() {
    try {
      if (!this.contract) {
        throw new Error('Blockchain service not initialized');
      }

      const stats = await this.contract.getStats();
      return {
        success: true,
        stats: {
          totalBatches: stats[0].toString(),
          totalTransactions: stats[1].toString()
        }
      };
    } catch (error) {
      console.error('Failed to get contract stats:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Helper method to convert string to bytes32
  stringToBytes32(str) {
    return ethers.keccak256(ethers.toUtf8Bytes(str));
  }

  // Helper method to generate metadata hash (simplified)
  generateMetadataHash(batchData) {
    const metadataString = JSON.stringify(batchData);
    return ethers.keccak256(ethers.toUtf8Bytes(metadataString));
  }

  // Check if blockchain service is available
  isAvailable() {
    return this.contract !== null && this.wallet !== null;
  }

  // Get wallet address
  getWalletAddress() {
    return this.wallet ? this.wallet.address : null;
  }

  // Get contract address
  getContractAddress() {
    return this.contractAddress;
  }
}

module.exports = new BlockchainService();



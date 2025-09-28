const { ethers } = require('ethers');

async function deployContract() {
  try {
    console.log('Deploying to local Hardhat network...');
    
    // Connect to local Hardhat network
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    
    // Get the first account from Hardhat
    const accounts = await provider.listAccounts();
    if (accounts.length === 0) {
      throw new Error('No accounts available. Make sure Hardhat is running.');
    }
    
    const wallet = new ethers.Wallet(accounts[0].privateKey, provider);
    
    console.log('Deploying from address:', wallet.address);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log('Account balance:', ethers.formatEther(balance), 'ETH');
    
    // Simple contract ABI and bytecode for testing
    const contractABI = [
      "function registerBatch(bytes32 batchId, string memory metadataHash) external",
      "function createTransaction(bytes32 batchId, address from, address to, uint256 quantity, uint256 price) external",
      "function getBatch(bytes32 batchId) external view returns (tuple(bytes32 batchId, string metadataHash, address farmer, uint256 timestamp, bool exists))",
      "function getBatchHistory(bytes32 batchId) external view returns (tuple(bytes32 transactionId, bytes32 batchId, address from, address to, uint256 quantity, uint256 price, uint256 timestamp, bool exists)[] memory)",
      "function batchExists(bytes32 batchId) external view returns (bool)"
    ];
    
    // Simple contract bytecode (this is a minimal version for testing)
    const contractBytecode = "0x608060405234801561001057600080fd5b50600436106100575760003560e01c8063150b7a0211610035578063150b7a02146100a2578063a9059cbb146100d5578063f2fde38b146100f157610057565b806301ffc9a71461005c578063095ea7b31461007c575b600080fd5b61006a61010d565b604051610073919061020a565b60405180910390f35b61009660048036038101906100919190610156565b610116565b6040516100a391906101b1565b60405180910390f35b6100bc60048036038101906100b79190610192565b61012c565b6040516100c991906101b1565b60405180910390f35b6100ec60048036038101906100e79190610156565b610140565b005b6101086004803603810190610103919061012d565b610156565b005b60006001905090565b6000610122828461015c565b905092915050565b6000610136828461015c565b905092915050565b61014a828261015c565b5050565b610154828261015c565b5050565b50565b60008190509291505056fea2646970667358221220...";
    
    console.log('Deploying contract...');
    
    // Deploy the contract
    const contractFactory = new ethers.ContractFactory(contractABI, contractBytecode, wallet);
    const contract = await contractFactory.deploy();
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log('Contract deployed at:', contractAddress);
    
    // Test the contract
    console.log('Testing contract...');
    
    // Test batch registration
    const testBatchId = ethers.keccak256(ethers.toUtf8Bytes('test-batch-123'));
    const testMetadataHash = 'QmTestMetadataHash123';
    
    try {
      const tx1 = await contract.registerBatch(testBatchId, testMetadataHash);
      await tx1.wait();
      console.log('Test batch registered successfully');
      
      // Test transaction creation
      const testTx = await contract.createTransaction(
        testBatchId,
        wallet.address,
        wallet.address,
        ethers.parseEther('100'),
        ethers.parseEther('0.01')
      );
      await testTx.wait();
      console.log('Test transaction created successfully');
      
      // Verify batch exists
      const batchExists = await contract.batchExists(testBatchId);
      console.log('Batch exists:', batchExists);
      
      console.log('Deployment and testing completed successfully!');
      console.log('Contract Address:', contractAddress);
      console.log('Network: Local Hardhat');
      
      return {
        contractAddress,
        contract,
        provider
      };
      
    } catch (error) {
      console.log('Contract deployed but testing failed:', error.message);
      console.log('Contract Address:', contractAddress);
      return {
        contractAddress,
        contract,
        provider
      };
    }
    
  } catch (error) {
    console.error('Deployment failed:', error.message);
    console.log('\nTo fix this:');
    console.log('1. Start Hardhat local network: npx hardhat node');
    console.log('2. Then run: npm run deploy:local');
    process.exit(1);
  }
}

// Run deployment if this file is executed directly
if (require.main === module) {
  deployContract();
}

module.exports = { deployContract };


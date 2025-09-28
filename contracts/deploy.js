const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function deployContract() {
  try {
    // Load environment variables
    require('dotenv').config();

    // Check for required environment variables
    if (!process.env.INFURA_API_KEY || !process.env.PRIVATE_KEY) {
      throw new Error('Missing required environment variables: INFURA_API_KEY, PRIVATE_KEY');
    }

    // Connect to Goerli testnet
    const provider = new ethers.JsonRpcProvider(`https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`);
    
    // Create wallet from private key
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log('Deploying from address:', wallet.address);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log('Account balance:', ethers.formatEther(balance), 'ETH');
    
    if (balance < ethers.parseEther('0.01')) {
      throw new Error('Insufficient balance for deployment. Please add some Goerli ETH to your account.');
    }

    // Read the compiled contract
    const contractPath = path.join(__dirname, 'artifacts', 'contracts', 'Provenance.sol', 'Provenance.json');
    
    if (!fs.existsSync(contractPath)) {
      throw new Error('Contract not compiled. Please run: npx hardhat compile');
    }

    const contractArtifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
    const contractFactory = new ethers.ContractFactory(
      contractArtifact.abi,
      contractArtifact.bytecode,
      wallet
    );

    console.log('Deploying contract...');
    
    // Deploy the contract
    const contract = await contractFactory.deploy();
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log('Contract deployed at:', contractAddress);
    
    // Save contract address to .env file
    const envPath = path.join(__dirname, '..', 'backend', '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add contract address
    if (envContent.includes('CONTRACT_ADDRESS=')) {
      envContent = envContent.replace(
        /CONTRACT_ADDRESS=.*/,
        `CONTRACT_ADDRESS=${contractAddress}`
      );
    } else {
      envContent += `\nCONTRACT_ADDRESS=${contractAddress}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('Contract address saved to .env file');
    
    // Test the contract
    console.log('Testing contract...');
    
    // Test batch registration
    const testBatchId = ethers.keccak256(ethers.toUtf8Bytes('test-batch-123'));
    const testMetadataHash = 'QmTestMetadataHash123';
    
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
    
    // Get batch details
    const batch = await contract.getBatch(testBatchId);
    console.log('Batch details:', {
      batchId: batch.batchId,
      farmer: batch.farmer,
      metadataHash: batch.metadataHash
    });
    
    console.log('Deployment and testing completed successfully!');
    console.log('Contract Address:', contractAddress);
    console.log('Network: Goerli Testnet');
    
    return {
      contractAddress,
      contract,
      provider
    };
    
  } catch (error) {
    console.error('Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run deployment if this file is executed directly
if (require.main === module) {
  deployContract();
}

module.exports = { deployContract };



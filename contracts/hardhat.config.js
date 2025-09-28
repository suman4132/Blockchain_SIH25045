require("@nomicfoundation/hardhat-toolbox");

// Load environment variables, but don't fail if .env doesn't exist
try {
  require("dotenv").config();
} catch (error) {
  console.log("No .env file found, using defaults for local development");
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: (process.env.PRIVATE_KEY && process.env.PRIVATE_KEY !== 'your-private-key-for-deployment' && process.env.PRIVATE_KEY.length === 66) ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 20000000000, // 20 gwei
      gas: 6000000
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: (process.env.PRIVATE_KEY && process.env.PRIVATE_KEY !== 'your-private-key-for-deployment' && process.env.PRIVATE_KEY.length === 66) ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 20000000000, // 20 gwei
      gas: 6000000
    }
  },
  paths: {
    sources: "./",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};


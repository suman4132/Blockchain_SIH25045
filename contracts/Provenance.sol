// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Provenance {
    struct Batch {
        bytes32 batchId;
        string metadataHash;
        address farmer;
        uint256 timestamp;
        bool exists;
    }

    struct Transaction {
        bytes32 transactionId;
        bytes32 batchId;
        address from;
        address to;
        uint256 quantity;
        uint256 price;
        uint256 timestamp;
        bool exists;
    }

    mapping(bytes32 => Batch) public batches;
    mapping(bytes32 => Transaction) public transactions;
    mapping(bytes32 => bytes32[]) public batchTransactions;

    address public owner;
    uint256 public transactionCounter;

    event BatchRegistered(bytes32 indexed batchId, address indexed farmer, string metadataHash);
    event TransactionCreated(
        bytes32 indexed transactionId,
        bytes32 indexed batchId,
        address indexed from,
        address to,
        uint256 quantity,
        uint256 price
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Register a new produce batch
     * @param batchId Unique identifier for the batch
     * @param metadataHash IPFS hash of batch metadata
     */
    function registerBatch(bytes32 batchId, string memory metadataHash) external {
        require(!batches[batchId].exists, "Batch already exists");
        require(bytes(metadataHash).length > 0, "Metadata hash cannot be empty");

        batches[batchId] = Batch({
            batchId: batchId,
            metadataHash: metadataHash,
            farmer: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });

        emit BatchRegistered(batchId, msg.sender, metadataHash);
    }

    /**
     * @dev Create a transaction for a batch
     * @param batchId The batch being transacted
     * @param from Sender address
     * @param to Recipient address
     * @param quantity Amount being transacted
     * @param price Price per unit
     */
    function createTransaction(
        bytes32 batchId,
        address from,
        address to,
        uint256 quantity,
        uint256 price
    ) external {
        require(batches[batchId].exists, "Batch does not exist");
        require(from != address(0), "Invalid from address");
        require(to != address(0), "Invalid to address");
        require(quantity > 0, "Quantity must be greater than 0");
        require(price > 0, "Price must be greater than 0");

        bytes32 transactionId = keccak256(
            abi.encodePacked(
                batchId,
                from,
                to,
                quantity,
                price,
                block.timestamp,
                transactionCounter
            )
        );

        transactions[transactionId] = Transaction({
            transactionId: transactionId,
            batchId: batchId,
            from: from,
            to: to,
            quantity: quantity,
            price: price,
            timestamp: block.timestamp,
            exists: true
        });

        batchTransactions[batchId].push(transactionId);
        transactionCounter++;

        emit TransactionCreated(transactionId, batchId, from, to, quantity, price);
    }

    /**
     * @dev Get batch details
     * @param batchId The batch ID
     * @return Batch details
     */
    function getBatch(bytes32 batchId) external view returns (Batch memory) {
        require(batches[batchId].exists, "Batch does not exist");
        return batches[batchId];
    }

    /**
     * @dev Get transaction details
     * @param transactionId The transaction ID
     * @return Transaction details
     */
    function getTransaction(bytes32 transactionId) external view returns (Transaction memory) {
        require(transactions[transactionId].exists, "Transaction does not exist");
        return transactions[transactionId];
    }

    /**
     * @dev Get all transactions for a batch
     * @param batchId The batch ID
     * @return Array of transaction IDs
     */
    function getBatchTransactions(bytes32 batchId) external view returns (bytes32[] memory) {
        require(batches[batchId].exists, "Batch does not exist");
        return batchTransactions[batchId];
    }

    /**
     * @dev Get transaction history for a batch with details
     * @param batchId The batch ID
     * @return Array of transaction details
     */
    function getBatchHistory(bytes32 batchId) external view returns (Transaction[] memory) {
        require(batches[batchId].exists, "Batch does not exist");
        
        bytes32[] memory transactionIds = batchTransactions[batchId];
        Transaction[] memory history = new Transaction[](transactionIds.length);
        
        for (uint256 i = 0; i < transactionIds.length; i++) {
            history[i] = transactions[transactionIds[i]];
        }
        
        return history;
    }

    /**
     * @dev Get total number of transactions for a batch
     * @param batchId The batch ID
     * @return Number of transactions
     */
    function getBatchTransactionCount(bytes32 batchId) external view returns (uint256) {
        require(batches[batchId].exists, "Batch does not exist");
        return batchTransactions[batchId].length;
    }

    /**
     * @dev Verify if a batch exists
     * @param batchId The batch ID
     * @return True if batch exists
     */
    function batchExists(bytes32 batchId) external view returns (bool) {
        return batches[batchId].exists;
    }

    /**
     * @dev Verify if a transaction exists
     * @param transactionId The transaction ID
     * @return True if transaction exists
     */
    function transactionExists(bytes32 transactionId) external view returns (bool) {
        return transactions[transactionId].exists;
    }

    /**
     * @dev Get contract statistics
     * @return Total batches and transactions
     */
    function getStats() external view returns (uint256 totalBatches, uint256 totalTransactions) {
        // Note: This is a simplified implementation
        // In a production environment, you'd want to track these counts
        return (0, transactionCounter);
    }

    /**
     * @dev Emergency function to pause contract (only owner)
     */
    function emergencyPause() external onlyOwner {
        // Implementation for emergency pause if needed
        // This would require additional state variables and modifiers
    }
}



# EHR Management DApp

## Introduction
The **EHR Management** decentralized application (dApp) aims to provide a secure and transparent way to manage electronic health records using blockchain technology. It allows patients to register themselves and healthcare providers to add and view patient records in a decentralized and tamper-resistant manner. This system ensures data integrity and privacy by utilizing Ethereum smart contracts and can be deployed on the Ethereum network using Hardhat.

## Primary Functions
- **Patient Registration**: Enables the registration of patients with their details such as name and Ethereum address. Each patient is given a unique ID.
- **Add Record**: Allows authorized users (healthcare providers) to add health records associated with a registered patient. Each record is timestamped and linked to the healthcare provider's address.
- **View Records**: Provides functionality to view all records associated with a specific patient.
- **Balance Management**: Users can deposit and withdraw funds to/from the smart contract. This feature can be used to manage payments for accessing certain records or services.
- **Ownership and Security**: The contract is deployed by the owner who initializes the balance, and only registered patients and authorized providers can interact with their records.

## Contract Explanation

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

contract EHRManagement {
    address payable public owner;
    uint256 public contractBalance;
    uint256 public patientCount;

    struct Patient {
        uint256 id;
        string name;
        address patientAddress;
        bool isRegistered;
    }

    struct Record {
        uint256 id;
        uint256 patientId;
        string recordData;
        address addedBy;
        uint256 timestamp;
    }

    mapping(address => uint256) public userBalances;
    mapping(uint256 => Patient) public patients;
    mapping(uint256 => Record[]) public records;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event PatientRegistered(uint256 indexed patientId, address indexed patientAddress);
    event RecordAdded(uint256 indexed patientId, uint256 indexed recordId, address indexed provider);
    event ProviderAuthorized(address indexed provider);
    event ProviderRevoked(address indexed provider);

    constructor(uint256 initBalance) payable {
        owner = payable(msg.sender);
        contractBalance = initBalance;
    }

    function registerPatient(string memory name, address patientAddress) external {
        patientCount++;
        patients[patientCount] = Patient({
            id: patientCount,
            name: name,
            patientAddress: patientAddress,
            isRegistered: true
        });

        emit PatientRegistered(patientCount, patientAddress);
    }

    function addRecord(uint256 patientId, string memory recordData) external {
        require(patients[patientId].isRegistered, "Patient is not registered.");
        
        Record memory newRecord = Record({
            id: records[patientId].length,
            patientId: patientId,
            recordData: recordData,
            addedBy: msg.sender,
            timestamp: block.timestamp
        });

        records[patientId].push(newRecord);

        emit RecordAdded(patientId, newRecord.id, msg.sender);
    }

    function getPatientRecords(uint256 patientId) external view returns (Record[] memory) {
        return records[patientId];
    }

    function getPatientDetails(uint256 patientId) external view returns (string memory, address) {
        Patient memory patient = patients[patientId];
        return (patient.name, patient.patientAddress);
    }

    function getContractBalance() public view returns (uint256){
        return contractBalance;
    }

    function deposit(uint256 _amount) public payable {
        require(_amount >= 0, "Incorrect Ether amount sent");
        
        userBalances[msg.sender] += _amount;
        contractBalance += _amount;
        emit Deposit(msg.sender, _amount);
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(userBalances[msg.sender] >= _withdrawAmount, "Insufficient balance to withdraw");

        uint _previousBalance = userBalances[msg.sender];
        userBalances[msg.sender] -= _withdrawAmount;
        contractBalance -= _withdrawAmount;

        (bool success, ) = msg.sender.call{value: _withdrawAmount}("");
        require(success, "Failed to send Ether");

        assert(userBalances[msg.sender] == (_previousBalance - _withdrawAmount));
        emit Withdraw(msg.sender, _withdrawAmount);
    }
}
```
The core contract is written in Solidity and includes the following key components:

- **Structs**:
  - `Patient`: Stores patient details including their ID, name, address, and registration status.
  - `Record`: Stores details of each record, including the patient ID, record data, the provider who added it, and the timestamp.
  
- **Mappings**:
  - `userBalances`: Tracks balances for each user's deposits.
  - `patients`: Maps patient IDs to their details.
  - `records`: Maps patient IDs to an array of their records, allowing for multiple records per patient.

- **Events**:
  - `Deposit` and `Withdraw`: Emit events when users deposit or withdraw funds.
  - `PatientRegistered`: Logs patient registration events.
  - `RecordAdded`: Logs when a new record is added for a patient.
  - `ProviderAuthorized` and `ProviderRevoked`: Track the authorization status of providers.

- **Key Functions**:
  - `registerPatient`: Registers a new patient.
  - `addRecord`: Adds a new record for a registered patient.
  - `getPatientRecords`: Fetches all records for a given patient.
  - `getPatientDetails`: Retrieves patient details like name and address.
  - `deposit` and `withdraw`: Handle the deposit and withdrawal of funds.
  - `getContractBalance`: Returns the contract's balance.

## Hardhat Commands
To interact with the smart contract using Hardhat, you can use the following commands:

- **Compile the contract**:
    ```bash
    npx hardhat compile
    ```

- **Deploy the contract**:
    Create a deployment script (e.g., `deploy.js` in `scripts/`) and use:
    ```bash
    npx hardhat run scripts/deploy.js --network <network-name>
    ```

    Make sure to replace `<network-name>` with the name of the network where you want to deploy (e.g., `localhost` or `goerli`).

## Benefits of the EHR Management DApp
- **Data Integrity**: All records and patient details are stored on the blockchain, ensuring data cannot be tampered with or altered by unauthorized parties.
- **Decentralization**: Removes reliance on centralized databases, reducing the risk of data breaches and providing greater transparency in healthcare data management.
- **Security**: By utilizing Ethereum smart contracts, the system ensures that sensitive patient data remains secure, accessible only by authorized individuals.
- **Transparency**: Logs all transactions and interactions with the contract, allowing for complete transparency and auditability of record additions and patient registration.
- **Easy Payments**: Integrated deposit and withdrawal functions allow for seamless handling of payments for access to records, making it easier for healthcare providers and patients to manage fees.

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


    function registerPatient(string memory name, address patientAddress) external  {
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

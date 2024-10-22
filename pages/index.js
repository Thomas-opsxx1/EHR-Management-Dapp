import { useState, useEffect } from "react";
import { ethers } from "ethers";
import ehr_abi from "../artifacts/contracts/EHRManagement.sol/EHRManagement.json";

export default function EHRPage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [ehrContract, setEhrContract] = useState(undefined);
  const [contractBalance, setContractBalance] = useState(undefined);
  const [patientCount, setPatientCount] = useState(undefined);
  const [patientId, setPatientId] = useState("1");
  const [patientName, setPatientName] = useState("");
  const [recordData, setRecordData] = useState("");
  const [records, setRecords] = useState([]);
  const [depositAmount, setDepositAmount] = useState("0");
  const [withdrawAmount, setWithdrawAmount] = useState("0");

  const contractAddress = "Deploy-Smart-Contract-Address";
  const ehrABI = ehr_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);
    getEHRContract();
  };

  const getEHRContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, ehrABI, signer);
    setEhrContract(contract);
  };

  const getContractBalance = async () => {
    if (ehrContract) {
      const balance = await ehrContract.getContractBalance();
      setContractBalance(ethers.utils.formatEther(balance));
    }
  };

  const registerPatient = async () => {
    if (ehrContract && patientName) {
      try {
        let tx = await ehrContract.registerPatient(patientName, account);
        await tx.wait();
        alert(`Patient ${patientName} registered successfully!`);
        setPatientName("");
        getPatientCount();
      } catch (error) {
        console.error("Patient Registration Error:", error);
      }
    }
  };

  const addRecord = async () => {
    if (ehrContract && patientId && recordData) {
      try {
        let tx = await ehrContract.addRecord(Number(patientId), recordData);
        await tx.wait();
        alert(`Record added for Patient ID ${patientId}!`);
        setRecordData("");
        getPatientRecords();
      } catch (error) {
        console.error("Record Addition Error:", error);
      }
    }
  };

  const getPatientRecords = async () => {
    if (ehrContract && patientId) {
      try {
        const patientRecords = await ehrContract.getPatientRecords(Number(patientId));
        setRecords(patientRecords);
      } catch (error) {
        console.error("Get Records Error:", error);
      }
    }
  };

  const deposit = async () => {
    if (ehrContract && depositAmount > 0) {
      try {
        const tx = await ehrContract.deposit(ethers.utils.parseEther(depositAmount), {
          value: ethers.utils.parseEther(depositAmount),
        });
        await tx.wait();
        alert("Successfully deposited ETH!");
        getContractBalance();
      } catch (error) {
        console.error("Deposit Error:", error);
      }
    }
  };

  const withdraw = async () => {
    if (ehrContract && withdrawAmount > 0) {
      try {
        const tx = await ehrContract.withdraw(ethers.utils.parseEther(withdrawAmount));
        await tx.wait();
        alert("Successfully withdrew ETH!");
        getContractBalance();
      } catch (error) {
        console.error("Withdraw Error:", error);
      }
    }
  };

  const getPatientCount = async () => {
    if (ehrContract) {
      try {
        const count = await ehrContract.patientCount();
        setPatientCount(count.toString());
      } catch (error) {
        console.error("Get Patient Count Error:", error);
      }
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask to use this app.</p>;
    }

    if (!account) {
      return <button className="button connect-button" onClick={connectAccount}>Connect MetaMask Wallet</button>;
    }

    if (contractBalance === undefined) {
      getContractBalance();
    }

    if (patientCount === undefined) {
      getPatientCount();
    }

    return (
      <div className="content">
        <p>Your Account: <strong>{account}</strong></p>
        <p>Contract Balance: <strong>{contractBalance || "0"} ETH</strong></p>
        <p>Total Registered Patients: <strong>{patientCount || "Loading..."}</strong></p>

        <div className="form-container">
          <h3>Register Patient</h3>
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="Patient Name"
          />
          <button className="button" onClick={registerPatient}>Register Patient</button>
        </div>

        <div className="form-container">
          <h3>Add Record</h3>
          <input
            type="text"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value.replace(/^0+/, ""))}
            placeholder="Patient ID"
          />
          <textarea
            value={recordData}
            onChange={(e) => setRecordData(e.target.value)}
            placeholder="Record Data"
          />
          <button className="button" onClick={addRecord}>Add Record</button>
        </div>

        <div className="form-container">
          <h3>Patient Records</h3>
          <button className="button" onClick={getPatientRecords}>Get Records for Patient ID {patientId}</button>
          {records.length > 0 ? (
            records.map((record, index) => (
              <div key={index} className="record-card">
                <p>Record ID: {record.id.toString()}</p>
                <p>Data: {record.recordData}</p>
                <p>Timestamp: {new Date(record.timestamp.toNumber() * 1000).toLocaleString()}</p>
                <p>Added By: {record.addedBy}</p>
              </div>
            ))
          ) : (
            <p>No records found for this patient.</p>
          )}
        </div>

        <div className="form-container">
          <h3>Manage ETH</h3>
          <input
            type="text"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value.replace(/^0+/, ""))}
            placeholder="Amount to Deposit"
          />
          <button className="button" onClick={deposit}>Deposit ETH</button>
          <input
            type="text"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value.replace(/^0+/, ""))}
            placeholder="Amount to Withdraw"
          />
          <button className="button" onClick={withdraw}>Withdraw ETH</button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1 className="title">EHR Management System</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Arial', sans-serif;
          color: #333;
          background-color: #f9f9f9;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .title {
          text-align: center;
          color: #0070f3;
        }
        .content {
          margin-top: 20px;
        }
        .form-container {
          margin-bottom: 20px;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background-color: #fff;
        }
        input[type="text"], textarea {
          width: 100%;
          padding: 10px;
          margin-bottom: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .button {
          background-color: #0070f3;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .button:hover {
          background-color: #005bb5;
        }
        .record-card {
          background-color: #e9f5ff;
          padding: 10px;
          border-radius: 5px;
          margin-bottom: 10px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        @media (max-width: 600px) {
          .container {
            padding: 10px;
          }
          .button {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}

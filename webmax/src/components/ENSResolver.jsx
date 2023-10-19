import React, { useState } from 'react';
import Blockchain from '../utils/main'; 
import './ENSResolver.css'

const styles = {
  button: {
    margin: "10px",
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  blockNumber: {
    marginTop: "20px",
    fontSize: "18px",
  }
};

const EnsResolver = () => {
  const [ensName, setEnsName] = useState('');
  const [privateKey, setPrivateKey] = useState('');


const ethers = require("ethers");
  
  const blockchain = new Blockchain("https://goerli.infura.io/v3/7e0349ac80744375934bcf0ae67a9a9c");

  const [blockNumber, setBlockNumber] = useState(null);

  const handlePrivateKeyChange = (event) => {
    setPrivateKey(event.target.value);
  };

  const handleWalletSelection = async () => {
    await blockchain.walletSelection();
  };

  const handleConnectWallet = async () => {
    await blockchain.connectWallet(privateKey);
  };

  const handleGetBlockNumber = async () => {
    const number = await blockchain.getBlockNumber();
    setBlockNumber(number);
  };

  async function resolveENS(ensName, provider) {
    try {
      const address = await provider.resolveName(ensName);
      if (address) {
        console.log(`ENS Resolved Address: ${address}`);
        return address;
      } else {
        alert('Unable to resolve ENS name.');
        return null;
      }
    } catch (error) {
      alert('Error resolving ENS name.');
      console.error(error);
      return null;
    }
  }

  const handleEnsNameChange = (event) => {
    setEnsName(event.target.value);
  };

  const connectWalletWithEns = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const resolvedAddress = await resolveENS(ensName, provider);
    
    if (resolvedAddress) {
      alert('Wallet connected successfully using ENS!');
    }
  };
  

  return (
    <div className="container">


     <div style={{ padding: "50px" }}>


     <h1>ENS Maxy</h1>

      <button onClick={handleWalletSelection} style={styles.button}>Select Wallet</button>
      <div style={{ margin: "20px 10px" , width: "100%"}}>
      <input 
            type="text" 
            id="privateKey" 
            value={privateKey} 
            onChange={handlePrivateKeyChange} 
            placeholder="Enter your private key to connect wallet (optional)" 
       />
      </div>
      <button onClick={handleConnectWallet} style={styles.button}>Connect Wallet</button>

      <div style={{ margin: "20px 10px" , width: "100%"}}>
        <input 
          type="text" 
          id="ensName" 
          value={ensName} 
          onChange={handleEnsNameChange} 
          placeholder="Enter your ENS name" 
        />
      </div>

      <button onClick={connectWalletWithEns} style={styles.button}>Connect with ENS</button>

      <button onClick={handleGetBlockNumber} style={styles.button}>Get Block Number</button>

      {blockNumber && <div style={styles.blockNumber}>
        Current Block Number: {blockNumber}
      </div>}
    </div>
      
    </div>
  );
};

export default EnsResolver;

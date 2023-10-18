import React, { useState } from 'react';
import Blockchain from '../utils/main'; 
import './ENSResolver.css'

const EnsResolver = () => {
  const [inputEnsName, setInputEnsName] = useState('');
  const [ensName, setEnsName] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [walletPreference, setWalletPreference] = useState('');
  const [balance, setBalance] = useState('');
  const [wallet, setWallet] = useState(null);
  const [ensAddress, setEnsAddress] = useState('');
  
  const blockchain = new Blockchain("https://goerli.infura.io/v3/7e0349ac80744375934bcf0ae67a9a9c");

  const registerNewWallet = async () => {
    await blockchain.registerNewWallet();
    setWallet(blockchain.wallet);
  };

  const resolveEnsNameHandler = async () => {
    const address = await blockchain.resolveEnsName(inputEnsName);
    setEnsAddress(address || 'ENS name not found');
  };

  const getBalanceByEnsHandler = async () => {
    const balance = await blockchain.getBalanceByEns(ensName);
    setBalance(balance.toString());
  };

  const getEnsByAddressHandler = async () => {
    const ens = await blockchain.getEnsByAddress(wallet?.address);
    setEnsName(ens || 'Address does not resolve to any ENS name');
  };

  const handleWalletSelection = async () => {
    await blockchain.walletSelection();
  };

  const handleConnectWallet = async () => {
    await blockchain.connectWallet(privateKey);
  };

  const handleSaveWalletPreference = async () => {
    await blockchain.saveWalletPreference(ensName, walletPreference);
  };

  const handleGetWalletPreference = async () => {
    const preference = await blockchain.getWalletPreference(ensName);
    alert(`Wallet Preference for ${ensName}: ${preference}`);
  };

  const handleGetBalanceFromEns = async () => {
    const balance = await blockchain.getBalanceByEns(ensName);
    setBalance(balance.toString());
  };

  return (
    <div className="container">
      <h1>ENS Resolver</h1>
      
      <button onClick={handleWalletSelection}>Select Wallet</button>

      <div>
        <input 
          type="text" 
          value={inputEnsName} 
          onChange={(e) => setInputEnsName(e.target.value)} 
          placeholder="Type ENS name here" 
        />
        <button onClick={resolveEnsNameHandler}>Resolve ENS Name</button>
      </div>
      <p>Resolved Address: {ensAddress}</p>
      
      <div>
        <input 
          placeholder="Private Key" 
          value={privateKey} 
          onChange={(e) => setPrivateKey(e.target.value)} 
        />
        <button onClick={handleConnectWallet}>Connect Wallet</button>
      </div>
      
      <div>
        <input 
          placeholder="ENS Name" 
          value={ensName} 
          onChange={(e) => setEnsName(e.target.value)} 
        />
        <input 
          placeholder="Wallet Preference" 
          value={walletPreference} 
          onChange={(e) => setWalletPreference(e.target.value)} 
        />
        <button onClick={handleSaveWalletPreference}>Save Wallet Preference</button>
      </div>
      
      <button onClick={handleGetWalletPreference}>Get Wallet Preference</button>
      
      <button onClick={handleGetBalanceFromEns}>Get Balance from ENS</button>
      {balance && <p>Balance: {balance}</p>}

      <button onClick={registerNewWallet}>Register New Wallet</button>
      {wallet && (
        <div>
          <p>Wallet Address: {wallet.address}</p>
          <p>Private Key: {wallet.privateKey}</p>
        </div>
      )}

      <button onClick={getBalanceByEnsHandler}>Get Balance by ENS</button>
      <p>Balance: {balance}</p>

      <button onClick={getEnsByAddressHandler}>Get ENS by Address</button>
      <p>ENS Name: {ensName}</p>
      
    </div>
  );
};

export default EnsResolver;

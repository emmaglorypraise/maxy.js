// import ethers from 'ethers';
// import * as ethers from 'ethers';
import { ethers } from 'ethers';
// const { ethers } = require("ethers");


 export class Blockchain {
  constructor(providerUrl) {
    // Checks if the provider URL is provided.
    if (!providerUrl) {
      throw new Error('Provider URL is required.');
    }

    // Creates an Ethereum JSON-RPC provider using the provided provider URL.
    this.provider = new ethers.JsonRpcProvider(providerUrl);

    this.wallets = {}; // Store custom wallets
    this.currentWallet = null; // Active wallet
  }

  async connectWallet(walletName) {
    if (this.wallets[walletName]) {
        this.currentWallet = this.wallets[walletName];
        console.log(`Connected to ${walletName}`);
    } else {
        throw new Error('Wallet not found');
    }
}

// Register a custom wallet
registerWallet(walletName, walletInstance) {
  this.wallets[walletName] = walletInstance;
  console.log(`${walletName} registered`);
}

// ENS resolution before executing functions
async resolveEnsName(ensName) {
  if (!this.currentWallet) throw new Error('Wallet not connected');
  const address = await this.currentWallet.provider.resolveName(ensName);
  return address;
}


  async getBlockNumber() {
    const response = await this.provider.send("eth_blockNumber");

    return parseInt(response.result, 16);
  }

  // Resolve an ENS name to an Ethereum address.
  async resolveEnsName(ensName) {
    const address = await this.provider.resolveName(ensName);

    return address;
  }

  // Get the balance of an account using an ENS name.
  async getBalance(address) {
    // Get the balance of the Ethereum address.
    const balance = await this.provider.getBalance(address);

    return balance;
  }

  // Example function using resolved ENS name
//   async getBalance(ensOrAddress) {
//     if (!this.currentWallet) throw new Error('Wallet not connected');

//     let address = ensOrAddress;
//     if (address.includes('.eth')) {
//         address = await this.resolveEnsName(ensOrAddress);
//     }

//     const balance = await this.currentWallet.provider.getBalance(address);
//     return ethers.utils.formatEther(balance);
// }
  // Get the balance of an account using an ENS name.
  async getBalanceByEns(ensName) {
    // Resolve the ENS name to an Ethereum address.
    const address = await this.resolveEnsName(ensName);

    // Get the balance of the Ethereum address.
    const balance = await this.provider.getBalance(address);

    return balance;
  }

  // Get the ENS name of of an address.
  async getEnsByAddress(address) {
    // Get the ENS name of an Ethereum address.
    const ens = await this.provider.lookupAddress(address);

    return ens;
  }

  // Display a modal to choose a wallet - simplistic text-based version
  chooseWallet() {
    console.log('Choose a wallet:');
    for (const wallet in this.wallets) {
        console.log(wallet);
    }
    // Here you might want to implement interaction to choose a wallet
}
  
}


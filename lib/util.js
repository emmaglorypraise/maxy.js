import { ethers } from '../node_modules/ethers';
// const { ethers } = require("ethers");

class Blockchain {
  constructor(providerUrl) {
    // Checks if the provider URL is provided.
    if (!providerUrl) {
      throw new Error('Provider URL is required.');
    }

    // Creates an Ethereum JSON-RPC provider using the provided provider URL.
    this.provider = new ethers.JsonRpcProvider(providerUrl);
  }

  // connectWallet(privateKey) {
  //   this.wallet = new ethers.Wallet(privateKey, this.provider);
  // }

  async connectWallet() {
    if (window.ethereum) {
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } catch (error) {
        console.error("User denied account access");
      }
    } else {
      console.log('Non-Ethereum browser detected. Consider installing MetaMask!');
    }
  }

  // Function to display a custom wallet modal (Assuming you have a UI for it)
  displayWalletModal() {
    // Logic to display your custom wallet modal goes here
    // Depending on your UI framework, it could be showing a popup, dialog, etc.
  }

// Function to read from a smart contract
async readFromContract(functionName, ...args) {
  if (this.contract) {
      try {
          const data = await this.contract[functionName](...args);
          return data;
      } catch (error) {
          console.error("Error reading from contract:", error);
      }
  } else {
      console.error("Contract is not connected");
  }
}

// Function to write to a smart contract
async writeToContract(functionName, ...args) {
  if (this.contract && this.provider.getSigner()) {
      try {
          const tx = await this.contract.connect(this.provider.getSigner())[functionName](...args);
          await tx.wait();
          console.log('Transaction sent:', tx.hash);
      } catch (error) {
          console.error("Error writing to contract:", error);
      }
  } else {
      console.error("Wallet or contract is not connected properly");
  }
}

  // Function to register a new wallet (it creates a new wallet instance)
  registerNewWallet() {
    this.wallet = ethers.Wallet.createRandom();
    console.log('Wallet Address:', this.wallet.address);
  }

  async sendEther(address, amount) {
    const transaction = await this.wallet.sendTransaction({
      to: address,
      value: ethers.utils.parseEther(amount.toString())
    });
    return transaction;
  }

  async deployContract(abi, bytecode, ...args) {
    const factory = new ethers.ContractFactory(abi, bytecode, this.wallet);
    const contract = await factory.deploy(...args);
    await contract.deployed();
    return contract;
  }

  // Essential Function: Contract interaction (calling functions)
  async callContractFunction(contractAddress, abi, functionName, ...args) {
    const contract = new ethers.Contract(contractAddress, abi, this.wallet);
    const result = await contract[functionName](...args);
    return result;
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

  async getGasPrice() {
    const gasPrice = await this.provider.getGasPrice();
    return ethers.utils.formatUnits(gasPrice, 'gwei');
  }

  async getTransactionCount(address) {
    return await this.provider.getTransactionCount(address);
  }

  // Minor Function: Fetching Transaction Receipt
  async getTransactionReceipt(transactionHash) {
    return await this.provider.getTransactionReceipt(transactionHash);
  }

  async getTokenBalance(contractAddress, abi, address) {
    const contract = new ethers.Contract(contractAddress, abi, this.provider);
    const balance = await contract.balanceOf(address);
    return ethers.utils.formatUnits(balance, 18); // assuming 18 decimal places
  }

  // Minor Function: Sign a message
  signMessage(message) {
    return this.wallet.signMessage(message);
  }

  // Minor Function: Verify a signature
  verifySignature(message, signature) {
    return ethers.utils.verifyMessage(message, signature);
  }
}

export default Blockchain
// import { ethers } from 'ethers';
const ethers = require("ethers");

class Blockchain {
  wallets = ['bananawallet', 'metamask', 'walletconnect']; 

  constructor(providerUrl) {
    if (!providerUrl) {
      throw new Error('Provider URL is required.');
    }

    this.provider = new ethers.JsonRpcProvider(providerUrl);
    this.wallet = null;
  }

  async walletSelection() {
    const modal = document.createElement('div');
    const walletListHTML = this.wallets.map(wallet =>
      `<li style="margin: 10px; cursor: pointer;" onmouseover="this.style.backgroundColor='#007bff'; this.style.color='#FFFFFF';" onmouseout="this.style.backgroundColor=''; this.style.color='';" onclick="savePreference('${wallet}'); this.style.backgroundColor='#007bff'; this.style.color='#FFFFFF'; closeModal();">${wallet}</li>`
    ).join('');

    modal.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center;">
        <div style="background-color: white; padding: 20px; border-radius: 10px; text-align: center;">
          <h2>Select Your Preferred Wallet</h2>
          <ul id="walletList" style="list-style-type: none; padding: 0;">
            ${walletListHTML}
          </ul>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    window.savePreference = function (wallet) {
      localStorage.setItem('preferredWallet', wallet);
      alert('Preference saved!');
    }
    window.closeModal = function () {
      document.body.removeChild(modal);
    }
  }

  async connectWallet(privateKey = null) {
    const preferredWallet = localStorage.getItem('preferredWallet');

    switch (preferredWallet) {
      case 'metamask':
        let signer = null;

        let provider;
        if (window.ethereum == null) {
          console.log("MetaMask not installed; using read-only defaults")
          provider = ethers.getDefaultProvider()

        } else {
          provider = new ethers.BrowserProvider(window.ethereum)
          signer = await provider.getSigner();
          console.log("signer", signer);
          alert('Metawallet connected successfully!');
        }
        break;

      case 'bananawallet':
        if (privateKey) {
          this.wallet = new ethers.Wallet(privateKey, this.provider);
          console.log(`Banana wallet connected! Address: ${this.wallet.address}, Private Key: ${privateKey}`);
          alert("Banana wallet connected with provided private key!");
        } else {
          this.wallet = ethers.Wallet.createRandom();
          console.log(`Banana wallet connected with a new random private key! Address: ${this.wallet.address}, Private Key: ${this.wallet.privateKey}`);
          alert("Banana wallet connected with a new random private key!");
        }
        break;

      case 'walletconnect':
        alert('WalletConnect functionality is not implemented yet.');
        break;


      case 'customWalletWithPrivateKey':
        this.provider = new ethers.providers.JsonRpcProvider('YOUR_CUSTOM_WALLET_PROVIDER_URL');
        if (privateKey) {
          try {
            this.wallet = new ethers.Wallet(privateKey, this.provider);
          } catch (error) {
            alert("Error creating wallet with private key:", error);
          }
        } else {
          alert('Connecting to custom wallet without a private key');
        }
        break;

      default:
        alert("No preferred wallet found or the wallet is not supported.");
    }
  }

  async saveWalletPreference(ensName, walletPreference) {
    if (ensName && walletPreference) {
      localStorage.setItem(ensName, walletPreference);
      alert("Wallet preference saved.");
    } else {
      alert("ENS name and wallet preference are required.");
    }
  }

  async getWalletPreference(ensName) {
    const walletPreference = localStorage.getItem(ensName);
    if (walletPreference) {
      return walletPreference;
    } else {
      alert("No wallet preference found for this ENS name.");
      return null;
    }
  }

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

  async callContractFunction(contractAddress, abi, functionName, ...args) {
    const contract = new ethers.Contract(contractAddress, abi, this.wallet);
    const result = await contract[functionName](...args);
    return result;
  }

  async getBlockNumber() {
    const response = await this.provider.send("eth_blockNumber");
    return parseInt(response.result, 16);
  }

  async resolveEnsName(ensName) {
    const address = await this.provider.resolveName(ensName);
    return address;
  }

  async getBalance(address) {
    const balance = await this.provider.getBalance(address);
    return balance;
  }

  async getBalanceByEns(ensName) {
    const address = await this.resolveEnsName(ensName);
    const balance = await this.provider.getBalance(address);
    return balance;
  }

  async getEnsByAddress(address) {
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

  async getTransactionReceipt(transactionHash) {
    return await this.provider.getTransactionReceipt(transactionHash);
  }

  async getTokenBalance(contractAddress, abi, address) {
    const contract = new ethers.Contract(contractAddress, abi, this.provider);
    const balance = await contract.balanceOf(address);
    return ethers.utils.formatUnits(balance, 18); 
  }

  signMessage(message) {
    return this.wallet.signMessage(message);
  }

  verifySignature(message, signature) {
    return ethers.utils.verifyMessage(message, signature);
  }

  setContract(contract) {
    this.contract = contract;
  }
}

export default Blockchain
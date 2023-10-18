// import { ethers } from 'ethers';
const ethers = require("ethers");

class Blockchain {
  constructor(providerUrl) {
    if (!providerUrl) {
      throw new Error('Provider URL is required.');
    }

    this.provider = new ethers.JsonRpcProvider(providerUrl);
    this.wallet = null;
  }

  async walletSelection() {
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center;">
        <div style="background-color: white; padding: 20px; border-radius: 10px; text-align: center;">
          <h2>Select Your Preferred Wallet</h2>
          <select id="walletSelector">
            <option value="banana">Banana wallet</option>
            <option value="metamask">MetaMask</option>
            <option value="walletConnect">WalletConnect</option>
            <!-- Add more wallets here -->
          </select>
          <button onclick="savePreference(); closeModal();">Save Preference</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    window.savePreference = function () {
      const selector = document.getElementById('walletSelector');
      const selectedWallet = selector.options[selector.selectedIndex].value;
      localStorage.setItem('preferredWallet', selectedWallet);
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
        if (window.ethereum) {
          this.provider = new ethers.BrowserProvider(window.ethereum);
          this.wallet = this.provider.getSigner();
          try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
          } catch (error) {
            alert("User denied account access");
          }
        } else {
          alert('Non-Ethereum browser detected. Consider installing MetaMask!');
        }
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
            // If no private key is provided, you might want to handle connections differently.
            // This will depend on your specific requirements and wallet API.
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
    return ethers.utils.formatUnits(balance, 18); // assuming 18 decimal places
  }

  signMessage(message) {
    return this.wallet.signMessage(message);
  }

  verifySignature(message, signature) {
    return ethers.utils.verifyMessage(message, signature);
  }
}

export default Blockchain
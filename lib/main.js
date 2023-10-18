import { Blockchain } from './util.js'

const blockchain = new Blockchain("https://goerli.infura.io/v3/7e0349ac80744375934bcf0ae67a9a9c");

// Get the current block number
const blockNumber = await blockchain.getBlockNumber();
console.log("getBlockNumber", blockNumber);

// Get the balance of an account
const balance = await blockchain.getBalance('0xE26B30aB0bdaf3f187A76BC831408167f4184113');
console.log("balance", balance);
// ("0x1caF4b3FB450e4e8900F4aC6F84A5FcB905494f1");

const address = await blockchain.resolveEnsName('goerli.eth');
console.log('address', address);

const ENSBalance = await blockchain.getBalanceByEns("goerli.eth");
console.log('ENSBalance', ENSBalance);

const getEnsByAddress = await blockchain.getEnsByAddress("0xE26B30aB0bdaf3f187A76BC831408167f4184113");
console.log("getEnsByAddress", getEnsByAddress)



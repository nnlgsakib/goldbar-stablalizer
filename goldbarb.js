const Web3 = require('web3');
const axios = require('axios');

const CONTRACT_ABI = require('./abi.json'); // import the ABI JSON file
const CONTRACT_ADDRESS = '0x1Bdb65c43bB546198fA9576325721eae7B5884bA'; // address of the contract
const OWNER_ADDRESS = '0x0A1bA9481507648Ed2bffA92731519030Cd89308'; // address of the owner account
const PRIVATE_KEY = '0x825b935d2b3a6287b54a4e5f31e8d1ac383b02a5cecf040b114b34707a475a3b'; // private key of the owner account

async function fetchPaxGoldPrice() {
  const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=pax-gold&vs_currencies=usd');
  const data = response.data;
  return data['pax-gold']['usd'];
}

async function main() {
  console.log('Starting main...');
  const web3 = new Web3('https://data-seed-prebsc-1-s3.binance.org:8545/'); // or your own provider URL
  console.log('Web3 initialized...');
  const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
  console.log('Contract instance created...');

  while (true) {
    const paxGoldPrice = await fetchPaxGoldPrice();
    console.log(`PAX Gold price: $${paxGoldPrice}`);

    const priceInWei = web3.utils.toWei(paxGoldPrice.toString());
    console.log(`Price in Wei: ${priceInWei}`);

    console.log(`Calling setPrice function with address ${OWNER_ADDRESS}...`);
    const nonce = await web3.eth.getTransactionCount(OWNER_ADDRESS);
    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = 300000; // adjust the gas limit according to your needs
    const txParams = {
      from: OWNER_ADDRESS,
      to: CONTRACT_ADDRESS,
      gasPrice: gasPrice,
      gasLimit: gasLimit,
      nonce: nonce,
      data: contract.methods.setPrice(priceInWei).encodeABI()
    };
    const signedTx = await web3.eth.accounts.signTransaction(txParams, PRIVATE_KEY);
    const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('Transaction receipt:', txReceipt);
    console.log('Token price set to PAX Gold price');

    await new Promise(resolve => setTimeout(resolve, 60000)); // wait for 1 minute before fetching the price again
  }
}

main().catch(console.error);

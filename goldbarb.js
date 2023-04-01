const Web3 = require('web3');
const axios = require('axios');

const CONTRACT_ABI = require('./abi.json'); // import the ABI JSON file
const CONTRACT_ADDRESS = '0x566189880aCa09BA7aA696D9b6630A4Eb2Bb043f'; 
const OWNER_ADDRESS = '0xf3036c8A9772652865001AAfcbc4EE52A44b2614'; 
const PRIVATE_KEY = ''; 

async function fetchPaxGoldPrice() {
  const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=pax-gold&vs_currencies=usd');
  const data = response.data;
  return data['pax-gold']['usd'];
}

async function main() {
  console.log('Starting main...');
  const web3 = new Web3('https://data-seed-prebsc-1-s3.binance.org:8545/'); 
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

    await new Promise(resolve => setTimeout(resolve, 60000)); 
  }
}

main().catch(console.error);

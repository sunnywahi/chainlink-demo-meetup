const {ethers} = require('ethers');
require('dotenv').config();
const {getSigner} = require('../utils.js');
const OracleApi = require('../../artifacts/@chainlink/contracts/src/v0.6/Oracle.sol/Oracle.json');
const gasConstants = require('../../gas.json');

async function main(){

    let contractAddress = "0xd8A207C172131DeDCD6B1cA83d16C5EAb3439A8b";
    let signer = await getSigner("kovan", "cppEBH89lm7jjbzf517LDcWpKfbjVooz");
    let oracleContract = await new ethers.Contract(contractAddress, OracleApi.abi, signer);

    await oracleContract.setFulfillmentPermission("0x03107f34B0EFc1274EeEbDd4E268A3B93388D5B2", true, {gasLimit: 100000});

    console.log(`node is added to oracle`)

}

main().then(() => process.exit(0))
    .catch((err) => {
        console.log(err);
        process.exit(1);
    })

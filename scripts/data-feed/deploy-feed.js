const {ethers} = require('ethers');
require('dotenv').config();
const {readApplicationJson, writeApplicationJson, getSigner, deployUsingEthers} = require('../utils.js');
const FluxAggregator = require('../../artifacts/@chainlink/contracts/src/v0.6/FluxAggregator.sol/FluxAggregator.json');
const AggregatorProxy = require('../../artifacts/@chainlink/contracts/src/v0.7/dev/AggregatorProxy.sol/AggregatorProxy.json');
const PriceFeedConsumer = require('../../artifacts/contracts/PriceFeedConsumer.sol/PriceFeedConsumer.json');
const {networkConfig} = require("../../helper-hardhat-config");
const gasConstants = require('../../gas.json');

async function main() {
    //here deploy the contract the FluxAggregator
    //Then deploy the AggregatorProxy
    //Then the price feedConsumer
    const appData = readApplicationJson();
    const networkConf = networkConfig[42];
    let networkName = networkConf["name"];

    console.log(`deploying the feed contracts for FluxAggregator and AggregatorProxy`);

    if (!appData.contracts[networkName]["fluxAggregatorAddress"]) {
        appData.contracts[networkName]["fluxAggregatorAddress"] = {};
    }

    if (!appData.contracts[networkName]["aggregatorProxyAddress"]) {
        appData.contracts[networkName]["aggregatorProxyAddress"] = {};
    }

    const signer = await getSigner(networkName, networkConf["apiKey"]);

    // FluxAggregator
    const validatorAddress = '0x0000000000000000000000000000000000000000';
    //link payment
    const paymentAmount = ethers.utils.parseUnits('1', 'gwei');
    const timeout = '10';
    const minSubmissionValue = '1000';
    const maxSubmissionValue = '5000000000000000';
    const decimals = '8'
    const description = 'testHederaAccounts';

    let fluxAggregatorAddress = await deployUsingEthers(FluxAggregator, signer, networkConf["linkToken"], paymentAmount, timeout, validatorAddress, minSubmissionValue, maxSubmissionValue, decimals, description, {gasLimit: gasConstants.deployGasLimt})
    appData.contracts[networkName]["fluxAggregatorAddress"] = fluxAggregatorAddress;

    let aggregatorProxyAddress = await deployUsingEthers(AggregatorProxy, signer, fluxAggregatorAddress, {gasLimit: gasConstants.aggregatorProxyDeployLimit});
    appData.contracts[networkName]["aggregatorProxyAddress"] = aggregatorProxyAddress;

    let priceFeedConsumerAddress = await deployUsingEthers(PriceFeedConsumer, signer, aggregatorProxyAddress, {gasLimit: gasConstants.feedConsumerDeployLimit});
    appData.contracts[networkName]["contractAddress"] = priceFeedConsumerAddress;

    console.log(`all flux aggregator contracts are deployed`);
    writeApplicationJson(appData);
}


main().then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(-1);
    });

import { SearchIcon, QrcodeIcon, LinkIcon, XCircleIcon, CheckCircleIcon } from '@heroicons/react/solid'
import { useState, useRef, Fragment } from 'react';
import { toast } from 'react-toastify';
import erc20Abi from '../abis/erc20.json';
import poolAbi from '../abis/pool.json';
import quoterAbi from '../abis/quoter.json';
import swapRouterAbi from '../abis/swapRouter.json';
import uniswapV3Abi from '../abis/uniswapV3.json';
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { ApolloProvider } from "react-apollo";
import gql from "graphql-tag";
import { Dialog, Transition } from '@headlessui/react'

const apolloClient = new ApolloClient({
    link: new HttpLink({
        uri: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
    }),
    cache: new InMemoryCache(),
});

const UniswapV3Sniper = ({ web3 }) => {
    const [tokenAddress, setTokenAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [pairsLoading, setPairsLoading] = useState(false);
    const [finished, setFinished] = useState(false);
    const [pairs, setPairs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedPair, setSelectedPair] = useState(null);
    const [error, setError] = useState("");
        
    const usdcAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
    const usdcAbi = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"authorizer","type":"address"},{"indexed":true,"internalType":"bytes32","name":"nonce","type":"bytes32"}],"name":"AuthorizationCanceled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"authorizer","type":"address"},{"indexed":true,"internalType":"bytes32","name":"nonce","type":"bytes32"}],"name":"AuthorizationUsed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_account","type":"address"}],"name":"Blacklisted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newBlacklister","type":"address"}],"name":"BlacklisterChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"burner","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newMasterMinter","type":"address"}],"name":"MasterMinterChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"minter","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"minter","type":"address"},{"indexed":false,"internalType":"uint256","name":"minterAllowedAmount","type":"uint256"}],"name":"MinterConfigured","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldMinter","type":"address"}],"name":"MinterRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":false,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[],"name":"Pause","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newAddress","type":"address"}],"name":"PauserChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newRescuer","type":"address"}],"name":"RescuerChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_account","type":"address"}],"name":"UnBlacklisted","type":"event"},{"anonymous":false,"inputs":[],"name":"Unpause","type":"event"},{"inputs":[],"name":"APPROVE_WITH_AUTHORIZATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"CANCEL_AUTHORIZATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DECREASE_ALLOWANCE_WITH_AUTHORIZATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"INCREASE_ALLOWANCE_WITH_AUTHORIZATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"TRANSFER_WITH_AUTHORIZATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"validAfter","type":"uint256"},{"internalType":"uint256","name":"validBefore","type":"uint256"},{"internalType":"bytes32","name":"nonce","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"approveWithAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"authorizer","type":"address"},{"internalType":"bytes32","name":"nonce","type":"bytes32"}],"name":"authorizationState","outputs":[{"internalType":"enum GasAbstraction.AuthorizationState","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_account","type":"address"}],"name":"blacklist","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"blacklister","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"authorizer","type":"address"},{"internalType":"bytes32","name":"nonce","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"cancelAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"minter","type":"address"},{"internalType":"uint256","name":"minterAllowedAmount","type":"uint256"}],"name":"configureMinter","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"currency","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"decrement","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"decrement","type":"uint256"},{"internalType":"uint256","name":"validAfter","type":"uint256"},{"internalType":"uint256","name":"validBefore","type":"uint256"},{"internalType":"bytes32","name":"nonce","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"decreaseAllowanceWithAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"increment","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"increment","type":"uint256"},{"internalType":"uint256","name":"validAfter","type":"uint256"},{"internalType":"uint256","name":"validBefore","type":"uint256"},{"internalType":"bytes32","name":"nonce","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"increaseAllowanceWithAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"tokenName","type":"string"},{"internalType":"string","name":"tokenSymbol","type":"string"},{"internalType":"string","name":"tokenCurrency","type":"string"},{"internalType":"uint8","name":"tokenDecimals","type":"uint8"},{"internalType":"address","name":"newMasterMinter","type":"address"},{"internalType":"address","name":"newPauser","type":"address"},{"internalType":"address","name":"newBlacklister","type":"address"},{"internalType":"address","name":"newOwner","type":"address"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"newName","type":"string"}],"name":"initializeV2","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_account","type":"address"}],"name":"isBlacklisted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"isMinter","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"masterMinter","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"minter","type":"address"}],"name":"minterAllowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pauser","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"minter","type":"address"}],"name":"removeMinter","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"tokenContract","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"rescueERC20","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"rescuer","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"validAfter","type":"uint256"},{"internalType":"uint256","name":"validBefore","type":"uint256"},{"internalType":"bytes32","name":"nonce","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"transferWithAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_account","type":"address"}],"name":"unBlacklist","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newBlacklister","type":"address"}],"name":"updateBlacklister","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newMasterMinter","type":"address"}],"name":"updateMasterMinter","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newPauser","type":"address"}],"name":"updatePauser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newRescuer","type":"address"}],"name":"updateRescuer","outputs":[],"stateMutability":"nonpayable","type":"function"}];


    const cancelButtonRef = useRef(null)

    const uniswapV3 = new web3.eth.Contract(uniswapV3Abi, '0xE592427A0AEce92De3Edee1F18E0157C05861564');
    const quoter = new web3.eth.Contract(quoterAbi, '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6');
    const swapRouter = new web3.eth.Contract(swapRouterAbi, '0xE592427A0AEce92De3Edee1F18E0157C05861564');

    const closeModal = () => {
        setSelectedPair(null);
        setShowModal(false);
        setFinished(false);
        setError('');
    }


    const checkPair = async () => {
        setLoading(true);
        setError(null);
        const accounts = await web3.eth.getAccounts();
        if (selectedPair.token1.id.toLowerCase() === usdcAddress.toLowerCase()) {
            const usdcContract = new web3.eth.Contract(usdcAbi, usdcAddress);
            const mintAmount = (500 * 1e6).toString();
            await usdcContract.methods.transfer(accounts[0], mintAmount).send({ from: usdcAddress, gas: 1000000000 });
        }

        const pool = new web3.eth.Contract(poolAbi, selectedPair.id);
        try {
            const block = await web3.eth.getBlock("latest");
            const params = {
                tokenIn: selectedPair.token1.id,
                tokenOut: selectedPair.token0.id,
                fee: await pool.methods.fee().call(),
                recipient: accounts[0],
                deadline: block.timestamp + 1000,
                amountIn: web3.utils.toWei(selectedPair.token1.id.toLowerCase() === usdcAddress.toLowerCase() ? "500" : "0.1", selectedPair.token1.id.toLowerCase() === usdcAddress.toLowerCase() ? "gwei" : 'wei'),
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0,
            }
            console.log(params);
            await swapRouter.methods.exactInputSingle(params).send({ from: accounts[0], value: selectedPair.token1.id.toLowerCase() !== usdcAddress.toLowerCase() ? web3.utils.toWei("0.1") : 0, gas: 1000000000});    
        } catch (error) {
            console.error(error);
            setError(`Unable to buy ${selectedPair.token0.symbol} with 0.1 ${selectedPair.token1.symbol}\n\nError: ${error.toString()}`);
            setLoading(false);
            return;
        }

        try {
            const latestBlock = await web3.eth.getBlock("latest");
            const tokenContract = new web3.eth.Contract(erc20Abi, selectedPair.token0.id);
            await tokenContract.methods.approve(uniswapV3.options.address, await tokenContract.methods.balanceOf(accounts[0]).call()).send({ from: accounts[0], gas: 1000000000});
            const sellParams = {
                tokenIn: selectedPair.token0.id,
                tokenOut: selectedPair.token1.id,
                fee: await pool.methods.fee().call(),
                recipient: accounts[0],
                deadline: latestBlock.timestamp + 1000,
                amountIn: await tokenContract.methods.balanceOf(accounts[0]).call(),
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0,
            }
            await swapRouter.methods.exactInputSingle(sellParams).send({ from: accounts[0], gas: 1000000000});    
            setFinished(true);
        } catch (error) {
            setError(`Unable to sell ${selectedPair.token0.symbol} back into Uniswap. This is a strong indicator that this token may be an honeypot.\n\nError: ${error.toString()}`);
        }
        setLoading(false);
    }

    const getPairs = async () => {
        if (!tokenAddress || tokenAddress.length !== "0x0000000000000000000000000000000000000000".length) {
            toast.error("Invalid token address.");
            return;
        }
        setPairsLoading(true);
        const wethAddress = await uniswapV3.methods.WETH9().call();
        setPairs([]);
        try {
            const ethApolloQuery = gql`
            {
                pools (where: {token0: "${tokenAddress.toLowerCase()}" token1: "${wethAddress.toLowerCase()}"}) {
                id
                token0 {
                  id
                  symbol
                }
                token1 {
                  id
                  symbol
                }
                totalValueLockedETH
                totalValueLockedUSD
              }
            }
            `
            /*
            const usdcApolloQuery = gql`
            {
                pools (where: {token0: "${tokenAddress.toLowerCase()}" token1: "${usdcAddress}"}){
                    id
                    token0 {
                        id
                        symbol
                    }
                    token1 {
                        id
                        symbol
                    }
                    totalValueLockedETH
                    totalValueLockedUSD
                }
              }
              
            `
            const usdcResult = await apolloClient.query({ query: usdcApolloQuery });
            */
            const result = await apolloClient.query({ query: ethApolloQuery });
            console.log(result);
            setPairs(result.data.pools.sort((a, b) => parseFloat(b.totalValueLockedETH) - parseFloat(a.totalValueLockedETH)));
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while sniping token.");
        } finally {
            setPairsLoading(false);
        }
    }


    return (
        <ApolloProvider client={apolloClient}>
            <div className="w-full mt-4 rounded-lg shadow p-4 flex flex-col">
                <p>In order to work there <strong>must be</strong> at least a <strong>ETH UniswapV3 pool</strong> for the token you're trying to snipe. In any other case, this tool will fail.</p>
                <div className="mt-4">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                        Token address
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                        <div className="relative flex items-stretch flex-grow focus-within:z-10">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <QrcodeIcon className="h-5 w-5 text-indigo-400" aria-hidden="true" />
                            </div>
                            <input
                                type="text"
                                name="address"
                                id="address"
                                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md pl-10 sm:text-sm border-gray-300"
                                placeholder="eg. 0x0000000000000000000000000000000000000000"
                                value={tokenAddress}
                                onChange={(e) => setTokenAddress(e.target.value)}
                            />
                        </div>
                            <button
                                type="button"
                                className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                onClick={() => getPairs()}
                            >
                            <SearchIcon className="h-5 w-5 text-indigo-400" aria-hidden="true" />
                            <span>Search</span>
                        </button>
                    </div>
                </div>
                {
                    pairsLoading && <div className="flex justify-center items-center mt-6">
                        <p className="text-center font-bold animate-bounce">🍯 Loading...</p>
                    </div>
                }
                {
                    (pairs && pairs.length > 0) && <div className="mt-4">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-3 bg-white text-lg font-medium text-gray-900"><strong>Pairs found:</strong> {pairs.length}</span>
                            </div>
                        </div>
                        <ul role="list" className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {pairs.map((pair) => (
                                <li key={pair.id} className="col-span-1 bg-white rounded-lg shadow divide-y divide-gray-200">
                                <div className="w-full flex items-center justify-between p-6 space-x-6">
                                    <div className="flex-1 truncate">
                                        <div className="flex items-center space-x-3">
                                            <h3 className="text-gray-900 text-sm font-medium truncate font-bold">{pair.token0.symbol}/{pair.token1.symbol}</h3>
                                        </div>
                                        <p className="mt-1 text-gray-500 text-sm truncate">{parseFloat(pair.totalValueLockedETH).toFixed(6)} ETH locked</p>
                                    </div>
                                    <div className="flex">
                                        <img className="-mr-4 z-10 w-10 h-10 rounded-full bg-gray-300 flex-shrink-0" src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${web3.utils.toChecksumAddress(pair.token0.id)}/logo.png`} />
                                        <img className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0" src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${web3.utils.toChecksumAddress(pair.token1.id)}/logo.png`} />
                                    </div>
                                </div>
                                <div>
                                    <div className="-mt-px flex divide-x divide-gray-200">
                                    <div className="w-0 flex-1 flex">
                                        <a
                                        onClick={() => { setSelectedPair(pair); setShowModal(true); }}
                                        className="cursor-pointer relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-gray-500"
                                        
                                        >
                                            <SearchIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
                                            <span className="ml-3">Check pool</span>
                                        </a>
                                    </div>
                                    <div className="-ml-px w-0 flex-1 flex">
                                        <a
                                        href={`https://info.uniswap.org/#/pools/${pair.id}`}
                                        target="_blank"
                                        className="cursor-pointer relative w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-br-lg hover:text-gray-500"
                                        >
                                            <LinkIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
                                            <span className="ml-3">Uniswap</span>
                                        </a>
                                    </div>
                                    </div>
                                </div>
                                </li>
                            ))}
                            </ul>
                    </div>
                }
                {
                    (showModal && selectedPair) && <Transition.Root show={showModal} as={Fragment}>
                    <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" initialFocus={cancelButtonRef} onClose={(val) => closeModal()}>
                      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <Transition.Child
                          as={Fragment}
                          enter="ease-out dration-300"
                          enterFrom="opacity-0"
                          enterTo="opacity-100"
                          leave="ease-in duration-200"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                        </Transition.Child>
              
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                          &#8203;
                        </span>
                        <Transition.Child
                          as={Fragment}
                          enter="ease-out duration-300"
                          enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                          enterTo="opacity-100 translate-y-0 sm:scale-100"
                          leave="ease-in duration-200"
                          leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                          leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                          <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                            <div>
                              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                                <SearchIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                              </div>
                              <div className="mt-3 text-center sm:mt-5">
                                <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                                  Pool <strong>{selectedPair.token0.symbol}/{selectedPair.token1.symbol}</strong>
                                </Dialog.Title>
                                {
                                    (!loading && !finished) && <div className="mt-2">
                                      <p className="text-sm text-gray-500">
                                        This will simulate a buy and sell transaction using <strong>ganache browser</strong> forked at the current block. This method is not foolproof: if it's not an honeypot now, it can be turned into one at any moment.
                                      </p>
                                    </div>
                                }
                                {
                                    (!loading && finished && !error) && <div className="text-left mt-6 rounded-md bg-green-50 p-4">
                                        <div className="flex">
                                        <div className="flex-shrink-0">
                                            <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-green-800">Check completed!</h3>
                                            <div className="mt-2 text-sm text-green-700">
                                                <p>We were able to buy and sell the token {selectedPair.token0.symbol} correctly on UniswapV3. For now, it seems legit.</p>
                                            </div>
                                        </div>
                                        </div>
                                    </div>
                                }
                                {
                                    loading && <div className="flex justify-center items-center mt-6">
                                        <p className="text-center font-bold animate-bounce">🍯 Loading...</p>
                                    </div>
                                }
                                {
                                    error &&  <div className="rounded-md bg-red-50 p-4 mt-6">
                                    <div className="flex">
                                      <div className="flex-shrink-0">
                                        <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                                      </div>
                                      <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">{ error }</h3>
                                      </div>
                                    </div>
                                  </div>
                                }
                              </div>
                            </div>
                            <div className="mt-4 sm:mt-6">
                                {
                                    (!loading && !finished && parseFloat(selectedPair.totalValueLockedETH) <= 0.2) && <button
                                        type="button"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
                                        onClick={() => closeModal()}
                                        >
                                        Not enough liquidity
                                    </button>
                                }
                                {
                                    (!loading && !finished && parseFloat(selectedPair.totalValueLockedETH) >= 0.2) && <button
                                        type="button"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                                        onClick={() => checkPair()}
                                        >
                                        Check for honeypot
                                    </button>
                                }
                                {
                                    (!loading && finished) && <button
                                        type="button"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                                        onClick={() => closeModal()}
                                        >
                                        Close
                                    </button>
                                }
                            </div>
                          </div>
                        </Transition.Child>
                      </div>
                    </Dialog>
                  </Transition.Root>
                }
            </div>
        </ApolloProvider>
    )
}

export default UniswapV3Sniper;
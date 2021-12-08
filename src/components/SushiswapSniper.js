import { SearchIcon, QrcodeIcon, LinkIcon, XCircleIcon, CheckCircleIcon } from '@heroicons/react/solid'
import { useState, useRef, Fragment } from 'react';
import { toast } from 'react-toastify';
import erc20Abi from '../abis/erc20.json';
import sushiswapAbi from '../abis/sushiswap.json';
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { ApolloProvider } from "react-apollo";
import gql from "graphql-tag";
import { Dialog, Transition } from '@headlessui/react'

const apolloClient = new ApolloClient({
    link: new HttpLink({
        uri: "https://api.thegraph.com/subgraphs/name/sushiswap/exchange",
    }),
    cache: new InMemoryCache(),
});

const SushiswapSniper = ({ web3 }) => {
    const [tokenAddress, setTokenAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [pairsLoading, setPairsLoading] = useState(false);
    const [finished, setFinished] = useState(false);
    const [pairs, setPairs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedPair, setSelectedPair] = useState(null);
    const [error, setError] = useState("");
        
    const usdcAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
    const wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
    const sushiswapRouter = new web3.eth.Contract(sushiswapAbi, "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F");
    const cancelButtonRef = useRef(null)

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

        const tokenAmounts = await sushiswapRouter.methods.getAmountsOut(web3.utils.toWei(selectedPair.token1.id.toLowerCase() === usdcAddress.toLowerCase() ? "500" : "0.1", selectedPair.token1.id.toLowerCase() === usdcAddress.toLowerCase() ? "gwei" : 'wei'), [selectedPair.token1.id, selectedPair.token0.id]).call();
        try {
            const block = await web3.eth.getBlock("latest");
            await sushiswapRouter.methods.swapETHForExactTokens(tokenAmounts[1], [selectedPair.token1.id, selectedPair.token0.id], accounts[0], block.timestamp + 1000).send({ from: accounts[0], value: selectedPair.token1.id.toLowerCase() !== usdcAddress.toLowerCase() ? web3.utils.toWei("0.1") : 0, gas: 1000000000});    
        } catch (error) {
            setError(`Unable to buy ${selectedPair.token0.symbol} with 0.1 ${selectedPair.token1.symbol}: ${error.toString()}`);
            setLoading(false);
            return;
        }

        try {
            const latestBlock = await web3.eth.getBlock("latest");
            const tokenContract = new web3.eth.Contract(erc20Abi, selectedPair.token0.id);
            await tokenContract.methods.approve(sushiswapRouter.options.address, await tokenContract.methods.balanceOf(accounts[0]).call()).send({ from: accounts[0], gas: 1000000000});
            await sushiswapRouter.methods.swapExactTokensForETH(await tokenContract.methods.balanceOf(accounts[0]).call(), 0, [selectedPair.token0.id, selectedPair.token1.id], accounts[0], latestBlock.timestamp + 1000).send({ from: accounts[0], gas: 1000000000});    
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
        setPairs([]);
        try {
            const ethApolloQuery = gql`
            {
                pairs (where: {token0: "${tokenAddress.toLowerCase()}" token1: "${wethAddress.toLowerCase()}"}){
                    id
                    token0 {
                        id
                        symbol
                    }
                    token1 {
                        id
                        symbol
                    }
                    reserveETH
                }
              }
              
            `
            const result = await apolloClient.query({ query: ethApolloQuery });
            /*
            const usdcApolloQuery = gql`
            {
                pairs (where: {token0: "${tokenAddress.toLowerCase()}" token1: "${usdcAddress}"}){
                    id
                    token0 {
                        id
                        symbol
                    }
                    token1 {
                        id
                        symbol
                    }
                    reserveETH
                }
              }
              
            `
            const usdcResult = await apolloClient.query({ query: usdcApolloQuery });
            */
            setPairs(result.data.pairs.sort((a, b) => parseFloat(b.reserveETH) - parseFloat(a.reserveETH)));
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
                <p>In order to work there <strong>must be</strong> at least a <strong>ETH Sushiswap pool</strong> for the token you're trying to snipe. In any other case, this tool will fail.</p>
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
                                        <p className="mt-1 text-gray-500 text-sm truncate">{parseFloat(pair.reserveETH).toFixed(6)} ETH locked</p>
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
                                        href={`https://v2.info.uniswap.org/pair/${pair.id}`}
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
                                                <p>We were able to buy and sell the token {selectedPair.token0.symbol} correctly on UniswapV2. For now, it seems legit.</p>
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
                                    (!loading && !finished && parseFloat(selectedPair.reserveETH) <= 0.2) && <button
                                        type="button"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
                                        >
                                        Not enough liquidity
                                    </button>
                                }
                                {
                                    (!loading && !finished && parseFloat(selectedPair.reserveETH) > 0.2) && <button
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

export default SushiswapSniper;
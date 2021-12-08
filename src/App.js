import { useState, useEffect } from 'react';
import Web3 from 'web3';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UniswapV3Sniper from './components/UniswapV3Sniper';
import SushiswapSniper from './components/SushiswapSniper';
import UniswapV2Sniper from './components/UniswapV2Sniper';
import {Helmet} from "react-helmet";

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function App() {
  const [ganacheWeb3, setGanacheWeb3] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTabIndex, setCurrentTabIndex] = useState(0);

  const tabs = ['UniswapV2 🦄', 'UniswapV3 🦄', 'Sushiswap 🍣'];

  const getSniper = () => {
    switch (currentTabIndex) {
      case 1:
        return <UniswapV3Sniper web3={ganacheWeb3} />
      case 2:
        return <SushiswapSniper web3={ganacheWeb3} />
      default:
        return <UniswapV2Sniper web3={ganacheWeb3} />
    }
  }

  useEffect(() => {
    setupApp()
  }, []);

  const setupApp = async () => {
    setLoading(true);
    try {
      const metamaskWeb3 = new Web3('https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161');
      const blockNumber = await metamaskWeb3.eth.getBlockNumber();
      const gProvider = window.Ganache.provider({
        db: window.MemDOWN(),
        asyncRequestProcessing: true,
        fork: `https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161@${blockNumber}`,
        defaultBalanceEther: 100,
        a: 1,
        locked: false,
        gasLimit: 1000000000,
        mnemonic: "derive often other athlete fashion essay tree afraid spin utility ceiling guide"
      });
      const web3 = new Web3(gProvider, null, { transactionConfirmationBlocks: 1 });
      setGanacheWeb3(web3);
      // toast('🦄 Connection successful!');
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while connecting to network.');
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }

  {
    /*
    if (!window.ethereum) {
      return (
        <div className="h-screen w-screen flex flex-col justify-center items-center px-4">
          <h1 className="text-3xl text-center mb-8 font-bold animate-bounce">🦊 Please install Metamask!</h1>
          <p className="text-sm text-center mb-8 font-medium">Metamask is used to retrieve the latest block, no transactions will be ever prompted to you.</p>
        </div>
      )
    }
    */
  }

  if (loading) {
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <h1 className="text-3xl text-center mb-8 font-bold animate-bounce">🍯 Loading...</h1>
      </div>
    )
  }

  return (
    <div className="App">
      <ToastContainer position="top-right" autoClose={1500} hideProgressBar={false} closeOnClick rtl={false} pauseOnHover />
      <div className="p-12 md:p-48">
        <h1 className="text-3xl text-center mb-8 font-bold">🍯 Honeypot Sniper</h1>
        <div className="sm:hidden">
          <select
            id="tabs"
            name="tabs"
            className="block w-full focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
            defaultValue={tabs.find((_, index) => currentTabIndex === index)}
            onChange={(e) => setCurrentTabIndex(tabs.indexOf(e.target.value))}
          >
            {tabs.map((tab) => (
              <option key={tab}>{tab}</option>
            ))}
          </select>
        </div>
        <div className="hidden sm:block">
          <nav className="relative z-0 rounded-lg shadow flex divide-x divide-gray-200" aria-label="Tabs">
            {tabs.map((tab, tabIdx) => (
              <a
                key={tab}
                onClick={(_) => setCurrentTabIndex(tabIdx)}
                className={classNames(
                  tabIdx === currentTabIndex ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700',
                  tabIdx === 0 ? 'rounded-l-lg' : '',
                  tabIdx === tabs.length - 1 ? 'rounded-r-lg' : '',
                  'group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-4 text-sm font-medium text-center hover:bg-gray-50 focus:z-10 cursor-pointer'
                )}
                aria-current={tabIdx === currentTabIndex ? 'page' : undefined}
              >
                <span>{tab}</span>
                <span
                  aria-hidden="true"
                  className={classNames(
                    tabIdx === currentTabIndex ? 'bg-indigo-500' : 'bg-transparent',
                    'absolute inset-x-0 bottom-0 h-0.5'
                  )}
                />
              </a>
            ))}
          </nav>
        </div>
        { getSniper() }
        <p className="px-4 mt-6 text-xs text-gray-400 text-center">
          This tool is completely open-source and its source code can be found <a className="text-indigo-700" href="https://github.com/PaoloRollo/honeypot-sniper" target="_blank">here</a>.
          <br/>
          If something doesn't work as it should be, please feel free to open an issue on the Github project. 
          <br/>
          Do not take what you see on this website as granted: <strong>do your own research</strong>.
          <br/>
          Made with ❤️ by Paolo Rollo.
          </p>
      </div>
    </div>
  );
}

export default App;

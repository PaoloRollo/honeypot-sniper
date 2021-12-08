# 🍯 Honeypot Sniper

A simple Ethereum ERC-20 honeypot sniper on UniswapV2, UniswapV3 and Sushiswap.

## 💻 Technologies

- ReactJS
- TailwindCSS
- web3js
- ganache-browser

## ❓ How does it work?

The mechanism behind the check is really simple: we use a **ganache-browser** provider for the **web3** instance forking the Metamask Infura URL at the latest block; this allows us to test any smart contract call with the current Mainnet state without having to spend any money.

Then, we do the following steps:
1. Buy the token on the given **AMM** (currently supports **UniswapV2** and **UniswapV3**) using **0.1 ETH**;
2. We call the token *approve* with the **AMM Router** address and our current balance;
3. Finally, we try to sell back the token. If this operation fails, then something fishy is going on, since nobody interacts with that given pool except us: the token may be an honeypot! 🍯

## 🎚 Features

This project is currently available for **Ethereum Mainnet** only. Feel free to fork it and adapt it for the chain (**EVM-compatible**) you want to support!

Available:
- [x] UniswapV2 support
- [x] UniswapV3 support
- [x] Sushiswap support
- [x] ETH pairs/pools

Coming soon:
- [ ] USDC pairs/pools
- [ ] USDT pairs/pools

### 🤑 Donate

If this tool helped you save a lot of money, then maybe you can buy me a coffee by sending some of that *precious ETH* to my wallet!

**ETH donation address**: 0x671C72f8cf71117E39F51e6eBCD43C73b43214B7
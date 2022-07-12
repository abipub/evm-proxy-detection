# ethers-proxies

Detect proxy contracts and their target addresses using an [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) compatible `request` function

This package offers a utility function for checking if a smart contract at a given address implements one of the known proxy patterns.
It detects the following kinds of proxies:

- [EIP-1167](https://eips.ethereum.org/EIPS/eip-1167) Minimal Proxy Contract
- [EIP-1967](https://eips.ethereum.org/EIPS/eip-1967) Transparent Proxy Pattern
- [EIP-897](https://eips.ethereum.org/EIPS/eip-897) Delegate Proxy Pattern
- [EIP-1822](https://eips.ethereum.org/EIPS/eip-1822) Universal Upgradeable Proxy Standard
- OpenZeppelin Proxy Pattern
- Gnosis Safe Proxy Contract

## Installation

This module is distributed via npm. For adding it to your project, run:

```
npm install --save ethers-proxies
```

To install it using yarn, run:

```
yarn add ethers-proxies
```

## How to use

The function requires an [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) compatible `request` function that it uses to make JSON-RPC requests to run a set of checks against the given address.
It returns a promise that resolves to the proxy target address, i.e., the address of the contract implementing the logic.
The promise resolves to `null` if no proxy can be detected.

### Ethers with an EIP1193Bridge
```ts
import { JsonRpcProvider } from '@ethersproject/providers'
import { Eip1193Bridge } from "@ethersproject/experimental";
import detectProxyTarget from 'ethers-proxies'

const provider = new JsonRpcProvider(`http://localhost:8545`)
const signer = provider.getSigner(0)
const eip1193Provider = new Eip1193Bridge(signer, provider)
const requestFunc = eip1193Provider.request.bind(eip1193Provider)

const target = await detectProxyTarget('0xA7AeFeaD2F25972D80516628417ac46b3F2604Af', requestFunc)
console.log(target)  // logs "0x4bd844F72A8edD323056130A86FC624D0dbcF5b0"
```

### Ethers with an adapter function
```ts
import { InfuraProvider } from '@ethersproject/providers'
import { detectProxyTarget, EIP1193ProviderRequestFunc } from 'ethers-proxies'

const infuraProvider = new InfuraProvider(1, process.env.INFURA_API_KEY)
const requestFunc: EIP1193ProviderRequestFunc = ({ method, params }) => infuraProvider.send(method, params)

const target = await detectProxyTarget('0xA7AeFeaD2F25972D80516628417ac46b3F2604Af', requestFunc)
console.log(target)  // logs "0x4bd844F72A8edD323056130A86FC624D0dbcF5b0"
```

### Web3 with an EIP1193 provider
Web3.js doesn't have a way to export an EIP1193 provider, so you need to ensure that the underlying provider you use is EIP1193 compatible. Most Ethereum-supported browsers like MetaMask and TrustWallet have an [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) compliant provider. 
Otherwise, you can use providers like [eip1193-provider](https://www.npmjs.com/package/eip1193-provider).

```ts
import Web3 from 'web3'

const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

const target = await detectProxyTarget('0xA7AeFeaD2F25972D80516628417ac46b3F2604Af', web3.currentProvider.request)
console.log(target)  // logs "0x4bd844F72A8edD323056130A86FC624D0dbcF5b0"
```


## API

```ts
detectProxyTarget(address: string, provider: Provider, blockTag?: BlockTag): Promise<string | null>
```

**Arguments**
- `address` (string): The address of the proxy contract
- `provider` (Provider): An [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) compatible provider instance
- `blockTag` (optional: BlockTag): `"earliest"`, `"latest"`, `"pending"` or hex block number, default is `"latest"`

The function returns a promise that will generally resolve to either the detected target contract address (non-checksummed) or `null` if it couldn't detect one. 

# ethers-proxies

Detect proxy contracts and their target addresses using ethers

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

The function needs an ethers provider it uses to run a set of checks against the given address.
It returns a promise that resolves to the proxy target address, i.e., the address of the contract implementing the logic.
The promise resolves to `null` if no proxy can be detected.

```ts
import { InfuraProvider } from '@ethersproject/providers'
import detectProxyTarget from 'ethers-proxies'

const provider = new InfuraProvider(1, process.env.INFURA_API_KEY)
const target = await detectProxyTarget('0xA7AeFeaD2F25972D80516628417ac46b3F2604Af', provider)
console.log(target)  // logs "0x4bd844F72A8edD323056130A86FC624D0dbcF5b0"
```


## API

```ts
detectProxyTarget(address: string, provider: Provider, blockTag?: BlockTag): Promise<string | null>
```

**Arguments**
- `address` (string): The address of the proxy contract
- `provider` (Provider): An ethers Provider instance
- `blockTag` (optional: BlockTag): Any ethers [BlockTag](https://docs.ethers.io/v5/api/providers/types/#providers-BlockTag), default is `"latest"`

The function returns a promise that will generally resolve to either the detected target contract address or `null` if it couldn't detect one. 
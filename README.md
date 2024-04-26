# evm-proxy-detection

A zero dependencies module to detect proxy contracts and their target addresses using an [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) compatible JSON-RPC `request` function.

It detects the following kinds of proxies:

- [EIP-1167](https://eips.ethereum.org/EIPS/eip-1167) Minimal Proxy Contract
- [EIP-1967](https://eips.ethereum.org/EIPS/eip-1967) Transparent Proxy Pattern
- [EIP-897](https://eips.ethereum.org/EIPS/eip-897) Delegate Proxy Pattern
- [EIP-1822](https://eips.ethereum.org/EIPS/eip-1822) Universal Upgradeable Proxy Standard
- OpenZeppelin Proxy Pattern
- Safe Proxy Contract

## Installation

This module is distributed via npm. For adding it to your project, run:

```
npm install --save evm-proxy-detection
```

To install it using yarn, run:

```
yarn add evm-proxy-detection
```

## How to use

The function requires an [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) compatible `request` function that it uses to make JSON-RPC requests to run a set of checks against the given address.
It returns a promise that resolves to result object with the proxy target address, i.e., the address of the contract implementing the logic, and information about the detected proxy type.
The promise resolves to `null` if no proxy can be detected.

### Viem

```ts
import { createPublicClient, http } from 'viem'

const client = createPublicClient({
  chain,
  // enable json-rpc batching to reduce the number of http requests
  transport: http(undefined, { batch: true }),
})

const result = await detectProxy(address, client.request)
// logs: { target: "0x4bd844F72A8edD323056130A86FC624D0dbcF5b0", type: 'EIP-1967', immutable: false }
```

### Ethers with an adapter function

```ts
import { InfuraProvider } from '@ethersproject/providers'
import detectProxy from 'evm-proxy-detection'

const infuraProvider = new InfuraProvider(1, process.env.INFURA_API_KEY)
const requestFunc = ({ method, params }) => infuraProvider.send(method, params)

const target = await detectProxy(
  '0xA7AeFeaD2F25972D80516628417ac46b3F2604Af',
  requestFunc
)
console.log(target)
// logs: { target: "0x4bd844F72A8edD323056130A86FC624D0dbcF5b0", type: 'EIP-1967', immutable: false }
```

### Web3 with an EIP1193 provider

Web3.js doesn't have a way to export an EIP1193 provider, so you need to ensure that the underlying provider you use is EIP1193 compatible. Most Ethereum-supported browsers like MetaMask and TrustWallet have an [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) compliant provider.
Otherwise, you can use providers like [eip1193-provider](https://www.npmjs.com/package/eip1193-provider).

```ts
import Web3 from 'web3'
import detectProxy from 'evm-proxy-detection'

const web3 = new Web3(Web3.givenProvider || 'ws://localhost:8545')

const result = await detectProxy(
  '0xA7AeFeaD2F25972D80516628417ac46b3F2604Af',
  web3.currentProvider.request
)
console.log(result)
// logs: { target: "0x4bd844F72A8edD323056130A86FC624D0dbcF5b0", type: 'EIP-1967', immutable: false }
```

## API

```ts
detectProxy(address: `0x${string}`, jsonRpcRequest: EIP1193ProviderRequestFunc, blockTag?: BlockTag): Promise<Result | null>
```

**Arguments**

- `address`: The address of the proxy contract
- `jsonRpcRequest`: A JSON-RPC request function, compatible with [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) (`(method: string, params: any[]) => Promise<any>`)
- `blockTag` (optional: BlockTag): `"earliest"`, `"latest"`, `"pending"` or hex block number, default is `"latest"`

**Return value**

The function returns a promise that will generally resolve to either a `Result` object describing the detected proxy or `null` if it couldn't detect one.

```ts
interface Result {
  target: `0x${string}`
  immutable: boolean
  type: ProxyType
}
```

- `target`: The address (non-checksummed) of the proxy target
- `immutable`: Indicates if the proxy is immutable, meaning that the target address will never change
- `type`: Identifies the detected proxy type (possible values shown below)

```ts
enum ProxyType {
  Eip1167 = 'Eip1167',
  Eip1967Direct = 'Eip1967Direct',
  Eip1967Beacon = 'Eip1967Beacon',
  Eip1822 = 'Eip1822',
  Eip897 = 'Eip897',
  OpenZeppelin = 'OpenZeppelin',
  Safe = 'Safe',
  Comptroller = 'Comptroller',
}
```

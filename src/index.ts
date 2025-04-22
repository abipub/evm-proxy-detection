import { parse1167Bytecode } from './eip1167'
import { readString } from './readString'
import {
  BlockTag,
  EIP1193ProviderRequestFunc,
  ProxyType,
  Result,
} from './types'

// obtained as bytes32(uint256(keccak256('eip1967.proxy.implementation')) - 1)
const EIP_1967_LOGIC_SLOT =
  '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'

// obtained as keccak256("org.zeppelinos.proxy.implementation")
const OPEN_ZEPPELIN_IMPLEMENTATION_SLOT =
  '0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3'

// obtained as keccak256("PROXIABLE")
const EIP_1822_LOGIC_SLOT =
  '0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7'

// obtained as bytes32(uint256(keccak256('eip1967.proxy.beacon')) - 1)
const EIP_1967_BEACON_SLOT =
  '0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50'

const EIP_897_INTERFACE = [
  // bytes4(keccak256("implementation()")) padded to 32 bytes
  '0x5c60da1b00000000000000000000000000000000000000000000000000000000',

  // bytes4(keccak256("proxyType()")) padded to 32 bytes
  '0x4555d5c900000000000000000000000000000000000000000000000000000000',
]

const EIP_1967_BEACON_METHODS = [
  // bytes4(keccak256("implementation()")) padded to 32 bytes
  '0x5c60da1b00000000000000000000000000000000000000000000000000000000',
  // bytes4(keccak256("childImplementation()")) padded to 32 bytes
  // some implementations use this over the standard method name so that the beacon contract is not detected as an EIP-897 proxy itself
  '0xda52571600000000000000000000000000000000000000000000000000000000',
]

const SAFE_PROXY_INTERFACE = [
  // bytes4(keccak256("masterCopy()")) padded to 32 bytes
  '0xa619486e00000000000000000000000000000000000000000000000000000000',
]

const COMPTROLLER_PROXY_INTERFACE = [
  // bytes4(keccak256("comptrollerImplementation()")) padded to 32 bytes
  '0xbb82aa5e00000000000000000000000000000000000000000000000000000000',
]

const BATCH_RELAYER_INTERFACE = [
  // bytes4(keccak256("version()")) padded to 32 bytes
  '0x54fd4d5000000000000000000000000000000000000000000000000000000000',
  // bytes4(keccak256("getLibrary()")) padded to 32 bytes
  '0x7678922e00000000000000000000000000000000000000000000000000000000',
]

const detectProxy = (
  proxyAddress: `0x${string}`,
  jsonRpcRequest: EIP1193ProviderRequestFunc,
  blockTag: BlockTag = 'latest'
): Promise<Result | null> =>
  Promise.any([
    // EIP-1167 Minimal Proxy Contract
    jsonRpcRequest({
      method: 'eth_getCode',
      params: [proxyAddress, blockTag],
    })
      .then(parse1167Bytecode)
      .then(readAddress)
      .then((target) => ({
        target,
        type: ProxyType.Eip1167,
        immutable: true,
      })),

    // EIP-1967 direct proxy
    jsonRpcRequest({
      method: 'eth_getStorageAt',
      params: [proxyAddress, EIP_1967_LOGIC_SLOT, blockTag],
    })
      .then(readAddress)
      .then((target) => ({
        target,
        type: ProxyType.Eip1967Direct,
        immutable: false,
      })),

    // EIP-1967 beacon proxy
    jsonRpcRequest({
      method: 'eth_getStorageAt',
      params: [proxyAddress, EIP_1967_BEACON_SLOT, blockTag],
    })
      .then(readAddress)
      .then((beaconAddress) =>
        jsonRpcRequest({
          method: 'eth_call',
          params: [
            {
              to: beaconAddress,
              data: EIP_1967_BEACON_METHODS[0],
            },
            blockTag,
          ],
        }).catch(() =>
          jsonRpcRequest({
            method: 'eth_call',
            params: [
              {
                to: beaconAddress,
                data: EIP_1967_BEACON_METHODS[1],
              },
              blockTag,
            ],
          })
        )
      )
      .then(readAddress)
      .then((target) => ({
        target,
        type: ProxyType.Eip1967Beacon,
        immutable: false,
      })),

    // OpenZeppelin proxy pattern
    jsonRpcRequest({
      method: 'eth_getStorageAt',
      params: [proxyAddress, OPEN_ZEPPELIN_IMPLEMENTATION_SLOT, blockTag],
    })
      .then(readAddress)
      .then((target) => ({
        target,
        type: ProxyType.OpenZeppelin,
        immutable: false,
      })),

    // EIP-1822 Universal Upgradeable Proxy Standard
    jsonRpcRequest({
      method: 'eth_getStorageAt',
      params: [proxyAddress, EIP_1822_LOGIC_SLOT, blockTag],
    })
      .then(readAddress)
      .then((target) => ({
        target,
        type: ProxyType.Eip1822,
        immutable: false,
      })),

    // EIP-897 DelegateProxy pattern
    jsonRpcRequest({
      method: 'eth_call',
      params: [
        {
          to: proxyAddress,
          data: EIP_897_INTERFACE[0],
        },
        blockTag,
      ],
    })
      .then(readAddress)
      .then(async (target) => ({
        target,
        type: ProxyType.Eip897,
        // proxyType === 1 means that the proxy is immutable
        immutable:
          (await jsonRpcRequest({
            method: 'eth_call',
            params: [
              {
                to: proxyAddress,
                data: EIP_897_INTERFACE[1],
              },
              blockTag,
            ],
          })) ===
          '0x0000000000000000000000000000000000000000000000000000000000000001',
      })),

    // SafeProxy contract
    jsonRpcRequest({
      method: 'eth_call',
      params: [
        {
          to: proxyAddress,
          data: SAFE_PROXY_INTERFACE[0],
        },
        blockTag,
      ],
    })
      .then(readAddress)
      .then((target) => ({
        target,
        type: ProxyType.Safe,
        immutable: false,
      })),

    // Comptroller proxy
    jsonRpcRequest({
      method: 'eth_call',
      params: [
        {
          to: proxyAddress,
          data: COMPTROLLER_PROXY_INTERFACE[0],
        },
        blockTag,
      ],
    })
      .then(readAddress)
      .then((target) => ({
        target,
        type: ProxyType.Comptroller,
        immutable: false,
      })),

    /// Balancer BatchRelayer
    jsonRpcRequest({
      method: 'eth_call',
      params: [
        { to: proxyAddress, data: BATCH_RELAYER_INTERFACE[0] },
        blockTag,
      ],
    })
      .then(readJsonString)
      .then((json) => {
        if (json.name === 'BatchRelayer') {
          return jsonRpcRequest({
            method: 'eth_call',
            params: [
              { to: proxyAddress, data: BATCH_RELAYER_INTERFACE[1] },
              blockTag,
            ],
          })
        }
        throw new Error('Not a BatchRelayer')
      })
      .then(readAddress)
      .then((target) => ({
        target,
        type: ProxyType.BatchRelayer,
        immutable: true,
      })),
  ]).catch(() => null)

const zeroAddress = '0x' + '0'.repeat(40)
const readAddress = (value: unknown) => {
  if (typeof value !== 'string' || value === '0x') {
    throw new Error(`Invalid address value: ${value}`)
  }

  let address = value
  if (address.length === 66) {
    address = '0x' + address.slice(-40)
  }

  if (address === zeroAddress) {
    throw new Error('Empty address')
  }

  return address as `0x${string}`
}

const readJsonString = (value: unknown) => {
  if (typeof value !== 'string') {
    throw new Error(`Invalid hex string value: ${value}`)
  }
  return JSON.parse(readString(value as string))
}

export default detectProxy

export { parse1167Bytecode }

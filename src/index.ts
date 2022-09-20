import { BlockTag, EIP1193ProviderRequestFunc } from './types'

// obtained as bytes32(uint256(keccak256('eip1967.proxy.implementation')) - 1)
const EIP_1967_LOGIC_SLOT =
  '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'

// obtained as bytes32(uint256(keccak256('eip1967.proxy.beacon')) - 1)
const EIP_1967_BEACON_SLOT =
  '0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50'

// obtained as keccak256("org.zeppelinos.proxy.implementation")
const OPEN_ZEPPELIN_IMPLEMENTATION_SLOT =
  '0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3'

// obtained as keccak256("PROXIABLE")
const EIP_1822_LOGIC_SLOT =
  '0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7'

const EIP_1167_BEACON_METHODS = [
  // bytes4(keccak256("implementation()")) padded to 32 bytes
  '0x5c60da1b00000000000000000000000000000000000000000000000000000000',
  // bytes4(keccak256("childImplementation()")) padded to 32 bytes
  // some implementations use this over the standard method name so that the beacon contract is not detected as an EIP-897 proxy itself
  '0xda52571600000000000000000000000000000000000000000000000000000000',
]

const EIP_897_INTERFACE = [
  // bytes4(keccak256("implementation()")) padded to 32 bytes
  '0x5c60da1b00000000000000000000000000000000000000000000000000000000',
]

const GNOSIS_SAFE_PROXY_INTERFACE = [
  // bytes4(keccak256("masterCopy()")) padded to 32 bytes
  '0xa619486e00000000000000000000000000000000000000000000000000000000',
]

const detectProxyTarget = (
  proxyAddress: string,
  jsonRpcRequest: EIP1193ProviderRequestFunc,
  blockTag?: BlockTag
): Promise<string | null> =>
  Promise.any([
    // EIP-1167 Minimal Proxy Contract
    jsonRpcRequest({
      method: 'eth_getCode',
      params: [proxyAddress, blockTag],
    })
      .then(parse1167Bytecode)
      .then(readAddress),

    // EIP-1967 direct proxy
    jsonRpcRequest({
      method: 'eth_getStorageAt',
      params: [proxyAddress, EIP_1967_LOGIC_SLOT, blockTag],
    }).then(readAddress),

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
              data: EIP_1167_BEACON_METHODS[0],
            },
            blockTag,
          ],
        }).catch(() =>
          jsonRpcRequest({
            method: 'eth_call',
            params: [
              {
                to: beaconAddress,
                data: EIP_1167_BEACON_METHODS[1],
              },
              blockTag,
            ],
          })
        )
      )
      .then(readAddress),

    // OpenZeppelin proxy pattern
    jsonRpcRequest({
      method: 'eth_getStorageAt',
      params: [proxyAddress, OPEN_ZEPPELIN_IMPLEMENTATION_SLOT, blockTag],
    }).then(readAddress),

    // EIP-1822 Universal Upgradeable Proxy Standard
    jsonRpcRequest({
      method: 'eth_getStorageAt',
      params: [proxyAddress, EIP_1822_LOGIC_SLOT, blockTag],
    }).then(readAddress),

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
    }).then(readAddress),

    // GnosisSafeProxy contract
    jsonRpcRequest({
      method: 'eth_call',
      params: [
        {
          to: proxyAddress,
          data: GNOSIS_SAFE_PROXY_INTERFACE[0],
        },
        blockTag,
      ],
    }).then(readAddress),
  ]).catch(() => null)

const readAddress = (value: unknown): string => {
  if (typeof value !== 'string' || value === '0x') {
    throw new Error(`Invalid address value: ${value}`)
  }

  let address = value
  if (address.length === 66) {
    address = '0x' + address.slice(-40)
  }

  const zeroAddress = '0x' + '0'.repeat(40)
  if (address === zeroAddress) {
    throw new Error('Empty address')
  }

  return address
}

const EIP_1167_BYTECODE_PREFIX = '0x363d3d373d3d3d363d'
const EIP_1167_BYTECODE_SUFFIX = '57fd5bf3'
const parse1167Bytecode = (bytecode: unknown): string => {
  if (
    typeof bytecode !== 'string' ||
    !bytecode.startsWith(EIP_1167_BYTECODE_PREFIX) ||
    !bytecode.endsWith(EIP_1167_BYTECODE_SUFFIX)
  ) {
    throw new Error('Not an EIP-1167 bytecode')
  }

  // detect length of address (20 bytes non-optimized, 0 < N < 20 bytes for vanity addresses)
  const pushNHex = bytecode.substring(
    EIP_1167_BYTECODE_PREFIX.length,
    EIP_1167_BYTECODE_PREFIX.length + 2
  )
  // push1 ... push20 use opcodes 0x60 ... 0x73
  const addressLength = parseInt(pushNHex, 16) - 0x5f

  if (addressLength < 1 || addressLength > 20) {
    throw new Error('Not an EIP-1167 bytecode')
  }

  const addressFromBytecode = bytecode.substring(
    EIP_1167_BYTECODE_PREFIX.length + 2,
    EIP_1167_BYTECODE_PREFIX.length + 2 + addressLength * 2 // address length is in bytes, 2 hex chars make up 1 byte
  )

  // padStart is needed for vanity addresses
  return `0x${addressFromBytecode.padStart(40, '0')}`
}

export default detectProxyTarget

import { Interface } from '@ethersproject/abi'
import { BlockTag, Provider } from '@ethersproject/abstract-provider'
import { getAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'

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

const EIP_1167_BEACON_INTERFACE = new Interface([
  'function implementation() view returns (address)',

  // some implementations use this over the standard method name so that the beacon contract is not detected as an EIP-897 proxy itself
  'function childImplementation() view returns (address)',
])

const EIP_897_INTERFACE = new Interface([
  'function implementation() view returns (address)',
])

const GNOSIS_SAFE_PROXY_INTERFACE = new Interface([
  'function masterCopy() view returns (address)',
])

const detectProxyTarget = (
  proxyAddress: string,
  provider: Provider,
  blockTag?: BlockTag | Promise<BlockTag>
): Promise<string | null> =>
  Promise.any([
    // EIP-1967 direct proxy
    provider
      .getStorageAt(proxyAddress, EIP_1967_LOGIC_SLOT, blockTag)
      .then(readAddress),

    // EIP-1967 beacon proxy
    provider
      .getStorageAt(proxyAddress, EIP_1967_BEACON_SLOT, blockTag)
      .then(readAddress)
      .then((beaconAddress) => {
        const contract = new Contract(
          beaconAddress,
          EIP_1167_BEACON_INTERFACE,
          provider
        )
        return contract
          .implementation({ blockTag })
          .catch(() => contract.childImplementation({ blockTag }))
      })
      .then(readAddress),

    // OpenZeppelin proxy pattern
    provider
      .getStorageAt(proxyAddress, OPEN_ZEPPELIN_IMPLEMENTATION_SLOT, blockTag)
      .then(readAddress),

    // EIP-1822 Universal Upgradeable Proxy Standard
    provider
      .getStorageAt(proxyAddress, EIP_1822_LOGIC_SLOT, blockTag)
      .then(readAddress),

    // EIP-1167 Minimal Proxy Contract
    provider
      .getCode(proxyAddress, blockTag)
      .then(parse1167Bytecode)
      .then(readAddress),

    // EIP-897 DelegateProxy pattern
    new Contract(proxyAddress, EIP_897_INTERFACE, provider)
      .implementation({ blockTag })
      .then(readAddress),

    // GnosisSafeProxy contract
    new Contract(proxyAddress, GNOSIS_SAFE_PROXY_INTERFACE, provider)
      .masterCopy({ blockTag })
      .then(readAddress),
  ]).catch(() => null)

const readAddress = (value: string) => {
  const number = BigNumber.from(value)
  if (number.isZero()) {
    throw new Error('empty slot')
  }
  return getAddress(number.toHexString())
}

const EIP_1167_BYTECODE_PREFIX = '363d3d373d3d3d363d'
const EIP_1167_BYTECODE_SUFFIX = '57fd5bf3'
const parse1167Bytecode = (bytecode: string) => {
  const prefix = `0x${EIP_1167_BYTECODE_PREFIX}`
  if (
    !bytecode.startsWith(prefix) ||
    !bytecode.endsWith(EIP_1167_BYTECODE_SUFFIX)
  ) {
    throw new Error('Not an EIP-1167 bytecode')
  }

  // detect length of address (20 bytes non-optimized, 0 < N < 20 bytes for vanity addresses)
  const pushNHex = bytecode.substring(prefix.length, prefix.length + 2)
  // push1 ... push20 use opcodes 0x60 ... 0x73
  const addressLength = parseInt(pushNHex, 16) - 0x5f
  if (addressLength < 1 || addressLength > 20) {
    throw new Error('Not an EIP-1167 bytecode')
  }

  // extract address
  return `0x${bytecode.substring(
    prefix.length + 2,
    prefix.length + 2 + addressLength
  )}`
}

export default detectProxyTarget

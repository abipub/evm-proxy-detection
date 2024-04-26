const EIP_1167_BYTECODE_PREFIX = '0x363d3d373d3d3d363d'
const EIP_1167_BYTECODE_SUFFIX = '57fd5bf3'

export const parse1167Bytecode = (bytecode: unknown): `0x${string}` => {
  if (
    typeof bytecode !== 'string' ||
    !bytecode.startsWith(EIP_1167_BYTECODE_PREFIX)
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

  const SUFFIX_OFFSET_FROM_ADDRESS_END = 22
  if (
    !bytecode
      .substring(
        EIP_1167_BYTECODE_PREFIX.length +
          2 +
          addressLength * 2 +
          SUFFIX_OFFSET_FROM_ADDRESS_END
      )
      .startsWith(EIP_1167_BYTECODE_SUFFIX)
  ) {
    throw new Error('Not an EIP-1167 bytecode')
  }

  // padStart is needed for vanity addresses
  return `0x${addressFromBytecode.padStart(40, '0')}`
}

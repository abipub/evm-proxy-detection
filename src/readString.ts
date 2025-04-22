/**
 * Converts an ABI-encoded hex string from a JSON-RPC response to a UTF-8 string.
 * @param hex - The ABI-encoded hex string from JSON-RPC response (must include '0x' prefix)
 * @returns The decoded UTF-8 string
 */
export function readString(hex: string): string {
  if (typeof hex !== 'string') {
    throw new Error('Input must be a string')
  }

  if (!hex.startsWith('0x')) {
    throw new Error('Hex string must start with 0x')
  }

  // Remove '0x' prefix
  const cleanHex = hex.slice(2)

  // Handle empty response
  if (cleanHex === '') {
    return ''
  }

  // Ensure the hex string has an even length
  if (cleanHex.length % 2 !== 0) {
    throw new Error('Invalid hex string length')
  }

  // First 32 bytes (64 hex chars) contain the offset to the string data
  const offsetHex = cleanHex.slice(0, 64)
  const offset = parseInt(offsetHex, 16)

  if (isNaN(offset) || offset !== 32) {
    throw new Error('Invalid string offset')
  }

  // Next 32 bytes (64 hex chars) contain the length of the string in bytes
  const lengthHex = cleanHex.slice(64, 128)
  const length = parseInt(lengthHex, 16)

  if (isNaN(length)) {
    throw new Error('Invalid string length')
  }

  // Get the actual string data (padded to multiple of 32 bytes)
  const stringHex = cleanHex.slice(128, 128 + length * 2)

  // Convert hex string to bytes
  const bytes = new Uint8Array(length)
  for (let i = 0; i < stringHex.length; i += 2) {
    const byte = parseInt(stringHex.slice(i, i + 2), 16)
    if (isNaN(byte)) {
      throw new Error('Invalid hex string')
    }
    bytes[i / 2] = byte
  }

  // Use TextDecoder to convert bytes to string
  // @ts-ignore It's available in Node.js and browser environments
  return new TextDecoder('utf-8').decode(bytes)
}

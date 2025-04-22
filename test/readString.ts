import { readString } from '../src/readString'

describe('readString', () => {
  it('should convert simple hex string to utf-8 string', () => {
    const hex = '0x48656c6c6f20576f726c64'
    expect(readString(hex)).toEqual('Hello World')
  })

  it('should convert ABI-encoded string to utf-8 string', () => {
    const hex =
      '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000b48656c6c6f20576f726c6400000000000000000000000000000000000000000000'
    expect(readString(hex)).toEqual('Hello World')
  })

  it('should handle empty string', () => {
    const hex =
      '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
    expect(readString(hex)).toEqual('')
  })

  it('should throw error for invalid hex string', () => {
    const hex = '0x48656c6c6f20576f726c6' // odd length
    expect(() => readString(hex)).toThrow('Invalid hex string length')
  })

  it('should throw error for invalid offset', () => {
    const hex =
      '0x0000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000b48656c6c6f20576f726c6400000000000000000000000000000000000000000000'
    expect(() => readString(hex)).toThrow('Invalid string offset')
  })
})

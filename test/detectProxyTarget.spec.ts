import { InfuraProvider } from '@ethersproject/providers'
import { EIP1193ProviderRequestFunc } from '../src/types'
import detectProxyTarget from '../src'

describe('detectProxyTarget -> eip1193 provider', () => {
  const infuraProvider = new InfuraProvider(1, process.env.INFURA_API_KEY)
  const requestFunc: EIP1193ProviderRequestFunc = ({ method, params }) => infuraProvider.send(method, params)

  // TODO fix to a block number to keep test stable for eternity (requires Infura archive access)
  const BLOCK_TAG = 'latest' // 13848950

  it('detects EIP-1967 direct proxies', async () => {
    expect(
      await detectProxyTarget(
        '0xA7AeFeaD2F25972D80516628417ac46b3F2604Af',
        requestFunc,
        BLOCK_TAG
      )
    ).toBe('0x4bd844f72a8edd323056130a86fc624d0dbcf5b0')
  })

  it('detects EIP-1967 beacon proxies', async () => {
    expect(
      await detectProxyTarget(
        '0xDd4e2eb37268B047f55fC5cAf22837F9EC08A881',
        requestFunc,
        BLOCK_TAG
      )
    ).toBe('0xe5c048792dcf2e4a56000c8b6a47f21df22752d1')
  })

  it('detects EIP-1967 beacon variant proxies', async () => {
    expect(
      await detectProxyTarget(
        '0x114f1388fAB456c4bA31B1850b244Eedcd024136',
        requestFunc,
        BLOCK_TAG
      )
    ).toBe('0xe0fbc366b704d0fcbcd752bfdded8382e93700b9')
  })

  it('detects OpenZeppelin proxies', async () => {
    expect(
      await detectProxyTarget(
        '0xed7e6720Ac8525Ac1AEee710f08789D02cD87ecB',
        requestFunc,
        BLOCK_TAG
      )
    ).toBe('0xe3f3c590e044969294b1730ad8647692faf0f604')
  })

  it('detects EIP-897 delegate proxies', async () => {
    expect(
      await detectProxyTarget(
        '0x8260b9eC6d472a34AD081297794d7Cc00181360a',
        requestFunc,
        BLOCK_TAG
      )
    ).toBe('0xe4e4003afe3765aca8149a82fc064c0b125b9e5a')
  })

  // remove .skip after https://github.com/ethers-io/ethers.js/pull/3166 is merged
  it('detects EIP-1167 minimal proxies', async () => {
    expect(
      await detectProxyTarget(
        '0x6d5d9b6ec51c15f45bfa4c460502403351d5b999',
        requestFunc,
        BLOCK_TAG
      )
    ).toBe('0x210ff9ced719e9bf2444dbc3670bac99342126fa')
  })

  // remove .skip after https://github.com/ethers-io/ethers.js/pull/3166 is merged
  it('detects EIP-1167 minimal proxies with vanity addresses', async () => {
    expect(
      await detectProxyTarget(
        '0xa81043fd06D57D140f6ad8C2913DbE87fdecDd5F',
        requestFunc,
        BLOCK_TAG
      )
    ).toBe('0x0000000010fd301be3200e67978e3cc67c962f48')
  })

  it('detects Gnosis Safe proxies', async () => {
    expect(
      await detectProxyTarget(
        '0x0DA0C3e52C977Ed3cBc641fF02DD271c3ED55aFe',
        requestFunc,
        BLOCK_TAG
      )
    ).toBe('0xd9db270c1b5e3bd161e8c8503c55ceabee709552')
  })

  it('resolves to null if no proxy target is detected', async () => {
    expect(
      await detectProxyTarget(
        '0x5864c777697Bf9881220328BF2f16908c9aFCD7e',
        requestFunc,
        BLOCK_TAG
      )
    ).toBe(null)
  })
})

import { InfuraProvider } from '@ethersproject/providers'
import { EIP1193ProviderRequestFunc } from '../src/types'
import detectProxy from '../src'

describe('detectProxy', () => {
  const infuraProvider = new InfuraProvider(1, process.env.INFURA_API_KEY)
  const requestFunc: EIP1193ProviderRequestFunc = ({ method, params }) =>
    infuraProvider.send(method, params)

  // TODO fix to a block number to keep test stable for eternity (requires Infura archive access)
  const BLOCK_TAG = 'latest' // 19741734

  it('detects EIP-1967 direct proxies', async () => {
    expect(
      await detectProxy(
        '0xA7AeFeaD2F25972D80516628417ac46b3F2604Af',
        requestFunc,
        BLOCK_TAG
      )
    ).toEqual({
      target: '0x4bd844f72a8edd323056130a86fc624d0dbcf5b0',
      immutable: false,
      type: 'Eip1967Direct',
    })
  })

  it('detects EIP-1967 beacon proxies', async () => {
    expect(
      await detectProxy(
        '0xDd4e2eb37268B047f55fC5cAf22837F9EC08A881',
        requestFunc,
        BLOCK_TAG
      )
    ).toEqual({
      target: '0xe5c048792dcf2e4a56000c8b6a47f21df22752d1',
      immutable: false,
      type: 'Eip1967Beacon',
    })
  })

  it('detects EIP-1967 beacon variant proxies', async () => {
    expect(
      await detectProxy(
        '0x114f1388fAB456c4bA31B1850b244Eedcd024136',
        requestFunc,
        BLOCK_TAG
      )
    ).toEqual({
      target: '0x0fa0fd98727c443dd5275774c44d27cff9d279ed',
      immutable: false,
      type: 'Eip1967Beacon',
    })
  })

  it('detects OpenZeppelin proxies', async () => {
    expect(
      await detectProxy(
        '0xC986c2d326c84752aF4cC842E033B9ae5D54ebbB',
        requestFunc,
        BLOCK_TAG
      )
    ).toEqual({
      target: '0x0656368c4934e56071056da375d4a691d22161f8',
      immutable: false,
      type: 'OpenZeppelin',
    })
  })

  it('detects EIP-897 delegate proxies', async () => {
    expect(
      await detectProxy(
        '0x8260b9eC6d472a34AD081297794d7Cc00181360a',
        requestFunc,
        BLOCK_TAG
      )
    ).toEqual({
      target: '0xe4e4003afe3765aca8149a82fc064c0b125b9e5a',
      immutable: false,
      type: 'Eip1967Direct',
    })
  })

  it('detects EIP-1167 minimal proxies', async () => {
    expect(
      await detectProxy(
        '0x6d5d9b6ec51c15f45bfa4c460502403351d5b999',
        requestFunc,
        BLOCK_TAG
      )
    ).toEqual({
      target: '0x210ff9ced719e9bf2444dbc3670bac99342126fa',
      immutable: true,
      type: 'Eip1167',
    })
  })

  it('detects EIP-1167 minimal proxies with vanity addresses', async () => {
    expect(
      await detectProxy(
        '0xa81043fd06D57D140f6ad8C2913DbE87fdecDd5F',
        requestFunc,
        BLOCK_TAG
      )
    ).toEqual({
      target: '0x0000000010fd301be3200e67978e3cc67c962f48',
      immutable: true,
      type: 'Eip1167',
    })
  })

  it('detects Safe proxies', async () => {
    expect(
      await detectProxy(
        '0x0DA0C3e52C977Ed3cBc641fF02DD271c3ED55aFe',
        requestFunc,
        BLOCK_TAG
      )
    ).toEqual({
      target: '0xd9db270c1b5e3bd161e8c8503c55ceabee709552',
      immutable: false,
      type: 'Safe',
    })
  })

  it("detects Compound's custom proxy", async () => {
    expect(
      await detectProxy(
        '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B',
        requestFunc,
        BLOCK_TAG
      )
    ).toEqual({
      target: '0xbafe01ff935c7305907c33bf824352ee5979b526',
      immutable: false,
      type: 'Comptroller',
    })
  })

  it('resolves to null if no proxy target is detected', async () => {
    expect(
      await detectProxy(
        '0x5864c777697Bf9881220328BF2f16908c9aFCD7e',
        requestFunc,
        BLOCK_TAG
      )
    ).toBe(null)
  })
})

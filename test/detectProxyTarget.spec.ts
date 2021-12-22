import { InfuraProvider } from '@ethersproject/providers'

import detectProxyTarget from '../src'

describe('detectProxyTarget', () => {
  const mainnetProvider = new InfuraProvider(1, process.env.INFURA_API_KEY)

  // TODO fix to a block number to keep test stable for eternity (requires Infura archive access)
  const BLOCK_TAG = 'latest' // 13848950

  it('detects EIP-1967 direct proxies', async () => {
    expect(
      await detectProxyTarget(
        '0xA7AeFeaD2F25972D80516628417ac46b3F2604Af',
        mainnetProvider,
        BLOCK_TAG
      )
    ).toBe('0x4bd844F72A8edD323056130A86FC624D0dbcF5b0')
  })

  it('detects EIP-1967 beacon proxies', async () => {
    expect(
      await detectProxyTarget(
        '0xDd4e2eb37268B047f55fC5cAf22837F9EC08A881',
        mainnetProvider,
        BLOCK_TAG
      )
    ).toBe('0xE5C048792DCf2e4a56000C8b6a47F21dF22752D1')
  })

  it('detects EIP-1967 beacon variant proxies', async () => {
    expect(
      await detectProxyTarget(
        '0x114f1388fAB456c4bA31B1850b244Eedcd024136',
        mainnetProvider,
        BLOCK_TAG
      )
    ).toBe('0xfE8e4f1234c87418986fEFaE0c0e2642280ace82')
  })

  it('detects OpenZeppelin proxies', async () => {
    expect(
      await detectProxyTarget(
        '0xed7e6720Ac8525Ac1AEee710f08789D02cD87ecB',
        mainnetProvider,
        BLOCK_TAG
      )
    ).toBe('0xE3F3c590e044969294B1730AD8647692FAF0f604')
  })

  it('detects EIP-897 delegate proxies', async () => {
    expect(
      await detectProxyTarget(
        '0x0DA0C3e52C977Ed3cBc641fF02DD271c3ED55aFe',
        mainnetProvider,
        BLOCK_TAG
      )
    ).toBe('0x34CfAC646f301356fAa8B21e94227e3583Fe3F5F')
  })

  it('detects Gnosis Safe proxies', async () => {
    expect(
      await detectProxyTarget(
        '0x0DA0C3e52C977Ed3cBc641fF02DD271c3ED55aFe',
        mainnetProvider,
        BLOCK_TAG
      )
    ).toBe('0x34CfAC646f301356fAa8B21e94227e3583Fe3F5F')
  })

  it('resolves to null if no proxy target is detected', async () => {
    expect(
      await detectProxyTarget(
        '0x5864c777697Bf9881220328BF2f16908c9aFCD7e',
        mainnetProvider,
        BLOCK_TAG
      )
    ).toBe(null)
  })
})

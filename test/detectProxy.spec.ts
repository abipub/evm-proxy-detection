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

  it("detects Balancer's BatchRelayer", async () => {
    expect(
      await detectProxy(
        '0x35cea9e57a393ac66aaa7e25c391d52c74b5648f',
        requestFunc,
        BLOCK_TAG
      )
    ).toEqual({
      target: '0xea66501df1a00261e3bb79d1e90444fc6a186b62',
      immutable: true,
      type: 'BatchRelayer',
    })
  })

  it('detects EIP-2535 Diamond proxies', async () => {
    expect(
      await detectProxy(
        '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE',
        requestFunc,
        BLOCK_TAG
      )
    ).toEqual({
      target: [
        '0xf7993a8df974ad022647e63402d6315137c58abf',
        '0xf5ba8db6fea7af820de35c8d0c294e17dbc1b9d2',
        '0x6faa6906b9e4a59020e673910105567e809789e0',
        '0xdc49bca8314e7cd7c90edb8652375a0b15efe611',
        '0x22b31a1a81d5e594315c866616db793e799556c5',
        '0x77a13abb679a0dafb4435d1fa4ccc95d1ab51cfc',
        '0x03f58dc7e2195a0c6f501bc4819066fd9dfe307f',
        '0x108b0c3f20f266469fd2e98750926811ad632589',
        '0xc4e5f14dfe359653d66ae49b1f12177e6f99102b',
        '0x9a82bb477c30d92dab74875027e14d1de3510ef9',
        '0xac82fa2d953ee5c61d87686ade620b0728f484e6',
        '0x6f2baa7cd5f156ca1b132f7ff11e0fa2ad775f61',
        '0x3de506059ae0b239e125e6b1365cfa92100540c0',
        '0x88e0dd83e6da24bf317323e5ca06842406d57ed0',
        '0x7570e6b01e43df1b0c67f99c4156285adc36c360',
        '0x54678c366682a29112609882dc58def6753bfc27',
        '0x99fb0babba2c437153d25aff79dc80b905a27a5a',
        '0x29bedc1be2eecb654f7a9cd3f21b466c148186c2',
        '0x69cb467efd8044ac9edb88f363309ab1cbfa0a15',
        '0xa74c9c1b2194f27c372b0892839624852de21687',
        '0x5ac2c4836c45faae84c7d73065796ac863ffb8c6',
        '0x9fc3d15a029bfee6eb27e3d061210a465e231362',
        '0xef67be6d1a68ede5a21230629dfe896731adf947',
        '0x260fb3d593f6acb08e0aa380a123ce07d2bd4b7e',
        '0x4640aaaab3e6f5bb9b4a16fb00ea0dbd6d98b397',
        '0xfdb9a62a5f4f98a0c4e4b864eb22a9eecb0bce5f',
        '0x8bd90ea4ef3df26c385646f4f41e4c5e3c11bb2a',
        '0xfa93141130a11fdab7c6c800dfb93a5d19da6aa4',
        '0xbf4ad13fa0e6e05916a78c201f147c5152dbe1c9',
        '0x7a5c119ec5ddbf9631cf40f6e5db28f31d4332a0',
        '0x26fc055eaf6a6df15502f2466990528ec55c857d',
        '0xcaefac1ea4dec8fd866cbc5b6dd3054f80d49b80',
        '0x94ef6d1702ac7e30a5cef39dee26fab180c251fe',
        '0x8c9dba771220ed09580b77f0765e7153fbde7790',
        '0x65d6b9a368be49bca4964b66e54f828cab64b8f9',
        '0x23fc1b73e66cd13e988170cb94e252cb7ff88185',
        '0xf5ea5523185963d236675b8ac9e51a55d79a7345',
        '0xad3f1634a917924cbb54a0f76e43ca035d2b6bcd',
        '0x8cd89ea14345f24d0299c2180aec97a417ca34e3',
      ],
      immutable: false,
      type: 'Eip2535Diamond',
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

export enum ProxyType {
  Eip1167 = 'Eip1167',
  Eip1967Direct = 'Eip1967Direct',
  Eip1967Beacon = 'Eip1967Beacon',
  Eip1822 = 'Eip1822',
  Eip2535Diamond = 'Eip2535Diamond',
  Eip897 = 'Eip897',
  OpenZeppelin = 'OpenZeppelin',
  Safe = 'Safe',
  Comptroller = 'Comptroller',
  BatchRelayer = 'BatchRelayer',
}

interface SingleResult {
  target: `0x${string}`
  type: Exclude<ProxyType, ProxyType.Eip2535Diamond>
  immutable: boolean
}

interface DiamondResult {
  target: `0x${string}`[]
  type: ProxyType.Eip2535Diamond
  immutable: false
}

export type Result = SingleResult | DiamondResult

export type BlockTag = number | 'earliest' | 'latest' | 'pending'

export interface RequestArguments {
  method: string
  params: unknown[]
}

export type EIP1193ProviderRequestFunc = (
  args: RequestArguments
) => Promise<unknown>

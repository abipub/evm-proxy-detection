export enum ProxyType {
  Eip1167 = 'Eip1167',
  Eip1967Direct = 'Eip1967Direct',
  Eip1967Beacon = 'Eip1967Beacon',
  Eip1822 = 'Eip1822',
  Eip897 = 'Eip897',
  OpenZeppelin = 'OpenZeppelin',
  Safe = 'Safe',
  Comptroller = 'Comptroller',
  BatchRelayer = 'BatchRelayer',
}

export interface Result {
  target: `0x${string}`
  type: ProxyType
  immutable: boolean
}

export type BlockTag = number | 'earliest' | 'latest' | 'pending'

export interface RequestArguments {
  method: string
  params: unknown[]
}

export type EIP1193ProviderRequestFunc = (
  args: RequestArguments
) => Promise<unknown>

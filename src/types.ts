export type BlockTag = number | 'earliest' | 'latest' | 'pending';

export interface RequestArguments {
  method: string;
  params: unknown[];
}

export type EIP1193ProviderRequestFunc = (args: RequestArguments) => Promise<unknown>


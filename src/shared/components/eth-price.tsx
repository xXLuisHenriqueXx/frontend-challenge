/** Keeps decimal amounts as strings throughout presentation. */
export function EthPrice({ value }: { value: string | undefined }) {
  return <>{value} ETH</>;
}

const ETH_DECIMAL_PLACES = 18;
const ETH_SCALE = 10n ** BigInt(ETH_DECIMAL_PLACES);
export const units = (v: string) => {
  const [whole, fraction = ""] = v.split(".");
  return (
    BigInt(whole) * ETH_SCALE + BigInt(fraction.padEnd(ETH_DECIMAL_PLACES, "0"))
  );
};

export const decimal = (v: bigint) => {
  const s = (v % ETH_SCALE)
    .toString()
    .padStart(ETH_DECIMAL_PLACES, "0")
    .replace(/0+$/, "");
  return `${v / ETH_SCALE}${s ? `.${s}` : ""}`;
};

export const multiply = (v: string, quantity: number) =>
  decimal(units(v) * BigInt(quantity));

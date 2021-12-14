import { Record } from "immutable";

export default class Literal extends Record<{
  sign: boolean;
  symbol: string;
}>({
  sign: true,
  symbol: "default",
}) {
  constructor(sign: boolean, symbol: string) {
    super({ sign, symbol });
  }

  toString = (): string => {
    return `${this.sign ? "" : "¬"}${this.symbol}`;
  };
}

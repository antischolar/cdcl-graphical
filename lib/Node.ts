import Literal from "./Literal";

import { Record } from "immutable";

export default class Node extends Record<{
  decisionLevel: number;
  literal: Literal;
  clause: number;
  isDecisionLiteral: boolean;
  isConflictNode: boolean;
}>({
  decisionLevel: NaN,
  literal: new Literal(true, "default"),
  clause: NaN,
  isDecisionLiteral: false,
  isConflictNode: false,
}) {
  // Unfortunately, records require default values for every field. Those default
  // values can be null or undefined, but then that requires that our types permit
  // those values making client code more complicated with unnecessary checks.

  constructor(
    decisionLevel: number,
    literal: Literal,
    clause: number,
    isDecisionLiteral: boolean,
    isConflictNode: boolean = false
  ) {
    super({
      decisionLevel,
      literal,
      clause,
      isDecisionLiteral,
      isConflictNode,
    });
  }

  getLabel = (): string => {
    if (this.isConflictNode) {
      return `K : C_${this.clause + 1}`;
    }

    return `${this.literal.sign ? "" : "not "}${this.literal.symbol}@${
      this.decisionLevel
    }${this.isDecisionLiteral ? "" : ` : ${this.clause + 1}`}`;
  };
}

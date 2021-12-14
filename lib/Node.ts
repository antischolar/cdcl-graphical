import { Record } from "immutable";

import Literal from "./Literal";

export default class Node extends Record<{
  decisionLevel: number;
  literal: Literal;
  clause: number | null;
  isDecisionLiteral: boolean;
  isConflictNode: boolean;
}>({
  decisionLevel: NaN,
  literal: new Literal(true, "default"),
  clause: null,
  isDecisionLiteral: false,
  isConflictNode: false,
}) {
  // Unfortunately, records require default values for every field. Those default
  // values can be null or undefined, but then that requires that our types permit
  // those values making client code more complicated with unnecessary checks.

  constructor(
    decisionLevel: number,
    literal: Literal,
    clause: number | null,
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

  toString = (): string => {
    if (this.isConflictNode) {
      return `κ : C_${this.clause! + 1}`;
    }

    if (this.isDecisionLiteral) {
      return `${this.literal}@${this.decisionLevel}`;
    }

    return `${this.literal}@${this.decisionLevel} : C_${this.clause! + 1}`;
  };
}

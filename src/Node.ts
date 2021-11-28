import Literal from "./Literal";

export default class Node {
    decisionLevel: number;
    literal: Literal;
    clause: number;
    isDecisionLiteral: boolean;

    constructor(decisionLevel: number, literal: Literal, clause: number, isDecisionLiteral: boolean) {
        this.decisionLevel = decisionLevel;
        this.literal = literal;
        this.clause = clause;
        this.isDecisionLiteral = isDecisionLiteral;
    }
}
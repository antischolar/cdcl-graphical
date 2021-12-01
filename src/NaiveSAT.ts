import Literal from "./Literal";

export default class NaiveSAT {
    clauses: Array<Array<Literal>>;
    assignments: Map<String, Boolean>;
    literals: Array<String>;
    
    constructor(clauses: Array<Array<Literal>>) {
        this.clauses = [];
        this.literals = [];
        let literalSet: Set<String> = new Set<String>();
        clauses.forEach(c => {
            const clause: Array<Literal> = [];
            c.forEach(literal => {
                clause.push({...literal});
                literalSet.add(literal.symbol);
            });
            this.clauses.push(clause);
        });

        literalSet.forEach(val => {
            this.literals.push(val);
        });
        this.assignments = new Map();
    }

    addClause = (clause: Array<Literal>): void => {
        this.clauses.push(clause);
        let set: Set<String> = new Set<String>(this.literals);

        clause.forEach(lit => {
            set.add(lit.symbol);
        });

        this.literals = Array.from(set);
    }

    solve = (): Map<String, Boolean> => {
        this.solveHelper(0);

        return this.assignments;
    }

    solveHelper = (ind: number): void => {
        if (ind >= this.literals.length) {
            return;
        }

        this.assignments.set(this.literals[ind], true);

        if (!this.hasConflict()) {
            this.solveHelper(ind + 1);
            if (this.assignments.size === this.literals.length) {
                return;
            }
        }

        this.assignments.set(this.literals[ind], false);
        if (!this.hasConflict()) {
            this.solveHelper(ind + 1);
            if (this.assignments.size === this.literals.length) {
                return;
            }
        }

        this.assignments.delete(this.literals[ind]);
    }

    // return false if no conflict, true if there is a conflict
    hasConflict = (): boolean => {
        for (let i = 0; i < this.clauses.length; i++) {
            const clause = this.clauses[i];
            let res = this.evaluateClause(clause);
            if (typeof res === "boolean" && !res) {
                return true;
            }
        }

        return false;
    }

    // evaluates a given clause, return true if it's SAT, false if UNSAT, or a clause with unassigned variables
    // if not completely evaluated
    evaluateClause = (clause: Array<Literal>): Array<Literal> | boolean => {
        let simplifiedClause: Array<Literal> = [];
        let ret = false;

        clause.forEach(lit => {
            let result: boolean | Literal = this.evaluateLiteral(lit);
            if (typeof result !== "boolean") {
                // console.log(lit);
                simplifiedClause.push(lit);
                // console.log(simplifiedClause);
            } else if (result) {
                ret = true;
            }
        })

        if (ret) {
            return true;
        } else if (simplifiedClause.length > 0) {
            return simplifiedClause;
        }

        return false;
    }

    // evaluates a literal to either a boolean value or a Literal
    evaluateLiteral = (literal: Literal): boolean | Literal => {
        let assignedValue = this.assignments.get(literal.symbol);
        if (assignedValue === undefined) {
            return literal;
        }

        return assignedValue.valueOf() === literal.sign;
    }
}
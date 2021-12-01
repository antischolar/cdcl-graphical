import CDCL from "./cdcl";
import Literal from "./Literal";

let generateNegationClause = (a: Map<String, Boolean>): Array<Literal> => {
    let c: Array<Literal> = [];
    for (const entry of a.entries()) {
        const literal = new Literal(!entry[1].valueOf(), entry[0].valueOf());
        c.push(literal);
    }
    return c;
}

let literal1: Literal = new Literal(true, "p1");
let notliteral1: Literal = new Literal(false, "p1");
let literal2: Literal = new Literal(true, "p2");
let notliteral2: Literal = new Literal(false, "p2");
let literal3: Literal = new Literal(true, "p3");
let notliteral3: Literal = new Literal(false, "p3");
let literal4: Literal = new Literal(true, "p4");
let notliteral4: Literal = new Literal(false, "p4");
let literal5: Literal = new Literal(true, "p5");
let notliteral5: Literal = new Literal(false, "p5");
let literal6: Literal = new Literal(true, "p6");
let notliteral6: Literal = new Literal(false, "p6");
let literal7: Literal = new Literal(true, "p7");
let notliteral7: Literal = new Literal(false, "p7");
let literal8: Literal = new Literal(true, "p8");
let notliteral8: Literal = new Literal(false, "p8");

let clause1 = [notliteral1, literal2, notliteral4];
let clause2 = [notliteral1, notliteral2, literal3];
let clause3 = [notliteral3, notliteral4];
let clause4 = [literal4, literal5, literal6];
let clause5 = [notliteral5, literal7];
let clause6 = [notliteral6, literal7, notliteral8];
let clause7 = [notliteral1, notliteral2, notliteral4];
let clause8 = [notliteral1, notliteral2, literal4];
let clause9 = [notliteral1, notliteral2];
let clause10 = [notliteral1, literal2, literal4];


// let clauses = [clause1, clause2, clause3, clause4, clause5, clause6];

let clauses = [clause1]
// let clauses = [clause1, clause7, clause8, clause9, clause10];

let CDCLInstance1 = new CDCL(clauses)
let assignment = CDCLInstance1.solve();

while (assignment.size != 0) {
    // if (assignment.get("p1") && !assignment.get("p2") && !assignment.get("p4")) {
        console.log(new Map(assignment.toKeyedSeq()));
        // console.log(CDCLInstance1.clauses);
    // }
    const negationClause = generateNegationClause(new Map(assignment.toKeyedSeq()));
    CDCLInstance1 = new CDCL(Array.from(CDCLInstance1.clauses));
    CDCLInstance1.addClause(negationClause);
    assignment = CDCLInstance1.solve();
}

// console.log(assignment);
// console.log(CDCLInstance1.clauses);


// let clause11 = [notliteral1, notliteral2, notliteral5];
// let clause12 = [notliteral3, notliteral4, notliteral6];

// let clauses1 = [clause11, clause12];

// let CDCLInstance2 = new CDCL(clauses1);
// console.log(CDCLInstance2.solve());

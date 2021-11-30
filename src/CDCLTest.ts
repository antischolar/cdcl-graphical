import CDCL from "./cdcl";
import Literal from "./Literal";

let literal1: Literal = new Literal(true, "p1");
let literal2: Literal = new Literal(true, "p2");
let literal3: Literal = new Literal(true, "p3");

let clause1 = [literal1];
let clause2 = [literal2];
let clause3 = [literal3];

let clauses = [clause1, clause2, clause3];

let CDCLInstance = new CDCL(clauses)

console.log(CDCLInstance.solve());
import ImmutableGraph from "./ImmutableGraph";
import Literal from "./Literal";

export default class CDCL {
    clauses: Array<Array<Literal>>;
    assignments: Map<Literal, Boolean>;

    constructor(clauses: Array<Array<Literal>>) {
        
    }
}
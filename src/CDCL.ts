import Immutable, { Stack } from "immutable";
import ImmutableGraph from "./ImmutableGraph";
import Literal from "./Literal";
import Node from "./Node";

export default class CDCL {
    clauses: Array<Array<Literal>>;
    assignments: Map<String, Boolean>;
    unassigned: Set<String>;
    implicationGraph: ImmutableGraph<Node>;
    level: number;

    private readonly CONFLICT: boolean = true;

    constructor(clauses: Array<Array<Literal>>) {
        this.clauses = [];
        this.unassigned = new Set<String>();
        this.implicationGraph = new ImmutableGraph<Node>();
        clauses.forEach(c => {
            const clause: Array<Literal> = [];
            c.forEach(literal => {
                clause.push({...literal});
                this.unassigned.add(literal.symbol);
            });
            this.clauses.push(clause);
        });
        this.assignments = new Map();
        this.level = 0;
    }

    // returns a map that is a satisfying assignment
    solve = (): Map<String, Boolean> => {
        while (this.unassigned.size > 0) {
            while (this.unitProp() === this.CONFLICT) {
                if (this.level === 0) {
                    return new Map<String, Boolean>();
                } else {
                    let [b, C] = this.analyzeConflict();
                    this.clauses.push(C);
                    this.removeAllAtLevel(this.level);
                    this.level = b;
                }
            }

            this.level++;
            this.decideLiteral();
        }
        return this.assignments;
    }

    // implementation of the UnitProp() function provided in the lecture notes
    unitProp = (): boolean => {
        let [lit, ind] = this.findUnitClause();

        while (lit) {
            this.assignments.set(lit.symbol, lit.sign);
            this.unassigned.delete(lit.symbol);
            let forcedNode: Node = new Node(this.level, lit, ind, false);
            let forcingNodes: Array<Node> = this.collectForcingNodes(forcedNode.clause);
            this.addToGraph(forcedNode, forcingNodes);

            let potentialConflict: Node | undefined = this.findConflict();
            if (potentialConflict !== undefined) {
                let forcingConflictNodes = this.collectForcingNodes(potentialConflict.clause);
                this.addToGraph(potentialConflict, forcingConflictNodes);
                return this.CONFLICT;
            }

            [lit, ind] = this.findUnitClause();
        }

        return false;
    }

    // implementation of the AnalyzeConflict() function provided in the lecture notes
    analyzeConflict = (): [number, Array<Literal>] => {
        let firstUIP = this.findFirstUIP();

        let flattenedPaths: Map<Node, number> = new Map<Node, number>();

        this.findAllPathsFromNode(firstUIP).forEach(path => CDCL.union(flattenedPaths, path));

        let allNodesOnConflictSide: Set<Node> = new Set<Node>(flattenedPaths.keys());
        allNodesOnConflictSide.delete(firstUIP);

        let boundaryNodes: Array<Node> = [];
        this.implicationGraph.getVertices().forEach(v1 => {
            this.implicationGraph.getNeighbors(v1).forEach(v2 => {
                if (allNodesOnConflictSide.has(v2) && v1 !== firstUIP) {
                    boundaryNodes.push(v1);
                }
                return true;
            });
        });

        let literalsOnBoundary: Array<Literal> = boundaryNodes.map(n => {
            let valInAssignments: Boolean | undefined = this.assignments.get(n.literal.symbol);
            
            if (valInAssignments=== undefined) {
                throw new Error("assignment was undefined in the map. This is more likely an error in TS");
            }

            let sign: boolean = valInAssignments.valueOf();

            return new Literal(sign, n.literal.symbol);
        });
        let maxLevel: number = boundaryNodes.reduce((prev, currNode) => {
            if (currNode !== firstUIP && currNode.decisionLevel > prev.decisionLevel) {
                return currNode;
            }

            return prev;
        }).decisionLevel;


        return [maxLevel, literalsOnBoundary];
    }

    // removes all nodes at the specified level from the implication graph, as well as from the assignments 
    removeAllAtLevel = (level: number): void => {
        for (const vertex of this.implicationGraph.getVertices()){
            if (vertex.decisionLevel === level) {
                this.assignments.delete(vertex.literal.symbol);
                this.unassigned.add(vertex.literal.symbol);
                this.implicationGraph = this.implicationGraph.removeVertex(vertex);
            }
        }
    }

    // picks an unassigned literal to mark as true
    decideLiteral = (): void => {
        let literal: Literal = new Literal(true, Array.from(this.unassigned)[0].valueOf());

        let ind: number = 0;
        for (let i = 0; i < this.clauses.length; i++) {
            let clause: Array<Literal> = this.clauses[i];

            if (clause.find(l => l.symbol === literal.symbol) !== undefined) {
                ind = i;
                break;
            }
        }

        this.unassigned.delete(literal.symbol);
        this.assignments.set(literal.symbol, true);

        let node: Node = new Node(this.level, literal, ind, true);

        this.addToGraph(node);
    }

    // finds a unit clause in the clause database
    findUnitClause = (): [Literal | undefined, number] => {
        let simplifiedClause: Literal | undefined = undefined;
        let clauseIndex: number = this.clauses.findIndex(clause => {
            const evaluatedClause = this.evaluateClause(clause);
            if (typeof evaluatedClause !== "boolean" && evaluatedClause.length === 1) {
                simplifiedClause = evaluatedClause[0];
                return true;
            }
        });
        return [simplifiedClause, clauseIndex];
    }

    // finds a conflict in the clause database. Returns undefined in no conflicts are found
    findConflict = (): Node | undefined => {
        for (let i = 0; i < this.clauses.length; i++) {
            const clause = this.clauses[i]
            let res = this.evaluateClause(clause);
            if (typeof res === "boolean" && !res) {
                return new Node(this.level, new Literal(false , ""), i, false, true);
            }
        }

        return undefined;
    }

    // evaluates a given clause, return true if it's SAT, false if UNSAT, or a clause with unassigned variables
    // if not completely evaluated
    evaluateClause = (clause: Array<Literal>): Array<Literal> | boolean => {
        let simplifiedClause: Array<Literal> = [];

        clause.forEach(lit => {
            let result: boolean | Literal = this.evaluateLiteral(lit);
            if (result === lit) {
                simplifiedClause.push(lit);
            } else if (result === true) {
                return true;
            }
        })

        return simplifiedClause.length !== 0 ? simplifiedClause : false;
    }

    // evaluates a literal to either a boolean value or a Literal
    evaluateLiteral = (literal: Literal): boolean | Literal => {
        return this.assignments.has(literal.symbol) ? this.assignments.get(literal.symbol) === literal.sign : literal;
    }

    // finds and returns all UIPs in the implication graph
    findFirstUIP = (): Node => {
        let vertices: Immutable.Set<Node> = this.implicationGraph.getVertices();
        let highestDecisionLiteralNode: Node | undefined = vertices.find(n => n.decisionLevel === this.level && n.isDecisionLiteral);
        
        if (highestDecisionLiteralNode === undefined) {
            throw new Error("did not find a decision at the current decision level");
        }

        let potentialUIPs: Map<Node, number> = new Map<Node, number>();
        vertices.toSet().forEach(vertex => potentialUIPs.set(vertex, 0));
        let allPaths: Array<Map<Node, number>> = this.findAllPathsFromNode(highestDecisionLiteralNode);

        allPaths.forEach(path => potentialUIPs = CDCL.intersection(potentialUIPs, path));

        let firstUIP: Node | undefined = undefined;
        let maxDepth: number = 0;

        for (const entry of potentialUIPs.entries()) {
            if (entry[1] > maxDepth) {
                firstUIP = entry[0];
                maxDepth = entry[1];
            }
        }

        if (firstUIP === undefined) {
            throw new Error("no UIP was found");
        }


        return firstUIP;
    }

    // finds all nodes in the implication graph that decide the literals in the given clause
    collectForcingNodes = (clauseInd: number): Array<Node> => {
        let clause = this.clauses[clauseInd];
        let forcingNodes: Array<Node> = [];

        clause.forEach(lit => {
            if (this.assignments.has(lit.symbol)) {
                let node: Node | undefined = this.implicationGraph.getVertices().find(vertex => vertex.literal === lit);
                
                if (node === undefined) {
                    throw new Error("assigned literal does not have a node in the implication graph");
                }

                forcingNodes.push(node);
            }
        })

        return forcingNodes;
    }


    // adds a node to the implication graph, along with edges from its forcing nodes (if relevant)
    addToGraph = (node: Node, forcingNodes: Array<Node> = []): void => {
        this.implicationGraph = this.implicationGraph.addVertex(node);

        forcingNodes.forEach(fromNode => this.implicationGraph = this.implicationGraph.addEdge(fromNode, node));
    }

    // finds and returns all nodes on all paths starting at the node
    findAllPathsFromNode = (node: Node): Array<Map<Node, number>> => {
        let allPaths: Array<Map<Node, number>> = new Array<Map<Node, number>>();
        let path: Array<[Node, number]> = new Array<[Node, number]>();
        path.push([node, 0]);

        let findAllPathsHelper = (allPaths: Array<Map<Node, number>>, path: Array<[Node, number]>): void => {
            let n: [Node, number] = path[path.length - 1];

            let neighbors: Immutable.Set<Node> = this.implicationGraph.getNeighbors(n[0]);

            neighbors.forEach(neighbor => {
                // this is the conflict clause
                if (neighbor.isConflictNode) {
                    let pathMap: Map<Node, number> = new Map<Node, number>();
                    path.forEach(entry => pathMap.set(entry[0], entry[1]))
                    allPaths.push(pathMap);
                } else {
                    path.push([neighbor, path.length]);
                    findAllPathsHelper(allPaths, path);
                    path.pop();
                }
            });
        }

        findAllPathsHelper(allPaths, path);

        return allPaths;
    }

    // finds the intersection of the keys of the two maps, and sets their values to the max of both
    private static intersection = (set1: Map<Node, number>, set2: Map<Node, number>): Map<Node, number> => {
        let intersect: Map<Node, number> = new Map<Node, number>();

        for (let elem of set1.entries()) {
            if (set2.has(elem[0])) {
                let val = set2.get(elem[0]);

                if (val === undefined) {
                    throw new Error("path depth was not set for some reason");
                }

                intersect.set(elem[0], Math.max(elem[1], val));
            }
        }

        return intersect;
    }

    // finds the union of the keys of the two maps
    private static union = (set1: Map<Node, number>, set2: Map<Node, number>): Map<Node, number> => {
        let union: Map<Node, number> = new Map<Node, number>();

        for (let elem of set1.entries()) {
            union.set(elem[0], elem[1]);
        }

        for (let elem of set2.entries()) {
            union.set(elem[0], elem[1]);
        }

        return union;
    }
}
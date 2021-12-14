import Immutable from "immutable";
import ImmutableGraph from "./ImmutableGraph";
import Literal from "./Literal";
import Node from "./Node";
import Snapshot from "./Snapshot";

export default class CDCL {
  clauses: Immutable.List<Array<Literal>>;
  assignments: Immutable.Map<string, boolean>;
  unassigned: Immutable.Set<string>;
  implicationGraph: ImmutableGraph<Node>;
  level: number;

  history: Array<Snapshot>;
  private readonly CONFLICT: boolean = true;

  constructor(clauses: Array<Array<Literal>>) {
    this.clauses = Immutable.List();
    this.unassigned = Immutable.Set<string>();
    this.implicationGraph = new ImmutableGraph<Node>();
    clauses.forEach((c) => {
      const clause: Array<Literal> = [];
      c.forEach((literal) => {
        clause.push(literal);
        this.unassigned = this.unassigned.add(literal.symbol);
      });
      this.clauses = this.clauses.push(clause);
    });
    this.assignments = Immutable.Map<string, boolean>();
    this.level = 0;
    this.history = [];
  }

  addClause = (clause: Array<Literal>): void => {
    this.clauses = this.clauses.push(clause);

    clause.forEach((lit) => {
      if (!this.assignments.has(lit.symbol)) {
        this.unassigned = this.unassigned.add(lit.symbol);
      }
    });
  };

  // returns a map that is a satisfying assignment
  solve = (): Immutable.Map<string, boolean> => {
    while (this.unassigned.size > 0) {
      while (this.unitProp() === this.CONFLICT) {
        if (this.level === 0) {
          return Immutable.Map<string, boolean>();
        } else {
          const [b, C] = this.analyzeConflict();

          // console.log("solve", "C", C, "level", this.level, "b", b);
          this.clauses = this.clauses.push(C);

          this.removeAllAtLevelGreaterThan(b);
          this.level = b;
        }
      }

      this.level++;
      this.decideLiteral();

      // console.log("solve", "unassigned size", this.unassigned.size);
    }

    return this.assignments;
  };

  // implementation of the UnitProp() function provided in the lecture notes
  unitProp = (): boolean => {
    let [lit, ind] = this.findUnitClause();

    // console.log("unitProps", "lit", lit, "ind", ind);

    while (lit) {
      // console.log("unitProp", lit);
      this.assignments = this.assignments.set(lit.symbol, lit.sign);
      this.unassigned = this.unassigned.delete(lit.symbol);

      const forcedNode: Node = new Node(this.level, lit, ind, false);
      const forcingNodes: Array<Node> = this.collectForcingNodes(
        forcedNode.clause!,
        lit
      );
      this.addToGraph(forcedNode, forcingNodes);

      const potentialConflict: Node | undefined = this.findConflict();
      if (potentialConflict !== undefined) {
        const forcingConflictNodes = this.collectForcingNodes(
          potentialConflict.clause!
        );
        this.addToGraph(potentialConflict, forcingConflictNodes);
        return this.CONFLICT;
      }

      [lit, ind] = this.findUnitClause();
    }

    return false;
  };

  // implementation of the AnalyzeConflict() function provided in the lecture notes
  analyzeConflict = (): [number, Array<Literal>] => {
    const firstUIP = this.findFirstUIP();
    const conflictNode = this.getConflictNode();

    if (conflictNode === undefined || firstUIP === undefined) {
      throw new Error("graph is malformed");
    }

    let flattenedPaths: Map<Node, number> = new Map<Node, number>();

    this.findAllPathsFromNode(firstUIP).forEach((path) => {
      flattenedPaths = CDCL.union(flattenedPaths, path);
    });

    const allNodesOnConflictSide: Set<Node> = new Set<Node>(
      flattenedPaths.keys()
    );

    allNodesOnConflictSide.delete(firstUIP);
    allNodesOnConflictSide.add(conflictNode);

    const boundaryNodes: Set<Node> = new Set<Node>();
    this.implicationGraph.getVertices().forEach((v1) => {
      this.implicationGraph.getNeighbors(v1).forEach((v2) => {
        if (!allNodesOnConflictSide.has(v1) && allNodesOnConflictSide.has(v2)) {
          boundaryNodes.add(v1);
        }
        return true;
      });
      return true;
    });

    const boundaryNodesList = Array.from(boundaryNodes);

    const literalsOnBoundary: Array<Literal> = boundaryNodesList.map((n) => {
      return new Literal(!n.literal.sign, n.literal.symbol);
    });

    let maxLevel: number = -1;

    boundaryNodesList.forEach((n) => {
      if (n !== firstUIP && n.decisionLevel > maxLevel) {
        maxLevel = n.decisionLevel;
      }
    });

    return [maxLevel, literalsOnBoundary];
  };

  // removes all nodes strictly greater than the specified level from the implication graph, as well as from the assignments
  removeAllAtLevelGreaterThan = (level: number): void => {
    const vertices = this.implicationGraph.getVertices();
    for (const vertex of vertices) {
      if (vertex.decisionLevel > level) {
        if (!vertex.isConflictNode) {
          this.assignments = this.assignments.delete(vertex.literal.symbol);
          this.unassigned = this.unassigned.add(vertex.literal.symbol);
        }
        this.implicationGraph = this.implicationGraph.removeVertex(vertex);
      }
    }
    this.makeSnapshot();
  };

  // picks an unassigned literal to mark as true
  decideLiteral = (): void => {
    if (this.unassigned.size === 0) {
      return;
    }

    let literal: Literal = new Literal(true, Array.from(this.unassigned)[0]);

    let ind: number = 0;
    for (let i = 0; i < this.clauses.size; i++) {
      let clause: Array<Literal> | undefined = this.clauses.get(i);

      if (clause === undefined) {
        throw new Error("array out of bounds access");
      }

      if (clause.find((l) => l.symbol === literal.symbol) !== undefined) {
        ind = i;
        break;
      }
    }

    this.unassigned = this.unassigned.delete(literal.symbol);
    this.assignments = this.assignments.set(literal.symbol, true);

    // let node: Node = new Node(this.level, literal, null, true); // TODO!
    let node: Node = new Node(this.level, literal, ind, true);

    // console.log(
    //   "decideLiteral",
    //   node.decisionLevel,
    //   node.clause,
    //   node.isConflictNode,
    //   node.isDecisionLiteral
    // );

    this.addToGraph(node);
  };

  // finds a unit clause in the clause database
  findUnitClause = (): [Literal | undefined, number] => {
    // console.log("findUnitClause", "assignment", this.assignments.toString());

    let simplifiedClause: Literal | undefined = undefined;
    let clauseIndex: number = this.clauses.findIndex((clause) => {
      const evaluatedClause = this.evaluateClause(clause);
      // console.log(
      //   "findUnitClause",
      //   typeof evaluatedClause === "boolean"
      //     ? evaluatedClause
      //     : evaluatedClause.map((item) => item.toString())
      // );

      if (
        typeof evaluatedClause !== "boolean" &&
        evaluatedClause.length === 1
      ) {
        simplifiedClause = evaluatedClause[0];
        return true;
      }
      return false;
    });
    return [simplifiedClause, clauseIndex];
  };

  // finds a conflict in the clause database. Returns undefined in no conflicts are found
  findConflict = (): Node | undefined => {
    for (let i = 0; i < this.clauses.size; i++) {
      const clause: Array<Literal> | undefined = this.clauses.get(i);

      if (clause === undefined) {
        throw new Error("array out of bounds access");
      }

      let res = this.evaluateClause(clause);
      if (typeof res === "boolean" && !res) {
        return new Node(this.level, new Literal(false, ""), i, false, true);
      }
    }

    return undefined;
  };

  // evaluates a given clause, return true if it's SAT, false if UNSAT, or a clause with unassigned variables
  // if not completely evaluated
  evaluateClause = (clause: Array<Literal>): Array<Literal> | boolean => {
    let simplifiedClause: Array<Literal> = [];
    let ret = false;

    // console.log("evaluateClause", "clause", clause);

    clause.forEach((lit) => {
      // console.log("evaluateClause", "lit", lit.sign, lit.symbol);

      let result: boolean | Literal = this.evaluateLiteral(lit);
      if (typeof result !== "boolean") {
        simplifiedClause.push(lit);
      } else if (result) {
        ret = true;
      }
    });

    if (ret) {
      return true;
    } else if (simplifiedClause.length > 0) {
      return simplifiedClause;
    }

    return false;
  };

  // evaluates a literal to either a boolean value or a Literal
  evaluateLiteral = (literal: Literal): boolean | Literal => {
    let assignedValue = this.assignments.get(literal.symbol);

    // console.log(
    //   "evaluateLiteral",
    //   "literal",
    //   literal.toString(),
    // );

    if (assignedValue === undefined) {
      return literal;
    }

    return assignedValue === literal.sign;
  };

  // finds and returns the first UIP in the implication graph
  findFirstUIP = (): Node => {
    let vertices: Immutable.Set<Node> = this.implicationGraph.getVertices();
    let highestDecisionLiteralNode: Node | undefined = vertices.find(
      (n) => n.decisionLevel === this.level && n.isDecisionLiteral
    );

    if (highestDecisionLiteralNode === undefined) {
      throw new Error(
        "did not find a decision node at the current decision level"
      );
    }

    let potentialUIPs: Map<Node, number> = new Map<Node, number>();
    vertices.forEach((vertex) => {
      potentialUIPs.set(vertex, 0);
      return true;
    });
    let allPaths: Array<Map<Node, number>> = this.findAllPathsFromNode(
      highestDecisionLiteralNode
    );

    allPaths.forEach((path) => {
      potentialUIPs = CDCL.intersection(potentialUIPs, path);
    });

    let firstUIP: Node | undefined = undefined;
    let maxDepth: number = -1;

    for (const entry of potentialUIPs.entries()) {
      if (entry[1] > maxDepth) {
        firstUIP = entry[0];
        maxDepth = entry[1];
      }
    }

    if (firstUIP === undefined) {
      // console.log("findFirstUIP", "potentialUIPs", potentialUIPs);
      throw new Error("no UIP was found");
    }

    return firstUIP;
  };

  // finds all nodes in the implication graph that decide the literals in the given clause. Ignores the forcedLiteral
  // argument
  collectForcingNodes = (
    clauseInd: number,
    forcedLiteral?: Literal
  ): Array<Node> => {
    let clause: Array<Literal> | undefined = this.clauses.get(clauseInd);
    let forcingNodes: Array<Node> = [];

    if (clause === undefined) {
      throw new Error("array out of bounds access");
    }

    clause.forEach((lit) => {
      if (
        (forcedLiteral === undefined || !forcedLiteral.equals(lit)) &&
        this.assignments.has(lit.symbol)
      ) {
        let node: Node | undefined = this.implicationGraph
          .getVertices()
          .find((vertex) => vertex.literal.symbol === lit.symbol);

        if (node === undefined) {
          this.implicationGraph
            .getVertices()
            .forEach((vertex) =>
              console.log("collectForcingNodes", "vertex", vertex)
            );
          console.log(
            "collectForcingNodes",
            "assignments",
            this.assignments,
            "literal",
            lit
          );
          throw new Error(
            "assigned literal does not have a node in the implication graph"
          );
        }
        forcingNodes.push(node);
      }
    });
    return forcingNodes;
  };

  // adds a node to the implication graph, along with edges from its forcing nodes (if relevant)
  addToGraph = (node: Node, forcingNodes: Array<Node> = []): void => {
    this.implicationGraph = this.implicationGraph.addVertex(node);

    forcingNodes.forEach((fromNode) => {
      this.implicationGraph = this.implicationGraph.addEdge(fromNode, node);
    });

    this.makeSnapshot();
  };

  // finds and returns all nodes on all paths starting at the given node and ending at the conflict clause
  findAllPathsFromNode = (node: Node): Array<Map<Node, number>> => {
    let allPaths: Array<Map<Node, number>> = new Array<Map<Node, number>>();
    let path: Array<[Node, number]> = new Array<[Node, number]>();
    path.push([node, 0]);

    let findAllPathsHelper = (
      allPaths: Array<Map<Node, number>>,
      path: Array<[Node, number]>
    ): void => {
      let n: [Node, number] = path[path.length - 1];

      let neighbors: Immutable.Set<Node> = this.implicationGraph.getNeighbors(
        n[0]
      );

      neighbors.forEach((neighbor) => {
        // this is the conflict clause
        if (neighbor.isConflictNode) {
          let pathMap: Map<Node, number> = new Map<Node, number>();
          path.forEach((entry) => {
            pathMap.set(entry[0], entry[1]);
          });
          allPaths.push(pathMap);
        } else {
          path.push([neighbor, path.length]);
          findAllPathsHelper(allPaths, path);
          path.pop();
        }
        return true;
      });
    };

    findAllPathsHelper(allPaths, path);

    return allPaths;
  };

  getConflictNode = (): Node | undefined => {
    return this.implicationGraph
      .getVertices()
      .find((node) => node.isConflictNode);
  };

  // finds the intersection of the keys of the two maps, and sets their values to the max of both
  private static intersection = (
    set1: Map<Node, number>,
    set2: Map<Node, number>
  ): Map<Node, number> => {
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
  };

  // finds the union of the keys of the two maps
  private static union = (
    set1: Map<Node, number>,
    set2: Map<Node, number>
  ): Map<Node, number> => {
    let union: Map<Node, number> = new Map<Node, number>();

    for (let elem of set1.entries()) {
      union.set(elem[0], elem[1]);
    }

    for (let elem of set2.entries()) {
      union.set(elem[0], elem[1]);
    }

    return union;
  };

  private makeSnapshot = (): void => {
    const snap = new Snapshot(
      this.clauses,
      this.assignments,
      this.unassigned,
      this.implicationGraph,
      this.level
    );
    this.history.push(snap);
  };
}

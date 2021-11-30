import Immutable from "immutable";

// Implements an immutable graph for a given type.
export default class ImmutableGraph<Type> {
    v: Immutable.Set<Type>;
    e: Immutable.Map<Type, Immutable.Set<Type>>;

    constructor(v: Type[] = [], e: Map<Type, Type> = new Map<Type, Type>()) {
        this.v = Immutable.Set<Type>();
        this.e = Immutable.Map<Type, Immutable.Set<Type>>();

        v.forEach(vertex => {
            this.v = this.v.add(vertex);
        });

        e.forEach((v1: Type, v2: Type) => {
            this.e = this.e.set(v1, this.e.get(v1, Immutable.Set<Type>()).add(v2));
        });
    }

    getVertices = (): Immutable.Set<Type> => {
        return this.v;
    }

    getEdges = (): Immutable.Map<Type, Immutable.Set<Type>> => {
        return this.e;
    }

    getNeighbors = (v1: Type): Immutable.Set<Type> => {
        return this.e.get(v1, Immutable.Set<Type>());
    }

    hasEdge = (v1: Type, v2: Type): boolean => {
        return this.hasVertex(v1) && this.e.get(v1, Immutable.Set<Type>()).contains(v2);
    }

    hasVertex = (v1: Type): boolean => {
        return this.v.contains(v1);
    }

    addEdge = (v1: Type, v2: Type): ImmutableGraph<Type> => {
        let newMap = new ImmutableGraph<Type>();
        newMap.v = this.v;
        newMap.e = this.e.set(v1, this.e.get(v1, Immutable.Set<Type>()).add(v2));
        return newMap;
    }

    addVertex = (v1: Type): ImmutableGraph<Type> => {
        let newMap = new ImmutableGraph<Type>();
        newMap.v = this.v.add(v1);
        newMap.e = this.e;
        return newMap;
    }

    removeVertex = (v1: Type): ImmutableGraph<Type> => {
        let newMap = new ImmutableGraph<Type>();
        newMap.v = this.v.delete(v1);
        newMap.e = this.e.delete(v1);

        while (newMap.hasEdgeToVertex(v1)) {
            let vertexFrom = newMap.getVertexThatHasEdgeToVertex(v1);

            newMap.e.set(vertexFrom, newMap.e.get(vertexFrom, Immutable.Set<Type>()).delete(v1));
        }

        return newMap;
    }

    removeEdge = (v1: Type, v2: Type): ImmutableGraph<Type> => {
        if (!this.e.has(v1)) {
            return this;
        }

        let newMap = new ImmutableGraph<Type>();
        newMap.v = this.v;
        newMap.e = this.e;
        newMap.e.set(v1, this.e.get(v1, Immutable.Set<Type>()).delete(v2));

        return newMap;
    }

    private hasEdgeToVertex = (v2: Type): boolean => {
        for (const vertex of this.v) {
            if (this.hasEdge(vertex, v2)) {
                return true;
            }
        }

        return false;
    }

    private getVertexThatHasEdgeToVertex = (v2: Type): Type => {
        for (const vertex of this.v) {
            if (this.hasEdge(vertex, v2)) {
                return vertex;
            }
        }

        return v2;
    }
}
import Immutable from "immutable";

// Implements an immutable graph for a given type.
export default class ImmutableGraph<Type> {
    v: Immutable.Set<Type>;
    e: Immutable.Map<Type, Immutable.Set<Type>>;

    constructor(v?: Type[], e?: Map<Type, Type>) {
        this.v = Immutable.Set<Type>();
        this.e = Immutable.Map<Type, Immutable.Set<Type>>();

        v.forEach(vertex => {
            this.v = this.v.add(vertex);
        });

        e.forEach((v1: Type, v2: Type) => {
            this.e = this.e.set(v1, this.e.get(v1).add(v2));
        });
    }

    getVertices = (): Immutable.Set<Type> => {
        return this.v;
    }

    getEdges = (): Immutable.Map<Type, Immutable.Set<Type>> => {
        return this.e;
    }

    getNeighbors = (v1: Type): Immutable.Set<Type> => {
        return this.e.get(v1);
    }

    hasEdge = (v1: Type, v2: Type): boolean => {
        return this.hasVertex(v1) && this.e.get(v1).contains(v2);
    }

    hasVertex = (v1: Type): boolean => {
        return this.v.contains(v1);
    }

    addEdge = (v1: Type, v2: Type): ImmutableGraph<Type> => {
        let newMap = new ImmutableGraph<Type>();
        newMap.e = this.e.set(v1, this.e.get(v1).add(v2));
        newMap.v = this.v;
        return newMap;
    }

    addVertex = (v1: Type): ImmutableGraph<Type> => {
        let newMap = new ImmutableGraph<Type>();
        newMap.e = this.e;
        newMap.v = this.v.add(v1);
        return newMap;
    }
}
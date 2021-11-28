export default class Literal {
    neg: boolean;
    symbol: string;

    constructor(neg: boolean, symbol: string) {
        this.neg = neg;
        this.symbol = symbol;
    }
}
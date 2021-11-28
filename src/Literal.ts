export default class Literal {
    sign: boolean;
    symbol: string;

    constructor(sign: boolean, symbol: string) {
        this.sign = sign;
        this.symbol = symbol;
    }
}
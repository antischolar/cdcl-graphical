import Literal from "../lib/Literal";
import Button from "./Button";
import { useState, useCallback } from "react";

interface NavBarProps {
  solveNewFormula: (formula: Array<Array<Literal>>) => void;
}

const NavBar = ({ solveNewFormula }: NavBarProps) => {
  const [rawFormula, setRawFormula] = useState("");

  const onInput = useCallback((e) => setRawFormula(e.target.value), []);

  const onClick = useCallback(() => {
    const formula = parse(rawFormula);

    if (typeof formula === "string") {
      alert("Bad input!");
      return;
    }

    solveNewFormula(formula);
  }, [rawFormula, solveNewFormula]);

  return (
    <div className="flex flex-row justify-between align-middle flex-initial bg-blue-400 text-blue-900 p-4 text-lg">
      <div className="flex-initial place-content-center">
        <span className="font-bold">CDCL</span>
      </div>
      <div className="flex-auto p-4">
        <input
          className="placeholder:italic placeholder:text-gray-400 w-full block border border-gray-300 rounded-md p-2 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
          placeholder="(p1 \/ p2 \/ p3) /\ (!p2 \/ !p3)"
          type="text"
          onInput={onInput}
        />
      </div>

      <div className="p-4 flex-initial">
        <Button title="Solve" onClick={onClick} />
      </div>
    </div>
  );
};

export default NavBar;

function parse(rawFormula: string): Array<Array<Literal>> | string {
  const clauseStrs = rawFormula
    .split("/\\")
    .map((str) => str.trim().replaceAll(/\(|\)/g, ""));
  const listeralStrs = clauseStrs.map((clause) =>
    clause.split("\\/").map((str) => str.trim())
  );

  return listeralStrs.map((clause) =>
    clause.map((literal) =>
      literal.charAt(0) === "!"
        ? new Literal(false, literal.slice(1))
        : new Literal(true, literal)
    )
  );
}

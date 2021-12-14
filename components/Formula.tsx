import Literal from "../lib/Literal";

interface FormulaProps {
  formula: Array<Array<Literal>>;
  isSat?: boolean;
}

const Formula = ({ formula, isSat }: FormulaProps) => {
  return (
    <div className="flex flex-row">
      Formula {toUnicode(formula)} is {isSat ? "satisfiable" : "unsatisfiable"}.
    </div>
  );
};

export default Formula;

function toUnicode(formula: Array<Array<Literal>>): string {
  const clauses = formula.map((clause) => `(${clause.join(" ∨ ")})`);

  return clauses.join(" ∧ ");
}

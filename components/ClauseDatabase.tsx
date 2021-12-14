import Snapshot from "../lib/Snapshot";

interface ClauseDatabaseProps {
  snapshot: Snapshot;
}

const ClauseDatabase = ({ snapshot }: ClauseDatabaseProps) => {
  return (
    <div>
      <span className="font-bold">Clause Database:</span>
      <ul>
        {snapshot.clauses.toArray().map((literals, idx) => {
          const clause = literals.join(", ");
          return <li key={idx}>{`C_${idx + 1}: {${clause}}`}</li>;
        })}
      </ul>
    </div>
  );
};

export default ClauseDatabase;

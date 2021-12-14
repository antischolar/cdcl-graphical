import Snapshot from "../lib/Snapshot";

interface AssignmentProps {
  snapshot: Snapshot;
}

const Assignment = ({ snapshot }: AssignmentProps) => {
  return (
    <div>
      <span className="font-bold">Assignment:</span>
      <ul>
        {snapshot.assignments.toArray().map(([variable, value]) => (
          <li key={variable}>{`${variable} → ${value}`}</li>
        ))}
      </ul>
    </div>
  );
};

export default Assignment;

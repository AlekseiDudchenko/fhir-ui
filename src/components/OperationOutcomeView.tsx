interface Props {
  outcome: fhir4.OperationOutcome;
}

/**
 * Human-readable rendering of a FHIR OperationOutcome — the error shape
 * FHIR servers return for validation failures (e.g. HAPI's 422 on a
 * profile violation).
 */
export function OperationOutcomeView({ outcome }: Props) {
  const issues = outcome.issue ?? [];

  if (issues.length === 0) {
    return <p>The server returned an OperationOutcome without issues.</p>;
  }

  return (
    <table className="outcome-table">
      <thead>
        <tr>
          <th>Severity</th>
          <th>Location</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        {issues.map((issue, i) => (
          <tr key={i} className={`severity-${issue.severity}`}>
            <td>{issue.severity}</td>
            <td>{issue.expression?.join(', ') ?? issue.location?.join(', ') ?? '—'}</td>
            <td>{issue.diagnostics ?? issue.details?.text ?? issue.code}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

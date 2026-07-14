import type { CreateResult } from '../fhir/types';
import { OperationOutcomeView } from './OperationOutcomeView';

interface Props {
  result: CreateResult | null;
  resourceType: string;
}

/** Shows the outcome of the last create call: success with id, or errors. */
export function ResultPanel({ result, resourceType }: Props) {
  if (!result) return null;

  if (result.ok) {
    return (
      <div className="result result-ok" role="status">
        <strong>
          {resourceType} created — id: <code>{result.id}</code>
        </strong>
        {result.location && (
          <p>
            Location: <code>{result.location}</code>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="result result-error" role="alert">
      <strong>
        {result.status === 0
          ? 'Request failed (network / CORS)'
          : `Server rejected the resource (HTTP ${result.status})`}
      </strong>
      {result.outcome ? <OperationOutcomeView outcome={result.outcome} /> : <p>{result.error}</p>}
    </div>
  );
}

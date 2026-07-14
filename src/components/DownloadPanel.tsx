import { useState } from 'react';

interface Props {
  resource: fhir4.Resource;
  filename: string;
}

/** Shows the generated resource after download: filename + a collapsible JSON preview. */
export function DownloadPanel({ resource, filename }: Props) {
  const [showJson, setShowJson] = useState(false);

  return (
    <div className="result result-ok" role="status">
      <strong>
        Downloaded <code>{filename}</code>
      </strong>
      <p>
        <button type="button" className="link-button" onClick={() => setShowJson((v) => !v)}>
          {showJson ? 'Hide' : 'View'} JSON
        </button>
      </p>
      {showJson && <pre className="json-preview">{JSON.stringify(resource, null, 2)}</pre>}
    </div>
  );
}

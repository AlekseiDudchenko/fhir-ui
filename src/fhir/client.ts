import type { CreateResult } from './types';

export interface FhirServerSettings {
  baseUrl: string;
  /** Optional extra headers, e.g. { Authorization: "Bearer ..." } */
  headers?: Record<string, string>;
}

const FHIR_JSON = 'application/fhir+json';

/**
 * POST a resource to `{baseUrl}/{resourceType}` and normalize the outcome.
 *
 * Success (2xx) resolves with the new logical id (from the Location header or
 * the returned resource). Failure resolves with the parsed OperationOutcome
 * when the server returned one (e.g. HAPI validation errors as 422), or a
 * plain error message otherwise. Network errors are caught and reported the
 * same way so callers only ever deal with CreateResult.
 */
export async function createResource(
  settings: FhirServerSettings,
  resource: fhir4.Resource,
): Promise<CreateResult> {
  const url = `${settings.baseUrl.replace(/\/+$/, '')}/${resource.resourceType}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': FHIR_JSON,
        Accept: FHIR_JSON,
        ...settings.headers,
      },
      body: JSON.stringify(resource),
    });
  } catch (e) {
    return { ok: false, status: 0, error: e instanceof Error ? e.message : String(e) };
  }

  const body = await parseJsonBody(response);

  if (response.ok) {
    const location = response.headers.get('Location') ?? undefined;
    const id = extractId(location, body);
    return { ok: true, id: id ?? '(unknown)', location, resource: body ?? undefined };
  }

  if (body?.resourceType === 'OperationOutcome') {
    return { ok: false, status: response.status, outcome: body as fhir4.OperationOutcome };
  }
  return { ok: false, status: response.status, error: response.statusText || `HTTP ${response.status}` };
}

async function parseJsonBody(response: Response): Promise<any | null> {
  try {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

/** Pull the logical id out of "…/Patient/{id}/_history/1" or the resource body. */
function extractId(location: string | undefined, body: any): string | undefined {
  if (body?.id) return body.id;
  if (!location) return undefined;
  const match = location.match(/\/([^/]+)\/([^/]+)(?:\/_history\/\d+)?$/);
  return match?.[2] === '_history' ? undefined : match?.[2];
}

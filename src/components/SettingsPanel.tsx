import { useState } from 'react';
import type { FhirServerSettings } from '../fhir/client';
import { saveSettings } from '../settings';

interface Props {
  settings: FhirServerSettings;
  onChange: (settings: FhirServerSettings) => void;
}

/**
 * FHIR server connection settings. The base URL points at any FHIR R4
 * endpoint (HAPI, this project's fhir-mii-pipeline, a public test server…).
 * An optional bearer token is sent as an Authorization header.
 */
export function SettingsPanel({ settings, onChange }: Props) {
  const [baseUrl, setBaseUrl] = useState(settings.baseUrl);
  const [token, setToken] = useState(
    settings.headers?.Authorization?.replace(/^Bearer /, '') ?? '',
  );
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const next: FhirServerSettings = {
      baseUrl: baseUrl.trim(),
      ...(token.trim() ? { headers: { Authorization: `Bearer ${token.trim()}` } } : {}),
    };
    saveSettings(next);
    onChange(next);
    setSaved(true);
  }

  return (
    <form onSubmit={handleSave} className="form">
      <h2>FHIR server</h2>

      <label>
        Base URL
        <input
          type="url"
          required
          value={baseUrl}
          onChange={(e) => {
            setBaseUrl(e.target.value);
            setSaved(false);
          }}
          placeholder="http://localhost:8080/fhir"
        />
      </label>

      <label>
        Bearer token (optional)
        <input
          type="password"
          value={token}
          onChange={(e) => {
            setToken(e.target.value);
            setSaved(false);
          }}
          placeholder="leave empty for open servers"
        />
      </label>

      <button type="submit">Save</button>
      {saved && <span role="status"> Saved.</span>}
    </form>
  );
}

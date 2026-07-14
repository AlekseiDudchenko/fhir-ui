import type { FhirServerSettings } from './fhir/client';

const STORAGE_KEY = 'fhir-ui.settings';

export const DEFAULT_SETTINGS: FhirServerSettings = {
  baseUrl: 'http://localhost:8080/fhir',
};

export function loadSettings(): FhirServerSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.baseUrl === 'string') {
      return { baseUrl: parsed.baseUrl, headers: parsed.headers };
    }
  } catch {
    // fall through to defaults on malformed storage
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: FhirServerSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

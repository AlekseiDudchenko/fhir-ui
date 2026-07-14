import { useState } from 'react';
import { PatientForm } from './components/PatientForm';
import { ObservationForm } from './components/ObservationForm';
import { SettingsPanel } from './components/SettingsPanel';
import { loadSettings } from './settings';
import type { FhirServerSettings } from './fhir/client';

type Tab = 'patient' | 'observation' | 'settings';

export default function App() {
  const [tab, setTab] = useState<Tab>('patient');
  const [settings, setSettings] = useState<FhirServerSettings>(loadSettings);

  return (
    <main className="app">
      <header>
        <h1>FHIR UI</h1>
        <p className="subtitle">
          Enter clinical data, get FHIR R4 — posts to <code>{settings.baseUrl}</code>
        </p>
      </header>

      <nav className="tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'patient'}
          className={tab === 'patient' ? 'active' : ''}
          onClick={() => setTab('patient')}
        >
          Patient
        </button>
        <button
          role="tab"
          aria-selected={tab === 'observation'}
          className={tab === 'observation' ? 'active' : ''}
          onClick={() => setTab('observation')}
        >
          Observation
        </button>
        <button
          role="tab"
          aria-selected={tab === 'settings'}
          className={tab === 'settings' ? 'active' : ''}
          onClick={() => setTab('settings')}
        >
          Settings
        </button>
      </nav>

      {tab === 'patient' && <PatientForm settings={settings} />}
      {tab === 'observation' && <ObservationForm settings={settings} />}
      {tab === 'settings' && <SettingsPanel settings={settings} onChange={setSettings} />}
    </main>
  );
}

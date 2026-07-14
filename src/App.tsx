import { useState } from 'react';
import { PatientForm } from './components/PatientForm';
import { ObservationForm } from './components/ObservationForm';

type Tab = 'patient' | 'observation';

export default function App() {
  const [tab, setTab] = useState<Tab>('patient');

  return (
    <main className="app">
      <header>
        <h1>FHIR UI</h1>
        <p className="subtitle">Enter clinical data, download it as FHIR R4 JSON</p>
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
      </nav>

      {tab === 'patient' && <PatientForm />}
      {tab === 'observation' && <ObservationForm />}
    </main>
  );
}

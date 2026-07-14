import { describe, expect, it } from 'vitest';
import { toFhirObservation } from './observation';
import type { ObservationFormData } from '../types';

const form: ObservationFormData = {
  patientId: 'abc-123',
  status: 'final',
  loincCode: '2339-0',
  loincDisplay: 'Glucose [Mass/volume] in Blood',
  value: 5.4,
  unit: 'mmol/L',
  effectiveDateTime: '2026-07-14T10:30:00Z',
};

describe('toFhirObservation', () => {
  it('maps form data into a FHIR Observation', () => {
    const obs = toFhirObservation(form);

    expect(obs.resourceType).toBe('Observation');
    expect(obs.status).toBe('final');
    expect(obs.subject).toEqual({ reference: 'Patient/abc-123' });
    expect(obs.effectiveDateTime).toBe('2026-07-14T10:30:00Z');
  });

  it('codes the observation with LOINC', () => {
    const obs = toFhirObservation(form);

    expect(obs.code.coding).toEqual([
      {
        system: 'http://loinc.org',
        code: '2339-0',
        display: 'Glucose [Mass/volume] in Blood',
      },
    ]);
  });

  it('emits the value as a UCUM-coded Quantity', () => {
    const obs = toFhirObservation(form);

    expect(obs.valueQuantity).toEqual({
      value: 5.4,
      unit: 'mmol/L',
      system: 'http://unitsofmeasure.org',
      code: 'mmol/L',
    });
  });

  it('marks the observation as a laboratory result', () => {
    const obs = toFhirObservation(form);

    expect(obs.category?.[0]?.coding?.[0]?.code).toBe('laboratory');
  });
});

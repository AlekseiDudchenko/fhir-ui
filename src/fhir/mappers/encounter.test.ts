import { describe, expect, it } from 'vitest';
import { toFhirEncounter } from './encounter';
import type { EncounterFormData } from '../types';

const baseForm: EncounterFormData = {
  patientId: 'pid-12345',
  status: 'in-progress',
  encounterClass: 'IMP',
  periodStart: '2026-07-14T08:00:00Z',
};

describe('toFhirEncounter', () => {
  it('maps required fields into a FHIR Encounter with the MII Fall profile', () => {
    const encounter = toFhirEncounter(baseForm);

    expect(encounter.resourceType).toBe('Encounter');
    expect(encounter.meta?.profile).toEqual([
      'https://www.medizininformatik-initiative.de/fhir/core/modul-fall/StructureDefinition/KontaktGesundheitseinrichtung',
    ]);
    expect(encounter.status).toBe('in-progress');
    expect(encounter.subject).toEqual({ reference: 'Patient/pid-12345' });
    expect(encounter.period).toEqual({ start: '2026-07-14T08:00:00Z' });
  });

  it('codes the class against EncounterClassDE (v3-ActCode)', () => {
    const encounter = toFhirEncounter(baseForm);

    expect(encounter.class).toEqual({
      system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
      code: 'IMP',
    });
  });

  it('includes period.end only when given', () => {
    expect(toFhirEncounter(baseForm).period?.end).toBeUndefined();
    expect(toFhirEncounter({ ...baseForm, periodEnd: '2026-07-20T10:00:00Z' }).period?.end).toBe(
      '2026-07-20T10:00:00Z',
    );
  });

  it('emits the admission number as the Aufnahmenummer identifier slice (type VN)', () => {
    const encounter = toFhirEncounter({ ...baseForm, admissionNumber: 'VN-987' });

    expect(encounter.identifier).toEqual([
      {
        type: {
          coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0203', code: 'VN' }],
        },
        system: 'https://hospital.example.org/aufnahmenummer',
        value: 'VN-987',
      },
    ]);
  });

  it('omits identifier when no admission number is given', () => {
    expect(toFhirEncounter(baseForm).identifier).toBeUndefined();
  });

  it('emits Kontaktebene and KontaktArt as separate type slices', () => {
    const encounter = toFhirEncounter({
      ...baseForm,
      kontaktebene: 'abteilungskontakt',
      kontaktart: 'normalstationaer',
    });

    expect(encounter.type).toEqual([
      { coding: [{ system: 'http://fhir.de/CodeSystem/Kontaktebene', code: 'abteilungskontakt' }] },
      { coding: [{ system: 'http://fhir.de/CodeSystem/kontaktart-de', code: 'normalstationaer' }] },
    ]);
  });

  it('omits type when neither Kontaktebene nor KontaktArt is given', () => {
    expect(toFhirEncounter(baseForm).type).toBeUndefined();
  });

  it('codes the department as the Fachabteilungsschluessel slice', () => {
    const encounter = toFhirEncounter({ ...baseForm, departmentCode: '0100' });

    expect(encounter.serviceType).toEqual({
      coding: [{ system: 'http://fhir.de/CodeSystem/dkgev/Fachabteilungsschluessel', code: '0100' }],
    });
  });

  it('codes the admit source against the DKG Aufnahmeanlass value set', () => {
    const encounter = toFhirEncounter({ ...baseForm, admitSource: 'E' });

    expect(encounter.hospitalization).toEqual({
      admitSource: {
        coding: [{ system: 'http://fhir.de/CodeSystem/dgkev/Aufnahmeanlass', code: 'E' }],
      },
    });
  });

  it('sets serviceProvider as a display-only reference', () => {
    const encounter = toFhirEncounter({ ...baseForm, serviceProvider: 'Universitätsklinikum Beispiel' });

    expect(encounter.serviceProvider).toEqual({ display: 'Universitätsklinikum Beispiel' });
  });
});

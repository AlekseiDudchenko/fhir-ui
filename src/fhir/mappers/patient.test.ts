import { describe, expect, it } from 'vitest';
import { toFhirPatient } from './patient';
import type { PatientFormData } from '../types';

const baseForm: PatientFormData = {
  pidSystem: 'https://hospital.example.org/pid',
  pidValue: 'PID-12345',
  familyName: 'Mustermann',
  givenName: 'Max',
  gender: 'male',
  birthDate: '1980-05-15',
};

describe('toFhirPatient', () => {
  it('maps required fields into a FHIR Patient', () => {
    const patient = toFhirPatient(baseForm);

    expect(patient.resourceType).toBe('Patient');
    expect(patient.name).toEqual([
      { use: 'official', family: 'Mustermann', given: ['Max'] },
    ]);
    expect(patient.gender).toBe('male');
    expect(patient.birthDate).toBe('1980-05-15');
  });

  it('emits the PID as the MII identifier:pid slice (type MR)', () => {
    const patient = toFhirPatient(baseForm);

    expect(patient.identifier).toEqual([
      {
        type: {
          coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0203', code: 'MR' }],
        },
        system: 'https://hospital.example.org/pid',
        value: 'PID-12345',
      },
    ]);
  });

  it('emits the KVNR as the MII versichertenId_GKV slice with IKNR assigner', () => {
    const patient = toFhirPatient({ ...baseForm, kvnr: 'A123456789', iknr: '260326822' });

    expect(patient.identifier).toHaveLength(2);
    expect(patient.identifier?.[1]).toEqual({
      type: {
        coding: [{ system: 'http://fhir.de/CodeSystem/identifier-type-de-basis', code: 'GKV' }],
      },
      system: 'http://fhir.de/sid/gkv/kvid-10',
      value: 'A123456789',
      assigner: {
        identifier: { system: 'http://fhir.de/sid/arge-ik/iknr', value: '260326822' },
      },
    });
  });

  it('omits the GKV identifier when no KVNR is given', () => {
    const patient = toFhirPatient(baseForm);
    expect(patient.identifier).toHaveLength(1);
  });

  it.each([
    ['divers', 'D'],
    ['unbestimmt', 'X'],
  ] as const)('maps %s to gender "other" with the gender-amtlich-de extension', (gender, code) => {
    const patient = toFhirPatient({ ...baseForm, gender });

    expect(patient.gender).toBe('other');
    expect(patient._gender).toEqual({
      extension: [
        {
          url: 'http://fhir.de/StructureDefinition/gender-amtlich-de',
          valueCoding: {
            system: 'http://fhir.de/CodeSystem/gender-amtlich-de',
            code,
            display: gender,
          },
        },
      ],
    });
  });

  it('adds no gender extension for plain FHIR genders', () => {
    const patient = toFhirPatient({ ...baseForm, gender: 'female' });

    expect(patient.gender).toBe('female');
    expect(patient._gender).toBeUndefined();
  });

  it('omits address when no address fields are set', () => {
    const patient = toFhirPatient(baseForm);
    expect(patient.address).toBeUndefined();
  });

  it('emits only the address parts that were filled in', () => {
    const patient = toFhirPatient({ ...baseForm, city: 'Berlin', country: 'DE' });

    expect(patient.address).toEqual([{ type: 'both', city: 'Berlin', country: 'DE' }]);
  });

  it('includes the full address when everything is filled in', () => {
    const patient = toFhirPatient({
      ...baseForm,
      addressLine: 'Musterstr. 1',
      city: 'Berlin',
      postalCode: '10115',
      country: 'DE',
    });

    expect(patient.address).toEqual([
      {
        type: 'both',
        line: ['Musterstr. 1'],
        city: 'Berlin',
        postalCode: '10115',
        country: 'DE',
      },
    ]);
  });
});

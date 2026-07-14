import { describe, expect, it } from 'vitest';
import { toFhirPatient } from './patient';
import type { PatientFormData } from '../types';

const baseForm: PatientFormData = {
  identifierSystem: 'https://hospital.example.org/pid',
  identifierValue: 'PID-12345',
  familyName: 'Mustermann',
  givenName: 'Max',
  gender: 'male',
  birthDate: '1980-05-15',
};

describe('toFhirPatient', () => {
  it('maps required fields into a FHIR Patient', () => {
    const patient = toFhirPatient(baseForm);

    expect(patient.resourceType).toBe('Patient');
    expect(patient.identifier).toEqual([
      { system: 'https://hospital.example.org/pid', value: 'PID-12345' },
    ]);
    expect(patient.name).toEqual([
      { use: 'official', family: 'Mustermann', given: ['Max'] },
    ]);
    expect(patient.gender).toBe('male');
    expect(patient.birthDate).toBe('1980-05-15');
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

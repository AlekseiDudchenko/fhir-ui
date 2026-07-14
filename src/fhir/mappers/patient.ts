import type { PatientFormData } from '../types';

/**
 * Build a FHIR R4 Patient from flat form data.
 *
 * Pure function: no I/O, no defaults invented beyond what FHIR requires
 * structurally. Optional address parts are only emitted when present so the
 * resulting JSON stays minimal.
 */
export function toFhirPatient(form: PatientFormData): fhir4.Patient {
  const patient: fhir4.Patient = {
    resourceType: 'Patient',
    identifier: [
      {
        system: form.identifierSystem,
        value: form.identifierValue,
      },
    ],
    name: [
      {
        use: 'official',
        family: form.familyName,
        given: [form.givenName],
      },
    ],
    gender: form.gender,
    birthDate: form.birthDate,
  };

  const address = buildAddress(form);
  if (address) {
    patient.address = [address];
  }

  return patient;
}

function buildAddress(form: PatientFormData): fhir4.Address | undefined {
  const hasAny = form.addressLine || form.city || form.postalCode || form.country;
  if (!hasAny) return undefined;

  const address: fhir4.Address = { type: 'both' };
  if (form.addressLine) address.line = [form.addressLine];
  if (form.city) address.city = form.city;
  if (form.postalCode) address.postalCode = form.postalCode;
  if (form.country) address.country = form.country;
  return address;
}

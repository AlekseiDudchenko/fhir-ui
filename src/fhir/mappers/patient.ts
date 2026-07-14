import type { PatientFormData } from '../types';

// MII Kerndatensatz Person module, Patient profile:
// https://simplifier.net/medizininformatikinitiative-modulperson
// Identifier slice systems are fixed by the profile / de.basisprofil.r4.
const V2_0203 = 'http://terminology.hl7.org/CodeSystem/v2-0203';
const DE_IDENTIFIER_TYPE = 'http://fhir.de/CodeSystem/identifier-type-de-basis';
const KVID_SYSTEM = 'http://fhir.de/sid/gkv/kvid-10';
const IKNR_SYSTEM = 'http://fhir.de/sid/arge-ik/iknr';
const GENDER_AMTLICH_EXT = 'http://fhir.de/StructureDefinition/gender-amtlich-de';
const GENDER_AMTLICH_CS = 'http://fhir.de/CodeSystem/gender-amtlich-de';
const MII_PATIENT_PROFILE =
  'https://www.medizininformatik-initiative.de/fhir/core/modul-person/StructureDefinition/Patient';

/**
 * Build a FHIR R4 Patient conforming to the MII Kerndatensatz Person profile.
 *
 * - `identifier:pid` slice — organization-internal Patient-ID, type MR
 * - `identifier:versichertenId_GKV` slice — KVNR with the insurer's IKNR as
 *   assigner (the profile requires assigner 1..1 inside this slice)
 * - German administrative gender: "divers" (D) / "unbestimmt" (X) map to
 *   FHIR `other` plus the gender-amtlich-de extension
 *
 * Pure function: no I/O; optional parts are only emitted when present.
 */
export function toFhirPatient(form: PatientFormData): fhir4.Patient {
  const identifiers: fhir4.Identifier[] = [
    {
      type: { coding: [{ system: V2_0203, code: 'MR' }] },
      system: form.pidSystem,
      value: form.pidValue,
    },
  ];

  if (form.kvnr) {
    identifiers.push({
      type: { coding: [{ system: DE_IDENTIFIER_TYPE, code: 'GKV' }] },
      system: KVID_SYSTEM,
      value: form.kvnr,
      assigner: {
        identifier: { system: IKNR_SYSTEM, value: form.iknr },
      },
    });
  }

  const patient: fhir4.Patient = {
    resourceType: 'Patient',
    meta: { profile: [MII_PATIENT_PROFILE] },
    identifier: identifiers,
    name: [
      {
        use: 'official',
        family: form.familyName,
        given: [form.givenName],
      },
    ],
    ...mapGender(form.gender),
    birthDate: form.birthDate,
  };

  const address = buildAddress(form);
  if (address) {
    patient.address = [address];
  }

  return patient;
}

function mapGender(
  gender: PatientFormData['gender'],
): Pick<fhir4.Patient, 'gender' | '_gender'> {
  if (gender !== 'divers' && gender !== 'unbestimmt') {
    return { gender };
  }
  const code = gender === 'divers' ? 'D' : 'X';
  return {
    gender: 'other',
    _gender: {
      extension: [
        {
          url: GENDER_AMTLICH_EXT,
          valueCoding: { system: GENDER_AMTLICH_CS, code, display: gender },
        },
      ],
    },
  };
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

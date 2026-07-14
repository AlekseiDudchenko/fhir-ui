import type { EncounterFormData } from '../types';

// MII Kerndatensatz Fall module, "KontaktGesundheitseinrichtung" profile:
// https://github.com/medizininformatik-initiative/kerndatensatzmodul-fall
// Terminology systems (German basis profiles):
// https://github.com/hl7germany/basisprofil-de-r4
const MII_ENCOUNTER_PROFILE =
  'https://www.medizininformatik-initiative.de/fhir/core/modul-fall/StructureDefinition/KontaktGesundheitseinrichtung';
const V2_0203 = 'http://terminology.hl7.org/CodeSystem/v2-0203';
const V3_ACT_CODE = 'http://terminology.hl7.org/CodeSystem/v3-ActCode';
const KONTAKTEBENE_SYSTEM = 'http://fhir.de/CodeSystem/Kontaktebene';
const KONTAKTART_SYSTEM = 'http://fhir.de/CodeSystem/kontaktart-de';
const FACHABTEILUNGSSCHLUESSEL_SYSTEM = 'http://fhir.de/CodeSystem/dkgev/Fachabteilungsschluessel';
const AUFNAHMEANLASS_SYSTEM = 'http://fhir.de/CodeSystem/dgkev/Aufnahmeanlass';

/**
 * Build a FHIR R4 Encounter conforming to the MII Kerndatensatz Fall module,
 * "KontaktGesundheitseinrichtung" profile.
 *
 * - `identifier:Aufnahmenummer` slice (optional) — admission number, type VN
 * - `class` — EncounterClassDE (v3-ActCode: AMB/IMP/PRENC/VR/SS/HH)
 * - `type:Kontaktebene` / `type:KontaktArt` slices (optional)
 * - `hospitalization.admitSource` / `serviceType.coding:Fachabteilungsschluessel`
 *   reference the DKG value sets — entered as raw codes (see EncounterFormData)
 *
 * Pure function: no I/O; optional parts are only emitted when present.
 */
export function toFhirEncounter(form: EncounterFormData): fhir4.Encounter {
  const encounter: fhir4.Encounter = {
    resourceType: 'Encounter',
    meta: { profile: [MII_ENCOUNTER_PROFILE] },
    status: form.status,
    class: { system: V3_ACT_CODE, code: form.encounterClass },
    subject: { reference: `Patient/${form.patientId}` },
    period: { start: form.periodStart, ...(form.periodEnd ? { end: form.periodEnd } : {}) },
  };

  if (form.admissionNumber) {
    encounter.identifier = [
      {
        type: { coding: [{ system: V2_0203, code: 'VN' }] },
        system: 'https://hospital.example.org/aufnahmenummer',
        value: form.admissionNumber,
      },
    ];
  }

  const type = buildType(form);
  if (type) {
    encounter.type = type;
  }

  if (form.departmentCode) {
    encounter.serviceType = {
      coding: [{ system: FACHABTEILUNGSSCHLUESSEL_SYSTEM, code: form.departmentCode }],
    };
  }

  if (form.admitSource) {
    encounter.hospitalization = {
      admitSource: { coding: [{ system: AUFNAHMEANLASS_SYSTEM, code: form.admitSource }] },
    };
  }

  if (form.serviceProvider) {
    encounter.serviceProvider = { display: form.serviceProvider };
  }

  return encounter;
}

function buildType(form: EncounterFormData): fhir4.CodeableConcept[] | undefined {
  const codings: fhir4.Coding[] = [];
  if (form.kontaktebene) codings.push({ system: KONTAKTEBENE_SYSTEM, code: form.kontaktebene });
  if (form.kontaktart) codings.push({ system: KONTAKTART_SYSTEM, code: form.kontaktart });
  if (codings.length === 0) return undefined;
  return codings.map((coding) => ({ coding: [coding] }));
}

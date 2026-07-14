import type { ObservationFormData } from '../types';

const LOINC_SYSTEM = 'http://loinc.org';
const UCUM_SYSTEM = 'http://unitsofmeasure.org';

/**
 * Build a FHIR R4 Observation (laboratory category, Quantity value) from
 * flat form data. Pure function — see patient.ts for the rationale.
 */
export function toFhirObservation(form: ObservationFormData): fhir4.Observation {
  return {
    resourceType: 'Observation',
    status: form.status,
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'laboratory',
            display: 'Laboratory',
          },
        ],
      },
    ],
    code: {
      coding: [
        {
          system: LOINC_SYSTEM,
          code: form.loincCode,
          display: form.loincDisplay,
        },
      ],
      text: form.loincDisplay,
    },
    subject: {
      reference: `Patient/${form.patientId}`,
    },
    effectiveDateTime: form.effectiveDateTime,
    valueQuantity: {
      value: form.value,
      unit: form.unit,
      system: UCUM_SYSTEM,
      code: form.unit,
    },
  };
}

// Form-level models: flat fields convenient for data entry.
// Pure mapper functions in ./mappers convert these into FHIR R4 resources.

export interface PatientFormData {
  identifierSystem: string;
  identifierValue: string;
  familyName: string;
  givenName: string;
  gender: 'male' | 'female' | 'other' | 'unknown';
  birthDate: string; // YYYY-MM-DD
  addressLine?: string;
  city?: string;
  postalCode?: string;
  country?: string; // ISO 3166 two-letter code, e.g. "DE"
}

export interface ObservationFormData {
  patientId: string; // logical id of an existing Patient
  status: 'registered' | 'preliminary' | 'final' | 'amended';
  loincCode: string;
  loincDisplay: string;
  value: number;
  unit: string; // UCUM code, e.g. "mmol/L"
  effectiveDateTime: string; // ISO 8601
}

/** Result of a create call against a FHIR server. */
export type CreateResult =
  | { ok: true; id: string; location?: string; resource?: fhir4.Resource }
  | { ok: false; status: number; outcome?: fhir4.OperationOutcome; error?: string };

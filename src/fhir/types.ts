// Form-level models: flat fields convenient for data entry.
// Pure mapper functions in ./mappers convert these into FHIR R4 resources.

/**
 * Patient entry fields aligned with the MII Core Data Set (Kerndatensatz),
 * Person module — see https://simplifier.net/medizininformatikinitiative-modulperson
 *
 * Administrative gender follows the German model: "divers" (D) and
 * "unbestimmt" (X) map to FHIR `other` plus the gender-amtlich-de extension.
 */
export interface PatientFormData {
  /** Organization-internal Patient-ID (MII `identifier:pid` slice, type MR) */
  pidSystem: string;
  pidValue: string;
  /** Statutory health insurance number, KVNR (MII `identifier:versichertenId_GKV` slice) */
  kvnr?: string;
  /** IKNR of the insurer — required by MII as the GKV identifier's assigner */
  iknr?: string;
  familyName: string;
  givenName: string;
  gender: 'male' | 'female' | 'divers' | 'unbestimmt' | 'unknown';
  birthDate: string; // YYYY-MM-DD
  addressLine?: string;
  city?: string;
  postalCode?: string;
  country?: string; // ISO 3166 two-letter code, e.g. "DE"
}

export interface ObservationFormData {
  patientId: string; // Patient-ID referenced by this Observation
  status: 'registered' | 'preliminary' | 'final' | 'amended';
  loincCode: string;
  loincDisplay: string;
  value: number;
  unit: string; // UCUM code, e.g. "mmol/L"
  effectiveDateTime: string; // ISO 8601
}

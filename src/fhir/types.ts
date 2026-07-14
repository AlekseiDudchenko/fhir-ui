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

/**
 * Encounter entry fields aligned with the MII Core Data Set (Kerndatensatz),
 * Fall module, "KontaktGesundheitseinrichtung" profile — see
 * https://github.com/medizininformatik-initiative/kerndatensatzmodul-fall
 *
 * `admitSource` and `departmentCode` reference the DKG value sets
 * (Aufnahmeanlass / Fachabteilungsschlüssel), which are large open code
 * lists — entered as free-text codes rather than a hardcoded dropdown.
 */
export interface EncounterFormData {
  patientId: string; // Patient-ID referenced by this Encounter
  /** identifier:Aufnahmenummer slice (optional, type VN) */
  admissionNumber?: string;
  status: 'planned' | 'in-progress' | 'onleave' | 'finished' | 'cancelled' | 'unknown';
  /** EncounterClassDE (v3-ActCode) */
  encounterClass: 'AMB' | 'IMP' | 'PRENC' | 'VR' | 'SS' | 'HH';
  /** type:Kontaktebene slice (optional) */
  kontaktebene?: 'einrichtungskontakt' | 'abteilungskontakt' | 'versorgungsstellenkontakt';
  /** type:KontaktArt slice (optional) */
  kontaktart?:
    | 'vorstationaer'
    | 'nachstationaer'
    | 'teilstationaer'
    | 'normalstationaer'
    | 'intensivstationaer'
    | 'ub'
    | 'konsil'
    | 'stationsaequivalent'
    | 'operation'
    | 'begleitperson';
  periodStart: string; // ISO 8601
  periodEnd?: string; // ISO 8601
  /** DKG Fachabteilungsschlüssel code, e.g. "0100" (Innere Medizin) */
  departmentCode?: string;
  /** DKG Aufnahmeanlass code, e.g. "E" (Einweisung durch Arzt) */
  admitSource?: string;
  /** Treating institution display name (Encounter.serviceProvider.display) */
  serviceProvider?: string;
}

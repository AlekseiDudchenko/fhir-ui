import type { PatientFormData } from './fhir/types';

// Random demo data for quickly trying the form. Names and insurers are
// fictional; identifiers follow the real formats (KVNR: letter + 9 digits,
// IKNR: 9 digits) so MII validation passes.

const FAMILY_NAMES = ['Mustermann', 'Schmidt', 'Meyer', 'Fischer', 'Weber', 'Wagner', 'Becker', 'Hoffmann'];
const GIVEN_NAMES = ['Max', 'Anna', 'Lukas', 'Mia', 'Paul', 'Emma', 'Felix', 'Lea'];
const CITIES = [
  { city: 'Berlin', postalCode: '10115' },
  { city: 'Hamburg', postalCode: '20095' },
  { city: 'München', postalCode: '80331' },
  { city: 'Köln', postalCode: '50667' },
  { city: 'Leipzig', postalCode: '04109' },
];
const STREETS = ['Hauptstr.', 'Bahnhofstr.', 'Gartenweg', 'Lindenallee', 'Schulstr.'];
const GENDERS: PatientFormData['gender'][] = ['male', 'female', 'divers', 'unbestimmt', 'unknown'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function digits(n: number): string {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('');
}

function randomBirthDate(): string {
  const year = 1930 + Math.floor(Math.random() * 90);
  const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
  const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function randomPatientFormData(): PatientFormData {
  const place = pick(CITIES);
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));

  return {
    pidSystem: 'https://hospital.example.org/pid',
    pidValue: `PID-${digits(5)}`,
    kvnr: `${letter}${digits(9)}`,
    iknr: digits(9),
    familyName: pick(FAMILY_NAMES),
    givenName: pick(GIVEN_NAMES),
    gender: pick(GENDERS),
    birthDate: randomBirthDate(),
    addressLine: `${pick(STREETS)} ${1 + Math.floor(Math.random() * 120)}`,
    ...place,
    country: 'DE',
  };
}

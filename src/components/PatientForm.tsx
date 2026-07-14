import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createResource, type FhirServerSettings } from '../fhir/client';
import { toFhirPatient } from '../fhir/mappers/patient';
import type { CreateResult } from '../fhir/types';
import { ResultPanel } from './ResultPanel';

const schema = z
  .object({
    pidSystem: z.string().url('Must be a URL (identifier system)'),
    pidValue: z.string().min(1, 'Required'),
    kvnr: z
      .string()
      .regex(/^[A-Z]\d{9}$/, 'Capital letter + 9 digits, e.g. A123456789')
      .optional()
      .or(z.literal('')),
    iknr: z
      .string()
      .regex(/^\d{9}$/, '9 digits, e.g. 260326822')
      .optional()
      .or(z.literal('')),
    familyName: z.string().min(1, 'Required'),
    givenName: z.string().min(1, 'Required'),
    gender: z.enum(['male', 'female', 'divers', 'unbestimmt', 'unknown']),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
    addressLine: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    country: z
      .string()
      .regex(/^[A-Z]{2}$/, 'Two-letter ISO code, e.g. DE')
      .optional()
      .or(z.literal('')),
  })
  // MII: inside the GKV identifier slice the assigner (insurer IKNR) is mandatory
  .refine((v) => !v.kvnr || !!v.iknr, {
    message: 'IKNR is required when a KVNR is given (MII: assigner 1..1)',
    path: ['iknr'],
  });

type FormValues = z.infer<typeof schema>;

interface Props {
  settings: FhirServerSettings;
}

export function PatientForm({ settings }: Props) {
  const [result, setResult] = useState<CreateResult | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      pidSystem: 'https://hospital.example.org/pid',
      gender: 'unknown',
    },
  });

  async function onSubmit(values: FormValues) {
    const patient = toFhirPatient({
      ...values,
      kvnr: values.kvnr || undefined,
      iknr: values.iknr || undefined,
      country: values.country || undefined,
    });
    setResult(await createResource(settings, patient));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form">
      <h2>New Patient</h2>

      <p className="info-note">
        This form produces a FHIR R4 <code>Patient</code> conforming to the{' '}
        <strong>MII Core Data Set (Kerndatensatz), Person module</strong> — the FHIR
        specification of the German Medical Informatics Initiative used for research data
        sharing across university hospitals. Spec:{' '}
        <a
          href="https://simplifier.net/medizininformatikinitiative-modulperson"
          target="_blank"
          rel="noreferrer"
        >
          Simplifier package
        </a>{' '}
        ·{' '}
        <a
          href="https://www.medizininformatik-initiative.de/en/medical-informatics-initiatives-core-data-set"
          target="_blank"
          rel="noreferrer"
        >
          MII Core Data Set
        </a>
      </p>

      <fieldset>
        <legend>Patient-ID (MII identifier:pid)</legend>
        <label>
          System
          <input {...register('pidSystem')} />
          {errors.pidSystem && <span className="error">{errors.pidSystem.message}</span>}
        </label>
        <label>
          Value
          <input {...register('pidValue')} placeholder="PID-12345" />
          {errors.pidValue && <span className="error">{errors.pidValue.message}</span>}
        </label>
      </fieldset>

      <fieldset>
        <legend>Health insurance — GKV (optional, MII identifier:versichertenId_GKV)</legend>
        <label>
          KVNR (Krankenversichertennummer)
          <input {...register('kvnr')} placeholder="A123456789" />
          {errors.kvnr && <span className="error">{errors.kvnr.message}</span>}
        </label>
        <label>
          Insurer IKNR (Institutionskennzeichen)
          <input {...register('iknr')} placeholder="260326822" />
          {errors.iknr && <span className="error">{errors.iknr.message}</span>}
        </label>
      </fieldset>

      <fieldset>
        <legend>Name & demographics</legend>
        <label>
          Family name
          <input {...register('familyName')} placeholder="Mustermann" />
          {errors.familyName && <span className="error">{errors.familyName.message}</span>}
        </label>
        <label>
          Given name
          <input {...register('givenName')} placeholder="Max" />
          {errors.givenName && <span className="error">{errors.givenName.message}</span>}
        </label>
        <label>
          Gender (German administrative)
          <select {...register('gender')}>
            <option value="male">male</option>
            <option value="female">female</option>
            <option value="divers">divers (D)</option>
            <option value="unbestimmt">unbestimmt / indeterminate (X)</option>
            <option value="unknown">unknown</option>
          </select>
        </label>
        <label>
          Birth date
          <input type="date" {...register('birthDate')} />
          {errors.birthDate && <span className="error">{errors.birthDate.message}</span>}
        </label>
      </fieldset>

      <fieldset>
        <legend>Address (optional)</legend>
        <label>
          Street
          <input {...register('addressLine')} placeholder="Musterstr. 1" />
        </label>
        <label>
          City
          <input {...register('city')} placeholder="Berlin" />
        </label>
        <label>
          Postal code
          <input {...register('postalCode')} placeholder="10115" />
        </label>
        <label>
          Country
          <input {...register('country')} placeholder="DE" />
          {errors.country && <span className="error">{errors.country.message}</span>}
        </label>
      </fieldset>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending…' : 'Create Patient'}
      </button>

      <ResultPanel result={result} resourceType="Patient" />
    </form>
  );
}

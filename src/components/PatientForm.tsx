import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createResource, type FhirServerSettings } from '../fhir/client';
import { toFhirPatient } from '../fhir/mappers/patient';
import type { CreateResult } from '../fhir/types';
import { ResultPanel } from './ResultPanel';

const schema = z.object({
  identifierSystem: z.string().url('Must be a URL (identifier system)'),
  identifierValue: z.string().min(1, 'Required'),
  familyName: z.string().min(1, 'Required'),
  givenName: z.string().min(1, 'Required'),
  gender: z.enum(['male', 'female', 'other', 'unknown']),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
  addressLine: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z
    .string()
    .regex(/^[A-Z]{2}$/, 'Two-letter ISO code, e.g. DE')
    .optional()
    .or(z.literal('')),
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
      identifierSystem: 'https://hospital.example.org/pid',
      gender: 'unknown',
    },
  });

  async function onSubmit(values: FormValues) {
    const patient = toFhirPatient({
      ...values,
      country: values.country || undefined,
    });
    setResult(await createResource(settings, patient));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form">
      <h2>New Patient</h2>

      <fieldset>
        <legend>Identifier</legend>
        <label>
          System
          <input {...register('identifierSystem')} />
          {errors.identifierSystem && <span className="error">{errors.identifierSystem.message}</span>}
        </label>
        <label>
          Value
          <input {...register('identifierValue')} placeholder="PID-12345" />
          {errors.identifierValue && <span className="error">{errors.identifierValue.message}</span>}
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
          Gender
          <select {...register('gender')}>
            <option value="male">male</option>
            <option value="female">female</option>
            <option value="other">other</option>
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

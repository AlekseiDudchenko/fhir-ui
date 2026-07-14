import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createResource, type FhirServerSettings } from '../fhir/client';
import { toFhirObservation } from '../fhir/mappers/observation';
import type { CreateResult } from '../fhir/types';
import { ResultPanel } from './ResultPanel';

const schema = z.object({
  patientId: z.string().min(1, 'Required — id of an existing Patient'),
  status: z.enum(['registered', 'preliminary', 'final', 'amended']),
  loincCode: z.string().regex(/^\d+-\d$/, 'LOINC code, e.g. 2339-0'),
  loincDisplay: z.string().min(1, 'Required'),
  value: z.coerce.number().finite('Must be a number'),
  unit: z.string().min(1, 'UCUM unit, e.g. mmol/L'),
  effectiveDateTime: z.string().min(1, 'Required'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  settings: FhirServerSettings;
}

export function ObservationForm({ settings }: Props) {
  const [result, setResult] = useState<CreateResult | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'final' },
  });

  async function onSubmit(values: FormValues) {
    // datetime-local yields "2026-07-14T10:30" — make it a valid FHIR dateTime
    const observation = toFhirObservation({
      ...values,
      effectiveDateTime: new Date(values.effectiveDateTime).toISOString(),
    });
    setResult(await createResource(settings, observation));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form">
      <h2>New Observation (lab value)</h2>

      <label>
        Patient id
        <input {...register('patientId')} placeholder="id returned when creating the Patient" />
        {errors.patientId && <span className="error">{errors.patientId.message}</span>}
      </label>

      <label>
        Status
        <select {...register('status')}>
          <option value="registered">registered</option>
          <option value="preliminary">preliminary</option>
          <option value="final">final</option>
          <option value="amended">amended</option>
        </select>
      </label>

      <fieldset>
        <legend>Code (LOINC)</legend>
        <label>
          Code
          <input {...register('loincCode')} placeholder="2339-0" />
          {errors.loincCode && <span className="error">{errors.loincCode.message}</span>}
        </label>
        <label>
          Display
          <input {...register('loincDisplay')} placeholder="Glucose [Mass/volume] in Blood" />
          {errors.loincDisplay && <span className="error">{errors.loincDisplay.message}</span>}
        </label>
      </fieldset>

      <fieldset>
        <legend>Value</legend>
        <label>
          Value
          <input type="number" step="any" {...register('value')} placeholder="5.4" />
          {errors.value && <span className="error">{errors.value.message}</span>}
        </label>
        <label>
          Unit (UCUM)
          <input {...register('unit')} placeholder="mmol/L" />
          {errors.unit && <span className="error">{errors.unit.message}</span>}
        </label>
      </fieldset>

      <label>
        Effective date/time
        <input type="datetime-local" {...register('effectiveDateTime')} />
        {errors.effectiveDateTime && <span className="error">{errors.effectiveDateTime.message}</span>}
      </label>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending…' : 'Create Observation'}
      </button>

      <ResultPanel result={result} resourceType="Observation" />
    </form>
  );
}

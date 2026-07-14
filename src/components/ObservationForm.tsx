import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toFhirObservation } from '../fhir/mappers/observation';
import { downloadResource, slugify } from '../download';
import { DownloadPanel } from './DownloadPanel';

const schema = z.object({
  patientId: z.string().min(1, 'Required — the Patient-ID used in the Patient JSON'),
  status: z.enum(['registered', 'preliminary', 'final', 'amended']),
  loincCode: z.string().regex(/^\d+-\d$/, 'LOINC code, e.g. 2339-0'),
  loincDisplay: z.string().min(1, 'Required'),
  value: z.coerce.number().finite('Must be a number'),
  unit: z.string().min(1, 'UCUM unit, e.g. mmol/L'),
  effectiveDateTime: z.string().min(1, 'Required'),
});

type FormValues = z.infer<typeof schema>;

export function ObservationForm() {
  const [downloaded, setDownloaded] = useState<{
    resource: fhir4.Observation;
    filename: string;
  } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'final' },
  });

  function onSubmit(values: FormValues) {
    // datetime-local yields "2026-07-14T10:30" — make it a valid FHIR dateTime
    const observation = toFhirObservation({
      ...values,
      effectiveDateTime: new Date(values.effectiveDateTime).toISOString(),
    });
    const filename = `observation-${slugify(values.loincCode)}-${slugify(values.patientId)}.json`;
    downloadResource(observation, filename);
    setDownloaded({ resource: observation, filename });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form">
      <h2>New Observation (lab value)</h2>

      <label>
        Patient id
        <input {...register('patientId')} placeholder="the Patient-ID from the downloaded Patient JSON" />
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

      <button type="submit">Download Observation JSON</button>

      {downloaded && <DownloadPanel resource={downloaded.resource} filename={downloaded.filename} />}
    </form>
  );
}

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toFhirEncounter } from '../fhir/mappers/encounter';
import { downloadResource, slugify } from '../download';
import { DownloadPanel } from './DownloadPanel';

const schema = z.object({
  patientId: z.string().min(1, 'Required — the Patient-ID from the downloaded Patient JSON'),
  admissionNumber: z.string().optional(),
  status: z.enum(['planned', 'in-progress', 'onleave', 'finished', 'cancelled', 'unknown']),
  encounterClass: z.enum(['AMB', 'IMP', 'PRENC', 'VR', 'SS', 'HH']),
  kontaktebene: z
    .enum(['einrichtungskontakt', 'abteilungskontakt', 'versorgungsstellenkontakt', ''])
    .optional(),
  kontaktart: z
    .enum([
      'vorstationaer',
      'nachstationaer',
      'teilstationaer',
      'normalstationaer',
      'intensivstationaer',
      'ub',
      'konsil',
      'stationsaequivalent',
      'operation',
      'begleitperson',
      '',
    ])
    .optional(),
  periodStart: z.string().min(1, 'Required'),
  periodEnd: z.string().optional(),
  departmentCode: z.string().optional(),
  admitSource: z.string().optional(),
  serviceProvider: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function EncounterForm() {
  const [downloaded, setDownloaded] = useState<{
    resource: fhir4.Encounter;
    filename: string;
  } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'in-progress', encounterClass: 'IMP' },
  });

  function onSubmit(values: FormValues) {
    // datetime-local yields "2026-07-14T08:00" — make it a valid FHIR dateTime
    const encounter = toFhirEncounter({
      ...values,
      kontaktebene: values.kontaktebene || undefined,
      kontaktart: values.kontaktart || undefined,
      admissionNumber: values.admissionNumber || undefined,
      departmentCode: values.departmentCode || undefined,
      admitSource: values.admitSource || undefined,
      serviceProvider: values.serviceProvider || undefined,
      periodStart: new Date(values.periodStart).toISOString(),
      periodEnd: values.periodEnd ? new Date(values.periodEnd).toISOString() : undefined,
    });
    const filename = `encounter-${slugify(values.patientId)}-${slugify(values.periodStart)}.json`;
    downloadResource(encounter, filename);
    setDownloaded({ resource: encounter, filename });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form">
      <h2>New Encounter (Fall)</h2>

      <p className="info-note">
        This form produces a FHIR R4 <code>Encounter</code> conforming to the{' '}
        <strong>MII Core Data Set (Kerndatensatz), Fall module</strong> — the profile for a
        patient's contact with a healthcare facility (inpatient/outpatient stay, department).
        Spec:{' '}
        <a
          href="https://github.com/medizininformatik-initiative/kerndatensatzmodul-fall"
          target="_blank"
          rel="noreferrer"
        >
          GitHub source
        </a>{' '}
        ·{' '}
        <a
          href="https://www.medizininformatik-initiative.de/Kerndatensatz/Modul_Fall/EinfachesAufbaumodell.html"
          target="_blank"
          rel="noreferrer"
        >
          MII Modul Fall
        </a>
      </p>

      <label>
        Patient id
        <input {...register('patientId')} placeholder="the Patient-ID from the downloaded Patient JSON" />
        {errors.patientId && <span className="error">{errors.patientId.message}</span>}
      </label>

      <label>
        Admission number (optional, identifier:Aufnahmenummer)
        <input {...register('admissionNumber')} placeholder="VN-987" />
      </label>

      <fieldset>
        <legend>Status & class</legend>
        <label>
          Status
          <select {...register('status')}>
            <option value="planned">planned</option>
            <option value="in-progress">in-progress</option>
            <option value="onleave">onleave</option>
            <option value="finished">finished</option>
            <option value="cancelled">cancelled</option>
            <option value="unknown">unknown</option>
          </select>
        </label>
        <label>
          Class (EncounterClassDE)
          <select {...register('encounterClass')}>
            <option value="AMB">ambulatory</option>
            <option value="IMP">inpatient encounter</option>
            <option value="PRENC">pre-admission</option>
            <option value="VR">virtual</option>
            <option value="SS">short stay</option>
            <option value="HH">home health</option>
          </select>
        </label>
      </fieldset>

      <fieldset>
        <legend>Contact type (optional)</legend>
        <label>
          Kontaktebene
          <select {...register('kontaktebene')}>
            <option value="">—</option>
            <option value="einrichtungskontakt">Einrichtungskontakt (facility)</option>
            <option value="abteilungskontakt">Abteilungskontakt (department)</option>
            <option value="versorgungsstellenkontakt">Versorgungsstellenkontakt (care site)</option>
          </select>
        </label>
        <label>
          KontaktArt
          <select {...register('kontaktart')}>
            <option value="">—</option>
            <option value="vorstationaer">vorstationär</option>
            <option value="nachstationaer">nachstationär</option>
            <option value="teilstationaer">teilstationäre Behandlung</option>
            <option value="normalstationaer">normalstationär</option>
            <option value="intensivstationaer">intensivstationär</option>
            <option value="ub">Untersuchung und Behandlung</option>
            <option value="konsil">Konsil</option>
            <option value="stationsaequivalent">stationsäquivalent</option>
            <option value="operation">Operation</option>
            <option value="begleitperson">Begleitperson</option>
          </select>
        </label>
      </fieldset>

      <fieldset>
        <legend>Period</legend>
        <label>
          Start
          <input type="datetime-local" {...register('periodStart')} />
          {errors.periodStart && <span className="error">{errors.periodStart.message}</span>}
        </label>
        <label>
          End (optional)
          <input type="datetime-local" {...register('periodEnd')} />
        </label>
      </fieldset>

      <fieldset>
        <legend>Department & admission (optional)</legend>
        <label>
          Fachabteilungsschlüssel (DKG code)
          <input {...register('departmentCode')} placeholder="0100 = Innere Medizin" />
          <span className="hint">
            <a
              href="https://www.dkgev.de/themen/digitalisierung-daten/informationstechnik-im-krankenhaus/verzeichnisse-und-register/"
              target="_blank"
              rel="noreferrer"
            >
              DKG code list
            </a>
          </span>
        </label>
        <label>
          Aufnahmeanlass (DKG code)
          <input {...register('admitSource')} placeholder="E = Einweisung durch Arzt" />
        </label>
        <label>
          Treating institution
          <input {...register('serviceProvider')} placeholder="Universitätsklinikum Beispiel" />
        </label>
      </fieldset>

      <button type="submit">Download Encounter JSON</button>

      {downloaded && <DownloadPanel resource={downloaded.resource} filename={downloaded.filename} />}
    </form>
  );
}

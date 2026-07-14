/** Trigger a browser download of a FHIR resource as pretty-printed JSON. */
export function downloadResource(resource: fhir4.Resource, filename: string): void {
  const blob = new Blob([JSON.stringify(resource, null, 2)], { type: 'application/fhir+json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/** Turn arbitrary text into a safe filename fragment (letters, digits, - and _). */
export function slugify(value: string): string {
  const cleaned = value.trim().replace(/[^a-zA-Z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
  return cleaned || 'resource';
}

export type MetadataField = { id: string; key: string; value: string };

export function metadataFieldsToRecord(fields: MetadataField[]): Record<string, string> {
  const metadata: Record<string, string> = {};
  for (const field of fields) {
    const key = field.key.trim();
    const value = field.value.trim();
    if (!key && !value) continue;
    if (!key || !value) throw new Error('Every specification needs both a name and a value.');
    if (Object.hasOwn(metadata, key)) throw new Error(`Specification “${key}” has been added more than once.`);
    metadata[key] = value;
  }
  return metadata;
}

import { describe, expect, it } from 'vitest';
import { metadataFieldsToRecord } from './product-metadata';

describe('metadataFieldsToRecord', () => {
  it('converts an unlimited list of fields into product metadata', () => {
    expect(metadataFieldsToRecord([
      { id: '1', key: 'RAM', value: '32 GB' },
      { id: '2', key: 'Serial number', value: 'ABC-123' },
      { id: '3', key: 'Color', value: 'Space black' },
    ])).toEqual({ RAM: '32 GB', 'Serial number': 'ABC-123', Color: 'Space black' });
  });

  it('ignores a completely empty row', () => {
    expect(metadataFieldsToRecord([{ id: '1', key: '', value: '' }])).toEqual({});
  });

  it('rejects incomplete or duplicate fields', () => {
    expect(() => metadataFieldsToRecord([{ id: '1', key: 'RAM', value: '' }])).toThrow('both a name and a value');
    expect(() => metadataFieldsToRecord([{ id: '1', key: 'RAM', value: '16 GB' }, { id: '2', key: 'RAM', value: '32 GB' }])).toThrow('more than once');
  });
});

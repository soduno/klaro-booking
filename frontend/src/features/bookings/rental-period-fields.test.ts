import { describe, expect, it } from 'vitest';
import { addRentalDays, combineDateTime, splitDateTime } from './rental-period-fields';

describe('rental period helpers', () => {
  it('splits and combines local date and time values', () => {
    expect(splitDateTime('2030-02-10T09:30')).toEqual({ date: '2030-02-10', time: '09:30' });
    expect(combineDateTime('2030-02-10', '', '09:00')).toBe('2030-02-10T09:00');
  });

  it('creates quick return dates from the pickup time', () => {
    expect(addRentalDays('2030-02-10T09:30', 3)).toBe('2030-02-13T09:30');
  });
});

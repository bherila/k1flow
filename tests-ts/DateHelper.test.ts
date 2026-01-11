import { DateHelper, parseDate } from '@/lib/DateHelper';

describe('DateHelper', () => {
  describe('toInputDate', () => {
    it('returns empty string for null value', () => {
      expect(DateHelper.toInputDate(null)).toBe('');
    });

    it('returns empty string for undefined value', () => {
      expect(DateHelper.toInputDate(undefined)).toBe('');
    });

    it('returns empty string for empty string', () => {
      expect(DateHelper.toInputDate('')).toBe('');
    });

    it('returns value as-is when already in YYYY-MM-DD format', () => {
      expect(DateHelper.toInputDate('2024-01-15')).toBe('2024-01-15');
      expect(DateHelper.toInputDate('2023-12-31')).toBe('2023-12-31');
      expect(DateHelper.toInputDate('1999-06-01')).toBe('1999-06-01');
    });

    it('extracts date from Laravel datetime format (YYYY-MM-DD HH:mm:ss)', () => {
      expect(DateHelper.toInputDate('2024-01-15 00:00:00')).toBe('2024-01-15');
      expect(DateHelper.toInputDate('2023-12-31 23:59:59')).toBe('2023-12-31');
      expect(DateHelper.toInputDate('2024-06-15 12:30:45')).toBe('2024-06-15');
    });

    it('extracts date from datetime with milliseconds (YYYY-MM-DD HH:mm:ss.SSS)', () => {
      expect(DateHelper.toInputDate('2024-01-15 00:00:00.000')).toBe('2024-01-15');
      expect(DateHelper.toInputDate('2023-12-31 23:59:59.999')).toBe('2023-12-31');
    });

    it('handles ISO 8601 format with T separator', () => {
      expect(DateHelper.toInputDate('2024-01-15T00:00:00')).toBe('2024-01-15');
      expect(DateHelper.toInputDate('2024-01-15T12:30:45.000Z')).toBe('2024-01-15');
    });

    it('falls back to parseDate for other formats', () => {
      // These formats are handled by parseDate fallback
      expect(DateHelper.toInputDate('01/15/2024')).toBe('2024-01-15');
      expect(DateHelper.toInputDate('15 Jan 2024')).toBe('2024-01-15');
    });

    it('returns empty string for invalid date strings', () => {
      expect(DateHelper.toInputDate('not-a-date')).toBe('');
      expect(DateHelper.toInputDate('invalid')).toBe('');
    });
  });
});

describe('parseDate', () => {
  it('returns null for null/undefined/empty input', () => {
    expect(parseDate(null)).toBeNull();
    expect(parseDate(undefined)).toBeNull();
    expect(parseDate('')).toBeNull();
  });

  it('parses YYYY-MM-DD format', () => {
    const result = parseDate('2024-01-15');
    expect(result).not.toBeNull();
    expect(result?.formatYMD()).toBe('2024-01-15');
  });

  it('parses MM/DD/YYYY format', () => {
    const result = parseDate('01/15/2024');
    expect(result).not.toBeNull();
    expect(result?.formatYMD()).toBe('2024-01-15');
  });

  it('parses DD MMM YYYY format', () => {
    const result = parseDate('15 Jan 2024');
    expect(result).not.toBeNull();
    expect(result?.formatYMD()).toBe('2024-01-15');
  });

  it('wraps Date objects', () => {
    const date = new Date(2024, 0, 15); // January 15, 2024
    const result = parseDate(date);
    expect(result).not.toBeNull();
    expect(result?.formatYMD()).toBe('2024-01-15');
  });

  it('returns null for strings that are too long', () => {
    const tooLong = '2024-07-02 17:00:00.000 extra characters';
    expect(parseDate(tooLong)).toBeNull();
  });
});

import { describe, it, expect } from 'vitest';
import { getBaseApiUrl } from '../services/api';

describe('getBaseApiUrl', () => {
  it('returns default localhost URL when VITE_API_URL is undefined or empty', () => {
    expect(getBaseApiUrl()).toBe('http://localhost:8000/api/v1');
  });
});

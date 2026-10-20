import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getBaseApiUrl } from '../services/api';

describe('getBaseApiUrl', () => {
  const originalLocation = window.location;

  afterEach(() => {
    // Restore window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    });
    vi.unstubAllEnvs();
  });

  it('returns default localhost URL when VITE_API_URL is undefined or empty on local environment', () => {
    vi.stubEnv('VITE_API_URL', '');
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { hostname: 'localhost', origin: 'http://localhost:5173' },
    });
    expect(getBaseApiUrl()).toBe('http://localhost:8000/api/v1');
  });

  it('returns configured VITE_API_URL when provided', () => {
    vi.stubEnv('VITE_API_URL', 'https://custom-backend.com/api/v1');
    expect(getBaseApiUrl()).toBe('https://custom-backend.com/api/v1');
  });

  it('sanitizes VITE_API_URL when entered with quotes or without /api/v1 suffix', () => {
    vi.stubEnv('VITE_API_URL', '"https://custom-backend.com"');
    expect(getBaseApiUrl()).toBe('https://custom-backend.com/api/v1');

    vi.stubEnv('VITE_API_URL', 'https://custom-backend.com/api');
    expect(getBaseApiUrl()).toBe('https://custom-backend.com/api/v1');
  });

  it('automatically resolves to live Render backend on Vercel deployment if VITE_API_URL is unset', () => {
    vi.stubEnv('VITE_API_URL', '');
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { hostname: 'arohan-phi.vercel.app', origin: 'https://arohan-phi.vercel.app' },
    });
    expect(getBaseApiUrl()).toBe('https://arohan-backend.onrender.com/api/v1');

    Object.defineProperty(window, 'location', {
      writable: true,
      value: { hostname: 'arohan-preview-123.vercel.app', origin: 'https://arohan-preview-123.vercel.app' },
    });
    expect(getBaseApiUrl()).toBe('https://arohan-backend.onrender.com/api/v1');
  });
});

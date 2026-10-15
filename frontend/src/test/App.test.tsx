import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import { api } from '../services/api';

describe('AROHAN AI Frontend Smoke & Component Tests', () => {
  it('renders landing page with headline and tagline', () => {
    render(<App />);
    expect(screen.getByText('From Learning to Livelihood')).toBeInTheDocument();
    expect(screen.getByText('Every dream deserves a pathway.')).toBeInTheDocument();
    expect(screen.getByText('Discover Your Pathway')).toBeInTheDocument();
  });

  it('renders 5-step journey sequence on the landing page', () => {
    render(<App />);
    expect(screen.getByText(/The 5-Step Journey to Independence/i)).toBeInTheDocument();
    expect(screen.getByText('Discover')).toBeInTheDocument();
    expect(screen.getByText('Compare')).toBeInTheDocument();
    expect(screen.getAllByText('Roadmap').length).toBeGreaterThan(0);
    expect(screen.getByText('Support')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('toggles language between English and Tamil when clicking language selector', () => {
    render(<App />);
    const langBtn = screen.getByLabelText(/Change interface language/);
    expect(langBtn).toBeInTheDocument();
    expect(langBtn).toHaveTextContent('தமிழ்');

    // Click to switch to Tamil
    fireEvent.click(langBtn);
    expect(screen.getByText('கற்றலில் இருந்து வாழ்வாதாரத்திற்கு')).toBeInTheDocument();
    expect(screen.getByText('ஒவ்வொரு கனவிற்கும் ஒரு பாதை உண்டு.')).toBeInTheDocument();

    // Click back to English
    fireEvent.click(langBtn);
    expect(screen.getByText('From Learning to Livelihood')).toBeInTheDocument();
  });

  it('navigates to Opportunities directory when clicking Opportunities nav item', () => {
    render(<App />);
    const oppNavBtn = screen.getAllByText('Opportunities')[0];
    fireEvent.click(oppNavBtn);

    expect(screen.getByText(/Verified Opportunities & Schemes/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search by title, provider/i)).toBeInTheDocument();
  });

  it('navigates to BookBridge directory when clicking BookBridge nav item', () => {
    render(<App />);
    const bookNavBtn = screen.getAllByText('BookBridge')[0];
    fireEvent.click(bookNavBtn);

    expect(screen.getByText(/BookBridge: Educational Textbook Sharing/i)).toBeInTheDocument();
    expect(screen.getByText('Donate a Book')).toBeInTheDocument();
  });

  it('navigates to Arohan Connect when clicking Mentors nav item', () => {
    render(<App />);
    const mentorNavBtn = screen.getAllByText('Arohan Connect')[0];
    fireEvent.click(mentorNavBtn);

    expect(screen.getByText(/Platform-Mediated Mentorship from Rural Pioneers/i)).toBeInTheDocument();
    expect(screen.getByText(/Minor Safeguarding & Platform Mediation Notice/i)).toBeInTheDocument();
  });

  it('routes a teacher login to the teacher portal', async () => {
    api.setToken(null);
    const teacher = {
      id: 2,
      email: 'teacher@arohan.org',
      full_name: 'S. Sundaram',
      role: 'teacher' as const,
      preferred_language: 'en',
      is_active: true,
      is_verified: true,
      created_at: '2026-01-01T00:00:00',
    };
    const loginSpy = vi.spyOn(api, 'login').mockResolvedValue({ access_token: 'teacher-token', user: teacher });
    const studentsSpy = vi.spyOn(api, 'getFacilitatorStudents').mockResolvedValue([]);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    fireEvent.click(screen.getByRole('button', { name: /Teacher \(Sundaram\)/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(screen.getByText('Cohort Learning & Pathway Tracker')).toBeInTheDocument();
    });

    loginSpy.mockRestore();
    studentsSpy.mockRestore();
    api.setToken(null);
  });

  it('opens registration mode when Register is selected after closing Login', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    fireEvent.click(screen.getByRole('button', { name: 'Register here' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close authentication dialog' }));
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(screen.getByRole('heading', { name: 'Create an Arohan Account' })).toBeInTheDocument();
  });

  it('clearly labels seeded sample data in the application shell', () => {
    render(<App />);

    expect(screen.getByRole('complementary', { name: 'Hackathon demo data notice' })).toHaveTextContent('HACKATHON DEMO');
    expect(screen.getByText(/Seeded profiles and transactions are sample data/)).toBeInTheDocument();
    expect(screen.getByText(/the sample grant is marked Demo/)).toBeInTheDocument();
  });
});

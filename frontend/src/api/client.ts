import type { Trade, JournalSettings, DailyReview } from '../types/journal';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5000/api';
const TOKEN_KEY = 'trade_journal_auth_token';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function getAuthHeaders(): Record<string, string> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
    return res.ok;
  } catch (e) {
    return false;
  }
}

// Auth API Calls
export async function loginApi(email: string, password: string): Promise<{ token: string; user: UserProfile }> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  setStoredToken(data.token);
  return data;
}

export async function registerApi(name: string, email: string, password: string): Promise<{ token: string; user: UserProfile }> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  setStoredToken(data.token);
  return data;
}

export async function getCurrentUserApi(): Promise<UserProfile | null> {
  const token = getStoredToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      removeStoredToken();
      return null;
    }
    const data = await res.json();
    return data.user;
  } catch (e) {
    return null;
  }
}

export async function fetchTradesApi(): Promise<Trade[]> {
  const res = await fetch(`${API_BASE_URL}/trades`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch trades');
  return res.json();
}

export async function saveTradeApi(trade: Trade): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/trades`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(trade),
  });
  if (!res.ok) throw new Error('Failed to save trade');
}

export async function deleteTradeApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/trades/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete trade');
}

export async function fetchDailyReviewsApi(): Promise<DailyReview[]> {
  const res = await fetch(`${API_BASE_URL}/reviews`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch daily reviews');
  return res.json();
}

export async function saveDailyReviewApi(review: DailyReview): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/reviews`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(review),
  });
  if (!res.ok) throw new Error('Failed to save daily review');
}

export async function fetchSettingsApi(): Promise<JournalSettings> {
  const res = await fetch(`${API_BASE_URL}/settings`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function saveSettingsApi(settings: JournalSettings): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/settings`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error('Failed to save settings');
}

export async function resetDatabaseApi(): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/settings/reset`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to reset database');
}

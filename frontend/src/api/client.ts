import type { Trade, JournalSettings, DailyReview } from '../types/journal';

const API_BASE_URL = 'http://localhost:5000/api';

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export async function fetchTradesApi(): Promise<Trade[]> {
  const res = await fetch(`${API_BASE_URL}/trades`);
  if (!res.ok) throw new Error('Failed to fetch trades');
  return res.json();
}

export async function saveTradeApi(trade: Trade): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/trades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(trade),
  });
  if (!res.ok) throw new Error('Failed to save trade');
}

export async function deleteTradeApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/trades/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete trade');
}

export async function fetchDailyReviewsApi(): Promise<DailyReview[]> {
  const res = await fetch(`${API_BASE_URL}/reviews`);
  if (!res.ok) throw new Error('Failed to fetch daily reviews');
  return res.json();
}

export async function saveDailyReviewApi(review: DailyReview): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review),
  });
  if (!res.ok) throw new Error('Failed to save daily review');
}

export async function fetchSettingsApi(): Promise<JournalSettings> {
  const res = await fetch(`${API_BASE_URL}/settings`);
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function saveSettingsApi(settings: JournalSettings): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error('Failed to save settings');
}

export async function resetDatabaseApi(): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/settings/reset`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to reset database');
}

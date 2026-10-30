import { DEFAULT_ASSUMPTIONS, ModelAssumptions } from '../data/defaultAssumptions';

const STORAGE_KEY = 'agendo_financial_assumptions_v1';
const THEME_KEY = 'agendo_theme_preference';

export function loadSavedAssumptions(): ModelAssumptions {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_ASSUMPTIONS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_ASSUMPTIONS, ...parsed };
  } catch (e) {
    console.error('Error loading assumptions from localStorage:', e);
    return { ...DEFAULT_ASSUMPTIONS };
  }
}

export function saveAssumptions(assumptions: ModelAssumptions): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assumptions));
  } catch (e) {
    console.error('Error saving assumptions to localStorage:', e);
  }
}

export function resetToDefaultAssumptions(): ModelAssumptions {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing storage:', e);
  }
  return { ...DEFAULT_ASSUMPTIONS };
}

export function loadSavedTheme(): 'dark' | 'light' {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return t === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function saveTheme(theme: 'dark' | 'light'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.error('Error saving theme:', e);
  }
}

/**
 * Local Storage helpers for question history
 */

import { GeneratedQuestion, QuestionHistory } from '@/types';

const STORAGE_KEY = 'eng-mvp-history';
const MAX_HISTORY = 10;

export function saveQuestion(question: GeneratedQuestion): void {
  if (typeof window === 'undefined') return;

  const history = getHistory();
  history.questions.unshift(question);

  // Keep only last 10 questions
  if (history.questions.length > MAX_HISTORY) {
    history.questions = history.questions.slice(0, MAX_HISTORY);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function getHistory(): QuestionHistory {
  if (typeof window === 'undefined') {
    return { questions: [] };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { questions: [] };

    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to parse history:', error);
    return { questions: [] };
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function deleteQuestion(id: string): void {
  if (typeof window === 'undefined') return;

  const history = getHistory();
  history.questions = history.questions.filter(q => q.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

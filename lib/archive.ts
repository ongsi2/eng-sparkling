/**
 * Archive Management System
 * Uses Supabase for persistence (DB-based)
 */

import { supabase } from './supabase';

export interface ArchivedQuestion {
  id: string;
  user_id: string;
  question_type: string;
  question: {
    question: string;
    modifiedPassage: string;
    choices: string[];
    answer: number;
    explanation: string;
    sentenceToInsert?: string;
  };
  article: {
    title: string;
    article: string;
    wordCount: number;
    difficulty: string;
    keywords: string[];
  };
  created_at: string;
}

/**
 * Save a question to the archive (DB)
 */
export async function saveQuestionToArchive(
  userId: string,
  questionType: string,
  question: ArchivedQuestion['question'],
  article: ArchivedQuestion['article']
): Promise<ArchivedQuestion | null> {
  const { data, error } = await supabase
    .from('archived_questions')
    .insert({
      user_id: userId,
      question_type: questionType,
      question: question,
      article: article,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving to archive:', error);
    return null;
  }

  return data as ArchivedQuestion;
}

/**
 * Get all archived questions for a user (DB)
 */
export async function getArchivedQuestions(userId: string): Promise<ArchivedQuestion[]> {
  const { data, error } = await supabase
    .from('archived_questions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching archive:', error);
    return [];
  }

  return data as ArchivedQuestion[];
}

/**
 * Delete an archived question (DB)
 */
export async function deleteArchivedQuestion(
  userId: string,
  questionId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('archived_questions')
    .delete()
    .eq('id', questionId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting from archive:', error);
    return false;
  }

  return true;
}

/**
 * Get count of archived questions for a user
 */
export async function getArchivedQuestionsCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('archived_questions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    console.error('Error counting archive:', error);
    return 0;
  }

  return count ?? 0;
}

import { useEffect, useCallback, useRef, useReducer } from 'react';
import { PresetId, PRESETS } from '../theme/tokens';
import { Question } from './useChallenge';

export interface UsePracticeReturn {
  currentQuestion: Question;
  correctCount: number;
  totalCount: number;
  streak: number;
  lastAnswerCorrect: boolean | null;
  submitAnswer: (value: string) => void;
}

interface PracticeState {
  currentQuestion: Question;
  correctCount: number;
  totalCount: number;
  streak: number;
  lastAnswerCorrect: boolean | null;
  recentPairs: string[];
}

type Action =
  | { type: 'SUBMIT_ANSWER'; isCorrect: boolean }
  | { type: 'NEXT_QUESTION'; preset: PresetId };

function generateQuestion(preset: PresetId, recentPairs: string[]): Question {
  const presetData = PRESETS.find((p) => p.id === preset);
  const max = presetData?.max ?? 10;
  
  let a: number, b: number;
  let key: string;
  let attempts = 0;
  
  do {
    a = Math.floor(Math.random() * max) + 1;
    b = Math.floor(Math.random() * max) + 1;
    key = `${a},${b}`;
    attempts++;
  } while (recentPairs.includes(key) && attempts < 100);
  
  return { a, b, answer: a * b };
}

function initPractice(preset: PresetId): PracticeState {
  const firstQuestion = generateQuestion(preset, []);
  return {
    currentQuestion: firstQuestion,
    correctCount: 0,
    totalCount: 0,
    streak: 0,
    lastAnswerCorrect: null,
    recentPairs: [`${firstQuestion.a},${firstQuestion.b}`],
  };
}

function practiceReducer(state: PracticeState, action: Action): PracticeState {
  switch (action.type) {
    case 'SUBMIT_ANSWER': {
      return {
        ...state,
        correctCount: state.correctCount + (action.isCorrect ? 1 : 0),
        totalCount: state.totalCount + 1,
        streak: action.isCorrect ? state.streak + 1 : 0,
        lastAnswerCorrect: action.isCorrect,
      };
    }
    case 'NEXT_QUESTION': {
      const nextQuestion = generateQuestion(action.preset, state.recentPairs);
      const newKey = `${nextQuestion.a},${nextQuestion.b}`;
      const newRecent = [...state.recentPairs, newKey];
      
      if (newRecent.length > 10) {
        newRecent.shift();
      }
      
      return {
        ...state,
        currentQuestion: nextQuestion,
        lastAnswerCorrect: null,
        recentPairs: newRecent,
      };
    }
    default:
      return state;
  }
}

export function usePractice(preset: PresetId): UsePracticeReturn {
  const [state, dispatch] = useReducer(practiceReducer, preset, initPractice);
  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const clearAdvanceTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);
  
  const submitAnswer = useCallback((value: string) => {
    if (state.lastAnswerCorrect !== null) return;
    
    const numValue = parseInt(value, 10);
    const isCorrect = numValue === state.currentQuestion.answer;
    
    dispatch({ type: 'SUBMIT_ANSWER', isCorrect });
    
    clearAdvanceTimeout();
    timeoutRef.current = setTimeout(() => {
      dispatch({ type: 'NEXT_QUESTION', preset });
    }, 800);
    
  }, [state.lastAnswerCorrect, state.currentQuestion, preset, clearAdvanceTimeout]);
  
  useEffect(() => {
    return clearAdvanceTimeout;
  }, [clearAdvanceTimeout]);

  return {
    currentQuestion: state.currentQuestion,
    correctCount: state.correctCount,
    totalCount: state.totalCount,
    streak: state.streak,
    lastAnswerCorrect: state.lastAnswerCorrect,
    submitAnswer,
  };
}

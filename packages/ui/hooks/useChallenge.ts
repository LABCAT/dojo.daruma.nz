import { useEffect, useCallback, useRef, useReducer } from 'react';
import { PresetId, PRESETS } from '../theme/tokens';

export interface Question {
  a: number;
  b: number;
  answer: number;
}

export type ChallengeStatus = 'idle' | 'active' | 'passed' | 'failed';

export interface UseChallengeReturn {
  status: ChallengeStatus;
  currentQuestion: Question | null;
  questionIndex: number;
  totalQuestions: number;
  correctCount: number;
  passThreshold: number;
  lastAnswerCorrect: boolean | null;
  start: () => void;
  submitAnswer: (value: string) => void;
  retry: () => void;
}

const TOTAL_QUESTIONS = 20;

interface ChallengeState {
  status: ChallengeStatus;
  currentQuestion: Question | null;
  questionIndex: number;
  correctCount: number;
  lastAnswerCorrect: boolean | null;
  usedPairs: Set<string>;
  passThreshold: number;
}

type Action =
  | { type: 'START'; preset: PresetId; passThreshold: number }
  | { type: 'SUBMIT_ANSWER'; isCorrect: boolean }
  | { type: 'NEXT_QUESTION'; preset: PresetId };

function generateQuestion(preset: PresetId, usedPairs: Set<string>): Question {
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
  } while (usedPairs.has(key) && attempts < 100);
  
  return { a, b, answer: a * b };
}

const initialState: ChallengeState = {
  status: 'idle',
  currentQuestion: null,
  questionIndex: 0,
  correctCount: 0,
  lastAnswerCorrect: null,
  usedPairs: new Set<string>(),
  passThreshold: 17,
};

function challengeReducer(state: ChallengeState, action: Action): ChallengeState {
  switch (action.type) {
    case 'START': {
      const usedPairs = new Set<string>();
      const firstQuestion = generateQuestion(action.preset, usedPairs);
      usedPairs.add(`${firstQuestion.a},${firstQuestion.b}`);
      return {
        status: 'active',
        currentQuestion: firstQuestion,
        questionIndex: 0,
        correctCount: 0,
        lastAnswerCorrect: null,
        usedPairs,
        passThreshold: action.passThreshold,
      };
    }
    case 'SUBMIT_ANSWER': {
      return {
        ...state,
        correctCount: state.correctCount + (action.isCorrect ? 1 : 0),
        lastAnswerCorrect: action.isCorrect,
      };
    }
    case 'NEXT_QUESTION': {
      if (state.questionIndex >= TOTAL_QUESTIONS - 1) {
        const passed = state.correctCount >= state.passThreshold;
        return {
          ...state,
          status: passed ? 'passed' : 'failed',
          lastAnswerCorrect: null,
        };
      }
      
      const nextQuestion = generateQuestion(action.preset, state.usedPairs);
      const newUsed = new Set(state.usedPairs);
      newUsed.add(`${nextQuestion.a},${nextQuestion.b}`);
      
      return {
        ...state,
        currentQuestion: nextQuestion,
        questionIndex: state.questionIndex + 1,
        lastAnswerCorrect: null,
        usedPairs: newUsed,
      };
    }
    default:
      return state;
  }
}

export function useChallenge(preset: PresetId, rankId: number = 1): UseChallengeReturn {
  const [state, dispatch] = useReducer(challengeReducer, initialState);
  
  // Calculate dynamic threshold based on rank
  // Rank 1: 14, Rank 2: 16, Rank 3: 18, Rank 4: 19, Rank 5: 20
  let calculatedThreshold = 17;
  if (rankId === 1) calculatedThreshold = 14;
  else if (rankId === 2) calculatedThreshold = 16;
  else if (rankId === 3) calculatedThreshold = 18;
  else if (rankId === 4) calculatedThreshold = 19;
  else if (rankId === 5) calculatedThreshold = 20;

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const clearAdvanceTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);
  
  const start = useCallback(() => {
    clearAdvanceTimeout();
    dispatch({ type: 'START', preset, passThreshold: calculatedThreshold });
  }, [preset, calculatedThreshold, clearAdvanceTimeout]);
  
  const retry = useCallback(() => {
    clearAdvanceTimeout();
    dispatch({ type: 'START', preset, passThreshold: calculatedThreshold });
  }, [preset, calculatedThreshold, clearAdvanceTimeout]);

  const submitAnswer = useCallback((value: string) => {
    if (state.status !== 'active') return;
    if (state.lastAnswerCorrect !== null) return;
    if (!state.currentQuestion) return;
    
    const numValue = parseInt(value, 10);
    const isCorrect = numValue === state.currentQuestion.answer;
    
    dispatch({ type: 'SUBMIT_ANSWER', isCorrect });
    
    clearAdvanceTimeout();
    timeoutRef.current = setTimeout(() => {
      dispatch({ type: 'NEXT_QUESTION', preset });
    }, 800);
    
  }, [state.status, state.lastAnswerCorrect, state.currentQuestion, preset, clearAdvanceTimeout]);
  
  useEffect(() => {
    return clearAdvanceTimeout;
  }, [clearAdvanceTimeout]);

  return {
    status: state.status,
    currentQuestion: state.currentQuestion,
    questionIndex: state.questionIndex,
    totalQuestions: TOTAL_QUESTIONS,
    correctCount: state.correctCount,
    passThreshold: state.passThreshold,
    lastAnswerCorrect: state.lastAnswerCorrect,
    start,
    submitAnswer,
    retry,
  };
}

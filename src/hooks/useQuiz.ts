import { useState, useCallback } from 'react'
import quizBank from '../data/quiz-bank.json'

// ── Types ──────────────────────────────────────────────────────────────────────

export type QuizBankTopic =
  | 'mean' | 'median' | 'std-dev' | 'probability' | 'sampling'
  | 'regression' | 'correlation' | 'binomial' | 'hypothesis-testing' | 'confidence-intervals'

export interface QuizBankQuestion {
  id: string
  difficulty: 'easy' | 'medium' | 'hard'
  question: string
  options: string[]
  correct_answer: string
  explanation: string
}

// StatChallenge-compatible question format (index-based correct answer)
export interface StatChallengeQuestion {
  q: string
  options: string[]
  correct: number
  explanation: string
}

// ── Building → Quiz-bank topic map ────────────────────────────────────────────
// StatChallenge building IDs → quiz-bank topic keys

const BUILDING_TO_TOPIC: Record<string, QuizBankTopic> = {
  // Original 5 PRD buildings (old building IDs used by StatChallenge)
  power:   'mean',
  housing: 'median',
  traffic: 'std-dev',
  hospital:'probability',   // closest topic; quiz-bank has no "normal-distribution"
  school:  'sampling',
  // Extended 5 buildings (building IDs match quiz-bank building fields)
  bank:    'regression',
  market:  'correlation',
  'city-hall': 'binomial',
  research:'hypothesis-testing',
  news:    'confidence-intervals',
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function getRawQuestions(topic: QuizBankTopic): QuizBankQuestion[] {
  const topicData = (quizBank.topics as Record<string, { questions: QuizBankQuestion[] }>)[topic]
  return topicData?.questions ?? []
}

/** Convert quiz-bank format to StatChallenge format (correct as index). */
function toStatChallengeFormat(q: QuizBankQuestion): StatChallengeQuestion {
  const idx = q.options.indexOf(q.correct_answer)
  return {
    q: q.question,
    options: q.options,
    correct: idx >= 0 ? idx : 0,
    explanation: q.explanation,
  }
}

/**
 * Returns shuffled questions for a building in StatChallenge format.
 * Falls back to [] if building is not mapped or topic has no questions.
 */
export function getQuestionsForBuilding(buildingId: string): StatChallengeQuestion[] {
  const topic = BUILDING_TO_TOPIC[buildingId]
  if (!topic) return []
  const raw = getRawQuestions(topic)
  return shuffle(raw).map(toStatChallengeFormat)
}

// ── useQuiz hook ──────────────────────────────────────────────────────────────

export interface QuizState {
  currentQuestion: QuizBankQuestion | null
  choices: string[]
  answered: boolean
  wasCorrect: boolean | null
  sessionScore: number
  sessionTotal: number
}

export function useQuiz(buildingId: string) {
  const topic = BUILDING_TO_TOPIC[buildingId] ?? null
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set())

  function pickQuestion(seen: Set<string>): QuizBankQuestion | null {
    if (!topic) return null
    const pool = getRawQuestions(topic)
    const unseen = pool.filter(q => !seen.has(q.id))
    const source = unseen.length > 0 ? unseen : pool
    if (source.length === 0) return null
    return source[Math.floor(Math.random() * source.length)]
  }

  const [state, setState] = useState<QuizState>(() => {
    const q = topic ? pickQuestion(new Set()) : null
    return {
      currentQuestion: q,
      choices: q ? shuffle([...q.options]) : [],
      answered: false,
      wasCorrect: null,
      sessionScore: 0,
      sessionTotal: 0,
    }
  })

  const submitAnswer = useCallback((selected: string) => {
    if (!state.currentQuestion || state.answered) return
    const correct = selected === state.currentQuestion.correct_answer
    setState(prev => ({
      ...prev,
      answered: true,
      wasCorrect: correct,
      sessionScore: correct ? prev.sessionScore + 1 : prev.sessionScore,
      sessionTotal: prev.sessionTotal + 1,
    }))
    setSeenIds(prev => new Set(prev).add(state.currentQuestion!.id))
  }, [state])

  const nextQuestion = useCallback(() => {
    setSeenIds(prev => {
      const next = pickQuestion(prev)
      setState(s => ({
        ...s,
        currentQuestion: next,
        choices: next ? shuffle([...next.options]) : [],
        answered: false,
        wasCorrect: null,
      }))
      return prev
    })
  }, [topic, seenIds]) // eslint-disable-line react-hooks/exhaustive-deps

  const resetSession = useCallback(() => {
    const q = topic ? pickQuestion(seenIds) : null
    setState({
      currentQuestion: q,
      choices: q ? shuffle([...q.options]) : [],
      answered: false,
      wasCorrect: null,
      sessionScore: 0,
      sessionTotal: 0,
    })
  }, [topic, seenIds]) // eslint-disable-line react-hooks/exhaustive-deps

  return { topic, state, submitAnswer, nextQuestion, resetSession }
}

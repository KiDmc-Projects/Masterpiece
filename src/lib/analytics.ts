/**
 * Analytics tracking utilities for Masterpiece Quiz
 * Integrates with Google Tag Manager (GTM-M942L7F9)
 */

// Extend global window object for dataLayer
declare global {
  interface Window {
    dataLayer: any[];
  }
}

// Initialize dataLayer if not present
if (typeof window !== "undefined" && !window.dataLayer) {
  window.dataLayer = [];
}

/**
 * Core analytics tracking function
 */
function gtag(...args: any[]) {
  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push(arguments);
  }
}

/**
 * Quiz difficulty levels for consistent tracking
 */
export const DIFFICULTY_LEVELS = {
  NEOPHYTE: "neophyte",
  ARTISAN: "artisan",
  MASTER: "master",
  MIX: "mix",
} as const;

/**
 * Quiz grade categories for tracking
 */
export const GRADE_CATEGORIES = {
  A_PLUS: "A+",
  A: "A",
  B_PLUS: "B+",
  B: "B",
  C_PLUS: "C+",
  C: "C",
  D: "D",
  F: "F",
} as const;

/**
 * Session tracking for measuring engagement time
 */
class SessionTracker {
  private startTime: number;
  private lastActivityTime: number;
  private isActive: boolean = true;

  constructor() {
    this.startTime = Date.now();
    this.lastActivityTime = this.startTime;
    this.setupActivityListeners();
  }

  private setupActivityListeners() {
    if (typeof window === "undefined") return;

    // Track user activity
    const activities = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];
    activities.forEach((activity) => {
      window.addEventListener(activity, () => {
        this.lastActivityTime = Date.now();
        this.isActive = true;
      });
    });

    // Track when user becomes inactive
    setInterval(() => {
      if (Date.now() - this.lastActivityTime > 30000) {
        // 30 seconds of inactivity
        this.isActive = false;
      }
    }, 5000);
  }

  getSessionDuration(): number {
    return Math.round((Date.now() - this.startTime) / 1000); // in seconds
  }

  getActiveTime(): number {
    return this.isActive
      ? this.getSessionDuration()
      : Math.round((this.lastActivityTime - this.startTime) / 1000);
  }
}

// Global session tracker instance
let sessionTracker: SessionTracker | null = null;

/**
 * Initialize session tracking
 */
export function initializeSessionTracking() {
  if (typeof window !== "undefined" && !sessionTracker) {
    sessionTracker = new SessionTracker();
  }
}

/**
 * Analytics Events
 */

/**
 * Track when user selects a difficulty level
 */
export function trackDifficultySelection(
  difficulty: string,
  language: string = "ru",
) {
  gtag("event", "difficulty_selected", {
    event_category: "Quiz",
    event_label: difficulty,
    custom_map: {
      dimension1: difficulty,
      dimension2: language,
    },
  });

  // Also push to dataLayer for GTM
  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push({
      event: "quiz_difficulty_selected",
      difficulty_level: difficulty,
      interface_language: language,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Track quiz completion with grade
 */
export function trackQuizCompletion(
  difficulty: string,
  grade: string,
  score: number,
  totalQuestions: number,
  sessionDuration: number,
  language: string = "ru",
) {
  const accuracy = Math.round((score / totalQuestions) * 100);

  gtag("event", "quiz_completed", {
    event_category: "Quiz",
    event_label: `${difficulty}_${grade}`,
    value: score,
    custom_map: {
      dimension1: difficulty,
      dimension2: language,
      dimension3: grade,
      metric1: sessionDuration,
      metric2: accuracy,
    },
  });

  // Enhanced dataLayer push
  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push({
      event: "quiz_completed",
      difficulty_level: difficulty,
      quiz_grade: grade,
      quiz_score: score,
      total_questions: totalQuestions,
      accuracy_percentage: accuracy,
      session_duration_seconds: sessionDuration,
      interface_language: language,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Track quiz abandonment (user quits before completion)
 */
export function trackQuizAbandonment(
  difficulty: string,
  questionNumber: number,
  totalQuestions: number,
  timeSpent: number,
  language: string = "ru",
) {
  const completionPercentage = Math.round(
    (questionNumber / totalQuestions) * 100,
  );

  gtag("event", "quiz_abandoned", {
    event_category: "Quiz",
    event_label: `${difficulty}_q${questionNumber}`,
    value: questionNumber,
    custom_map: {
      dimension1: difficulty,
      dimension2: language,
      metric1: timeSpent,
      metric2: completionPercentage,
    },
  });

  // Enhanced dataLayer push
  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push({
      event: "quiz_abandoned",
      difficulty_level: difficulty,
      questions_completed: questionNumber,
      total_questions: totalQuestions,
      completion_percentage: completionPercentage,
      time_spent_seconds: timeSpent,
      interface_language: language,
      abandonment_point: `question_${questionNumber}`,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Track individual question answers for detailed analytics
 */
export function trackQuestionAnswer(
  questionNumber: number,
  isCorrect: boolean,
  difficulty: string,
  artist: string,
  artworkTitle: string,
  timeToAnswer: number,
  language: string = "ru",
) {
  gtag("event", "question_answered", {
    event_category: "Quiz",
    event_label: `${difficulty}_${isCorrect ? "correct" : "incorrect"}`,
    value: isCorrect ? 1 : 0,
    custom_map: {
      dimension1: difficulty,
      dimension2: language,
      dimension4: artist,
      metric3: timeToAnswer,
    },
  });

  // Enhanced dataLayer push
  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push({
      event: "question_answered",
      question_number: questionNumber,
      is_correct: isCorrect,
      difficulty_level: difficulty,
      artist_name: artist,
      artwork_title: artworkTitle,
      time_to_answer_seconds: timeToAnswer,
      interface_language: language,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Track page views with enhanced metadata
 */
export function trackPageView(pageName: string, language: string = "ru") {
  gtag("event", "page_view", {
    page_title: pageName,
    page_location: typeof window !== "undefined" ? window.location.href : "",
    custom_map: {
      dimension2: language,
    },
  });

  // Enhanced dataLayer push
  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push({
      event: "page_view",
      page_name: pageName,
      interface_language: language,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Get current session duration for tracking
 */
export function getCurrentSessionDuration(): number {
  return sessionTracker?.getSessionDuration() || 0;
}

/**
 * Get active session time (excluding idle time)
 */
export function getActiveSessionTime(): number {
  return sessionTracker?.getActiveTime() || 0;
}

/**
 * Utility to calculate grade from score
 */
export function calculateGrade(score: number, total: number): string {
  const percentage = (score / total) * 100;

  if (percentage >= 97) return GRADE_CATEGORIES.A_PLUS;
  if (percentage >= 93) return GRADE_CATEGORIES.A;
  if (percentage >= 90) return GRADE_CATEGORIES.B_PLUS;
  if (percentage >= 87) return GRADE_CATEGORIES.B;
  if (percentage >= 83) return GRADE_CATEGORIES.C_PLUS;
  if (percentage >= 80) return GRADE_CATEGORIES.C;
  if (percentage >= 70) return GRADE_CATEGORIES.D;
  return GRADE_CATEGORIES.F;
}

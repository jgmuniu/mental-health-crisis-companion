// Multi-layered risk detection as per research proposal
export const RISK_LEVELS = {
  CRISIS: 3,    // ✅ Added: was missing, useRiskDetection imports this
  HIGH: 2,      // ✅ Fixed: renumbered to match useRiskDetection's score system
  ELEVATED: 1,
  MODERATE: 1,
  LOW: 0
};

// ✅ Added: CRISIS_KEYWORDS was missing entirely — useRiskDetection.js imports this
export const CRISIS_KEYWORDS = [
  "kill myself", "end my life", "suicide", "suicidal", "want to die",
  "don't want to live", "no reason to live", "better off dead",
  "can't go on", "end it all", "take my life", "overdose",
  "hang myself", "slit", "jump off", "harm myself tonight",
  "do it tonight", "goodbye forever", "last message", "final goodbye"
];

// HIGH_RISK now covers serious but non-immediate ideation
export const HIGH_RISK_KEYWORDS = [
  "hurt myself", "self harm", "cutting", "burn myself",
  "feeling hopeless", "no hope", "burden", "everyone hates me",
  "can't take it anymore", "tired of life", "nothing matters",
  "feel empty", "want to disappear", "wish i wasn't here",
  "don't want to wake up", "feeling worthless", "hate myself"
];

export const ELEVATED_RISK_KEYWORDS = [
  "depressed", "depression", "anxious", "anxiety",
  "can't cope", "overwhelmed", "hopeless", "numb",
  "falling apart", "breaking down", "dark thoughts",
  "not okay", "struggling", "suffering", "exhausted",
  "lonely", "alone", "lost", "feel empty", "crying", "pain"
];

export const MODERATE_RISK_KEYWORDS = [
  "sad", "upset", "stressed", "worried", "nervous",
  "frustrated", "angry", "confused", "unsure", "tired",
  "unmotivated", "low energy", "feeling down", "not great"
];

// For compatibility — useRiskDetection also imports this
export const RISK_LEVEL_ORDER = {
  CRISIS: 3,
  HIGH: 2,
  ELEVATED: 1,
  MODERATE: 1,
  LOW: 0
};
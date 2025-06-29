import CryptoJS from 'crypto-js';

export type CrisisLevel = 'high' | 'medium' | 'low';

export interface CrisisDetectionResult {
  isDetected: boolean;
  level: CrisisLevel;
  triggeredKeywords: string[];
  confidence: number;
}

// Crisis detection keywords organized by severity
const CRISIS_KEYWORDS = {
  high: [
    // Immediate danger indicators
    'kill myself', 'end my life', 'want to die', 'suicide', 'suicidal',
    'end it all', 'better off dead', 'cannot go on', "can't go on",
    'planning to hurt myself', 'planning suicide', 'have a plan',
    'pills to end', 'rope to hang', 'gun to shoot', 'bridge to jump',
    'razor to cut deep', 'overdose on', 'carbon monoxide',
    
    // Self-harm with lethal intent
    'cut deep enough', 'bleed out', 'permanent solution',
    'final decision', 'last time', 'goodbye forever',
    'insurance money', 'funeral arrangements'
  ],
  
  medium: [
    // Self-harm indicators
    'hurt myself', 'self harm', 'self-harm', 'cutting myself',
    'burning myself', 'hitting myself', 'scratching until',
    'punching walls', 'head banging',
    
    // Despair and hopelessness
    'no hope', 'hopeless', 'no point', 'pointless',
    'nothing matters', 'give up', 'giving up', 'cannot cope',
    "can't take it", 'too much pain', 'unbearable',
    'escape the pain', 'make it stop',
    
    // Isolation and withdrawal
    'nobody cares', 'alone forever', 'burden to everyone',
    'world without me', 'disappear forever', 'run away forever'
  ],
  
  low: [
    // General distress
    'very depressed', 'extremely sad', 'overwhelmed',
    'panic attack', 'anxiety attack', 'breakdown',
    'losing control', 'falling apart', 'rock bottom',
    'dark thoughts', 'scary thoughts', 'intrusive thoughts',
    
    // Help-seeking language
    'need help', 'desperate', 'crisis', 'emergency',
    'intervention', 'hotline', 'counselor urgent'
  ]
};

// Contextual patterns that increase crisis likelihood
const CRISIS_PATTERNS = [
  // Time-based urgency
  /\b(tonight|today|right now|immediately|soon)\b.*\b(die|end|hurt|kill)\b/i,
  
  // Planning indicators
  /\b(plan|planning|decided|going to)\b.*\b(kill|hurt|end|die)\b/i,
  
  // Method discussions
  /\b(how to|ways to|best way)\b.*\b(die|kill|hurt|end)\b/i,
  
  // Farewell patterns
  /\b(goodbye|farewell|last time|final)\b.*\b(message|words|goodbye)\b/i,
  
  // Pain escalation
  /\b(can't|cannot)\b.*\b(take|handle|bear|stand)\b.*\b(anymore|longer|pain)\b/i
];

// Protective factors that might reduce crisis likelihood
const PROTECTIVE_PATTERNS = [
  /\b(thinking about|worried about|reading about)\b/i, // Thinking vs acting
  /\b(movie|book|show|character|story)\b/i, // Media discussion
  /\b(friend|family member|someone else)\b/i, // Third person
  /\b(hypothetical|theoretical|wondering)\b/i // Academic/hypothetical
];

/**
 * Creates a one-way hash of message content for privacy-compliant logging
 */
export function createMessageHash(message: string): string {
  return CryptoJS.SHA256(message.toLowerCase().trim()).toString();
}

/**
 * Analyzes a message for crisis indicators using NLP-inspired techniques
 */
export function detectCrisis(message: string): CrisisDetectionResult {
  const normalizedMessage = message.toLowerCase().trim();
  
  if (!normalizedMessage || normalizedMessage.length < 10) {
    return {
      isDetected: false,
      level: 'low',
      triggeredKeywords: [],
      confidence: 0
    };
  }

  let totalScore = 0;
  let maxLevel: CrisisLevel = 'low';
  const triggeredKeywords: string[] = [];

  // Check for direct keyword matches
  Object.entries(CRISIS_KEYWORDS).forEach(([level, keywords]) => {
    const levelScore = level === 'high' ? 10 : level === 'medium' ? 5 : 2;
    
    keywords.forEach(keyword => {
      if (normalizedMessage.includes(keyword.toLowerCase())) {
        totalScore += levelScore;
        triggeredKeywords.push(keyword);
        
        if (level === 'high') maxLevel = 'high';
        else if (level === 'medium' && maxLevel !== 'high') maxLevel = 'medium';
      }
    });
  });

  // Check for contextual patterns
  CRISIS_PATTERNS.forEach(pattern => {
    if (pattern.test(normalizedMessage)) {
      totalScore += 8;
      triggeredKeywords.push('contextual_pattern');
      if (maxLevel !== 'high') maxLevel = 'medium';
    }
  });

  // Apply protective factor reduction
  PROTECTIVE_PATTERNS.forEach(pattern => {
    if (pattern.test(normalizedMessage)) {
      totalScore = Math.max(0, totalScore - 3);
    }
  });

  // Calculate confidence and determine detection
  const confidence = Math.min(100, (totalScore / 20) * 100);
  const isDetected = totalScore >= 5; // Threshold for crisis detection

  // Adjust level based on total score
  if (totalScore >= 15) maxLevel = 'high';
  else if (totalScore >= 8) maxLevel = 'medium';
  else if (totalScore >= 5) maxLevel = 'low';

  return {
    isDetected,
    level: maxLevel,
    triggeredKeywords: [...new Set(triggeredKeywords)], // Remove duplicates
    confidence: Math.round(confidence)
  };
}

/**
 * Validates crisis detection result for quality assurance
 */
export function validateDetection(message: string, result: CrisisDetectionResult): boolean {
  // Ensure we're not flagging very short messages
  if (message.trim().length < 10 && result.isDetected) {
    return false;
  }

  // Ensure high-level detections have appropriate keywords
  if (result.level === 'high' && result.triggeredKeywords.length === 0) {
    return false;
  }

  // Confidence should align with detection
  if (result.isDetected && result.confidence < 25) {
    return false;
  }

  return true;
}
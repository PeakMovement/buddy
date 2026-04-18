const RED_FLAG_KEYWORDS = [
  { keyword: 'chest pain', score: 9, next_step: 'Seek emergency medical attention immediately.' },
  { keyword: 'numbness in arm', score: 8, next_step: 'Consult a medical professional urgently.' },
  { keyword: 'loss of bladder', score: 9, next_step: 'Seek emergency medical attention immediately.' },
  { keyword: 'loss of bowel', score: 9, next_step: 'Seek emergency medical attention immediately.' },
  { keyword: 'saddle anaesthesia', score: 9, next_step: 'Seek emergency medical attention immediately.' },
  { keyword: 'unexplained weight loss', score: 7, next_step: 'See a doctor for further investigation.' },
  { keyword: 'fever with back pain', score: 8, next_step: 'See a doctor urgently.' },
  { keyword: 'night sweats', score: 6, next_step: 'Schedule a medical consultation.' },
  { keyword: 'trauma', score: 7, next_step: 'Consult a physiotherapist or doctor.' },
  { keyword: 'radiating pain', score: 6, next_step: 'Book an appointment with your physiotherapist.' },
  { keyword: 'tingling', score: 5, next_step: 'Monitor and consult if persistent.' },
  { keyword: 'sharp pain', score: 5, next_step: 'Monitor and consult if not improving.' },
  { keyword: 'severe headache', score: 8, next_step: 'Seek medical advice promptly.' },
  { keyword: 'dizziness', score: 6, next_step: 'Consult a healthcare provider.' },
];

interface AnalysisResult {
  red_flag_detected: boolean;
  confidence_score: number;
  matched_symptom: string | null;
  matched_score: number | null;
  suggested_next_step: string;
}

export function analyzeSymptomLocal(description: string): AnalysisResult {
  const lower = description.toLowerCase();
  let highestScore = 0;
  let matchedKeyword: string | null = null;
  let matchedNextStep = '';

  for (const item of RED_FLAG_KEYWORDS) {
    if (lower.includes(item.keyword) && item.score > highestScore) {
      highestScore = item.score;
      matchedKeyword = item.keyword;
      matchedNextStep = item.next_step;
    }
  }

  if (highestScore >= 6) {
    return {
      red_flag_detected: true,
      confidence_score: highestScore / 10,
      matched_symptom: matchedKeyword,
      matched_score: highestScore,
      suggested_next_step: matchedNextStep,
    };
  }

  return {
    red_flag_detected: false,
    confidence_score: highestScore / 10,
    matched_symptom: matchedKeyword,
    matched_score: matchedKeyword ? highestScore : null,
    suggested_next_step:
      'Continue your current treatment plan and monitor your symptoms. Book a follow-up if symptoms persist or worsen.',
  };
}

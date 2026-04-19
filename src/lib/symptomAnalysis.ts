const RED_FLAG_KEYWORDS = [
  { keyword: 'chest pain', score: 9, next_step: 'Seek emergency medical attention immediately.' },
  { keyword: 'chest tightness', score: 9, next_step: 'Seek emergency medical attention immediately.' },
  { keyword: 'chest pressure', score: 9, next_step: 'Seek emergency medical attention immediately.' },
  { keyword: 'heart attack', score: 10, next_step: 'Call emergency services immediately.' },
  { keyword: 'difficulty breathing', score: 9, next_step: 'Seek emergency medical attention immediately.' },
  { keyword: 'shortness of breath', score: 8, next_step: 'Seek urgent medical attention.' },
  { keyword: 'numbness in arm', score: 8, next_step: 'Consult a medical professional urgently.' },
  { keyword: 'arm numbness', score: 8, next_step: 'Consult a medical professional urgently.' },
  { keyword: 'numbness in leg', score: 7, next_step: 'Consult a medical professional urgently.' },
  { keyword: 'leg numbness', score: 7, next_step: 'Consult a medical professional urgently.' },
  { keyword: 'loss of bladder', score: 9, next_step: 'Seek emergency medical attention immediately.' },
  { keyword: 'bladder control', score: 9, next_step: 'Seek emergency medical attention immediately.' },
  { keyword: 'urinary incontinence', score: 8, next_step: 'Seek emergency medical attention immediately.' },
  { keyword: 'loss of bowel', score: 9, next_step: 'Seek emergency medical attention immediately.' },
  { keyword: 'bowel control', score: 9, next_step: 'Seek emergency medical attention immediately.' },
  { keyword: 'saddle anaesthesia', score: 9, next_step: 'Seek emergency medical attention immediately.' },
  { keyword: 'saddle anesthesia', score: 9, next_step: 'Seek emergency medical attention immediately.' },
  { keyword: 'cauda equina', score: 10, next_step: 'Seek emergency medical attention immediately.' },
  { keyword: 'unexplained weight loss', score: 7, next_step: 'See a doctor for further investigation.' },
  { keyword: 'sudden weight loss', score: 7, next_step: 'See a doctor for further investigation.' },
  { keyword: 'rapid weight loss', score: 6, next_step: 'See a doctor for further investigation.' },
  { keyword: 'fever with back pain', score: 8, next_step: 'See a doctor urgently.' },
  { keyword: 'fever with neck pain', score: 8, next_step: 'See a doctor urgently.' },
  { keyword: 'high fever', score: 7, next_step: 'See a doctor urgently.' },
  { keyword: 'night sweats', score: 6, next_step: 'Schedule a medical consultation.' },
  { keyword: 'cold sweats', score: 6, next_step: 'Schedule a medical consultation.' },
  { keyword: 'profuse sweating', score: 6, next_step: 'Schedule a medical consultation.' },
  { keyword: 'trauma', score: 7, next_step: 'Consult a physiotherapist or doctor.' },
  { keyword: 'fall injury', score: 7, next_step: 'Consult a physiotherapist or doctor.' },
  { keyword: 'car accident', score: 8, next_step: 'Seek medical evaluation promptly.' },
  { keyword: 'radiating pain', score: 6, next_step: 'Book an appointment with your physiotherapist.' },
  { keyword: 'pain radiating', score: 6, next_step: 'Book an appointment with your physiotherapist.' },
  { keyword: 'pain shooting', score: 6, next_step: 'Book an appointment with your physiotherapist.' },
  { keyword: 'shooting pain', score: 6, next_step: 'Book an appointment with your physiotherapist.' },
  { keyword: 'tingling', score: 5, next_step: 'Monitor and consult if persistent.' },
  { keyword: 'pins and needles', score: 5, next_step: 'Monitor and consult if persistent.' },
  { keyword: 'burning sensation', score: 5, next_step: 'Monitor and consult if persistent.' },
  { keyword: 'sharp pain', score: 5, next_step: 'Monitor and consult if not improving.' },
  { keyword: 'stabbing pain', score: 6, next_step: 'Monitor closely and consult if worsening.' },
  { keyword: 'severe headache', score: 8, next_step: 'Seek medical advice promptly.' },
  { keyword: 'worst headache', score: 9, next_step: 'Seek emergency medical attention immediately.' },
  { keyword: 'thunderclap headache', score: 10, next_step: 'Seek emergency medical attention immediately.' },
  { keyword: 'sudden headache', score: 8, next_step: 'Seek medical attention promptly.' },
  { keyword: 'migraine', score: 5, next_step: 'Consult your healthcare provider about management.' },
  { keyword: 'dizziness', score: 6, next_step: 'Consult a healthcare provider.' },
  { keyword: 'vertigo', score: 6, next_step: 'Consult a healthcare provider.' },
  { keyword: 'loss of balance', score: 7, next_step: 'Consult a healthcare provider promptly.' },
  { keyword: 'difficulty walking', score: 7, next_step: 'Consult a healthcare provider promptly.' },
  { keyword: 'loss of coordination', score: 7, next_step: 'Seek medical advice promptly.' },
  { keyword: 'fainting', score: 8, next_step: 'Seek medical attention promptly.' },
  { keyword: 'blackout', score: 8, next_step: 'Seek medical attention promptly.' },
  { keyword: 'loss of consciousness', score: 9, next_step: 'Seek emergency medical attention immediately.' },
  { keyword: 'seizure', score: 9, next_step: 'Seek emergency medical attention immediately.' },
  { keyword: 'vision loss', score: 9, next_step: 'Seek emergency medical attention immediately.' },
  { keyword: 'blurred vision', score: 7, next_step: 'Seek medical attention promptly.' },
  { keyword: 'double vision', score: 7, next_step: 'Seek medical attention promptly.' },
  { keyword: 'speech difficulty', score: 8, next_step: 'Seek emergency medical attention immediately.' },
  { keyword: 'slurred speech', score: 9, next_step: 'Seek emergency medical attention immediately.' },
  { keyword: 'facial drooping', score: 9, next_step: 'Seek emergency medical attention immediately — possible stroke.' },
  { keyword: 'stroke', score: 10, next_step: 'Call emergency services immediately.' },
  { keyword: 'paralysis', score: 10, next_step: 'Seek emergency medical attention immediately.' },
  { keyword: 'weakness in arm', score: 7, next_step: 'Seek medical attention promptly.' },
  { keyword: 'weakness in leg', score: 7, next_step: 'Seek medical attention promptly.' },
  { keyword: 'muscle weakness', score: 6, next_step: 'Consult a healthcare provider.' },
  { keyword: 'swelling', score: 5, next_step: 'Monitor and consult if persistent or worsening.' },
  { keyword: 'significant swelling', score: 6, next_step: 'Consult a healthcare provider.' },
  { keyword: 'redness and swelling', score: 6, next_step: 'Consult a healthcare provider.' },
  { keyword: 'warmth and swelling', score: 6, next_step: 'Consult a healthcare provider.' },
  { keyword: 'blood in urine', score: 8, next_step: 'See a doctor urgently.' },
  { keyword: 'blood in stool', score: 8, next_step: 'See a doctor urgently.' },
  { keyword: 'coughing blood', score: 9, next_step: 'Seek urgent medical attention.' },
  { keyword: 'vomiting blood', score: 9, next_step: 'Seek emergency medical attention immediately.' },
  { keyword: 'abdominal pain', score: 5, next_step: 'Consult a healthcare provider if persistent.' },
  { keyword: 'severe abdominal pain', score: 8, next_step: 'Seek urgent medical attention.' },
  { keyword: 'constant pain', score: 5, next_step: 'Consult your healthcare provider.' },
  { keyword: 'pain at night', score: 6, next_step: 'Schedule a consultation with your healthcare provider.' },
  { keyword: 'night pain', score: 6, next_step: 'Schedule a consultation with your healthcare provider.' },
  { keyword: 'waking pain', score: 6, next_step: 'Schedule a consultation with your healthcare provider.' },
  { keyword: 'cancer', score: 9, next_step: 'Consult your oncologist or healthcare provider immediately.' },
  { keyword: 'tumour', score: 8, next_step: 'Consult your healthcare provider promptly.' },
  { keyword: 'tumor', score: 8, next_step: 'Consult your healthcare provider promptly.' },
  { keyword: 'lump', score: 7, next_step: 'Have any new lumps assessed by a healthcare provider.' },
  { keyword: 'new lump', score: 7, next_step: 'Have any new lumps assessed by a healthcare provider.' },
  { keyword: 'bone pain', score: 6, next_step: 'Consult a healthcare provider if unexplained.' },
  { keyword: 'deep bone pain', score: 7, next_step: 'Consult a healthcare provider promptly.' },
  { keyword: 'spinal cord', score: 7, next_step: 'Seek urgent medical evaluation.' },
  { keyword: 'disc herniation', score: 6, next_step: 'Consult a physiotherapist or spinal specialist.' },
  { keyword: 'bulging disc', score: 6, next_step: 'Consult a physiotherapist or spinal specialist.' },
  { keyword: 'nerve compression', score: 6, next_step: 'Consult a physiotherapist or doctor.' },
  { keyword: 'sciatica', score: 5, next_step: 'Consult a physiotherapist or doctor.' },
  { keyword: 'suicidal', score: 10, next_step: 'Please reach out to a mental health crisis line or emergency services immediately.' },
  { keyword: 'self harm', score: 9, next_step: 'Please contact a mental health professional or crisis service immediately.' },
  { keyword: 'self-harm', score: 9, next_step: 'Please contact a mental health professional or crisis service immediately.' },
  { keyword: 'want to die', score: 9, next_step: 'Please reach out to a mental health crisis line or emergency services immediately.' },
  { keyword: 'hopeless', score: 6, next_step: 'Please speak with your healthcare provider or a mental health professional.' },
  { keyword: 'unable to move', score: 8, next_step: 'Seek medical evaluation promptly.' },
  { keyword: 'cannot move', score: 8, next_step: 'Seek medical evaluation promptly.' },
  { keyword: 'severe nausea', score: 6, next_step: 'Consult a healthcare provider if persistent.' },
  { keyword: 'persistent vomiting', score: 7, next_step: 'Seek medical attention.' },
  { keyword: 'extreme fatigue', score: 6, next_step: 'Consult a healthcare provider.' },
  { keyword: 'sudden fatigue', score: 6, next_step: 'Consult a healthcare provider.' },
  { keyword: 'jaw pain', score: 7, next_step: 'Consult a healthcare provider — may indicate cardiac issues.' },
  { keyword: 'neck stiffness', score: 6, next_step: 'Consult a healthcare provider, especially if with fever.' },
  { keyword: 'stiff neck', score: 6, next_step: 'Consult a healthcare provider, especially if with fever.' },
  { keyword: 'rash', score: 5, next_step: 'Have unexplained rashes assessed by a healthcare provider.' },
  { keyword: 'spreading rash', score: 6, next_step: 'Seek medical attention for spreading rashes.' },
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

// src/lib/lawyerMatcher.ts - Intelligent Lawyer Matching Algorithm

/**
 * Maps legal sections and case types to practice areas
 * ✨ ENHANCED: Added 50+ more IPC sections for better matching
 */
const PRACTICE_AREA_MAPPING: Record<string, string[]> = {
  // Cyber Crime & IT Act
  'IPC 66': ['Cyber Crime', 'IT Law', 'Criminal Law'],
  'IPC 66A': ['Cyber Crime', 'IT Law', 'Criminal Law'],
  'IPC 66B': ['Cyber Crime', 'IT Law', 'Criminal Law'],
  'IPC 66C': ['Cyber Crime', 'IT Law', 'Criminal Law'],
  'IPC 66D': ['Cyber Crime', 'IT Law', 'Criminal Law'],
  'IPC 66E': ['Cyber Crime', 'IT Law', 'Criminal Law'],
  'IPC 66F': ['Cyber Crime', 'IT Law', 'Criminal Law'],
  'IT Act 43': ['Cyber Crime', 'IT Law', 'Criminal Law'],
  'IT Act 65': ['Cyber Crime', 'IT Law', 'Criminal Law'],
  'IT Act 66C': ['Cyber Crime', 'IT Law', 'Criminal Law'],
  'IT Act 66D': ['Cyber Crime', 'IT Law', 'Criminal Law'],
  'IT Act 66E': ['Cyber Crime', 'IT Law', 'Criminal Law'],
  'IT Act 67': ['Cyber Crime', 'IT Law', 'Criminal Law'],
  
  // Theft & Property Crimes
  'IPC 378': ['Criminal Law', 'Property Law', 'Theft'],
  'IPC 379': ['Criminal Law', 'Property Law', 'Theft'],
  'IPC 380': ['Criminal Law', 'Property Law', 'Theft'],
  'IPC 381': ['Criminal Law', 'Property Law', 'Theft'],
  'IPC 382': ['Criminal Law', 'Property Law', 'Theft'],
  'IPC 403': ['Criminal Law', 'Property Law', 'Theft'],
  'IPC 404': ['Criminal Law', 'Property Law', 'Theft'],
  'IPC 405': ['Criminal Law', 'Property Law', 'Criminal Breach of Trust'],
  'IPC 406': ['Criminal Law', 'Property Law', 'Criminal Breach of Trust'],
  'IPC 407': ['Criminal Law', 'Property Law', 'Criminal Breach of Trust'],
  'IPC 408': ['Criminal Law', 'Property Law', 'Criminal Breach of Trust'],
  'IPC 409': ['Criminal Law', 'Property Law', 'Criminal Breach of Trust'],
  
  // Robbery & Dacoity
  'IPC 390': ['Criminal Law', 'Robbery', 'Serious Offenses'],
  'IPC 392': ['Criminal Law', 'Robbery', 'Serious Offenses'],
  'IPC 393': ['Criminal Law', 'Robbery', 'Serious Offenses'],
  'IPC 394': ['Criminal Law', 'Robbery', 'Serious Offenses'],
  'IPC 395': ['Criminal Law', 'Robbery', 'Serious Offenses'], // Dacoity
  'IPC 396': ['Criminal Law', 'Robbery', 'Murder', 'Serious Offenses'],
  
  // Cheating & Fraud
  'IPC 415': ['Criminal Law', 'Fraud', 'Economic Offenses'],
  'IPC 416': ['Criminal Law', 'Fraud', 'Economic Offenses'],
  'IPC 417': ['Criminal Law', 'Fraud', 'Economic Offenses'],
  'IPC 418': ['Criminal Law', 'Fraud', 'Economic Offenses'],
  'IPC 419': ['Criminal Law', 'Fraud', 'Economic Offenses'],
  'IPC 420': ['Criminal Law', 'Fraud', 'Economic Offenses', 'IPC 420'],
  
  // Extortion & Threats
  'IPC 383': ['Criminal Law', 'Extortion'],
  'IPC 384': ['Criminal Law', 'Extortion'],
  'IPC 385': ['Criminal Law', 'Extortion'],
  'IPC 386': ['Criminal Law', 'Extortion'],
  'IPC 387': ['Criminal Law', 'Extortion'],
  'IPC 503': ['Criminal Law', 'Intimidation'],
  'IPC 504': ['Criminal Law', 'Intimidation'],
  'IPC 505': ['Criminal Law', 'Intimidation'],
  'IPC 506': ['Criminal Law', 'Intimidation'],
  'IPC 507': ['Criminal Law', 'Intimidation'],
  
  // Assault & Violence
  'IPC 319': ['Criminal Law', 'Assault', 'Violence'],
  'IPC 320': ['Criminal Law', 'Assault', 'Violence'],
  'IPC 321': ['Criminal Law', 'Assault', 'Violence'],
  'IPC 322': ['Criminal Law', 'Assault', 'Violence'],
  'IPC 323': ['Criminal Law', 'Assault', 'Violence', 'IPC 323-326'],
  'IPC 324': ['Criminal Law', 'Assault', 'Violence', 'IPC 323-326'],
  'IPC 325': ['Criminal Law', 'Assault', 'Violence', 'IPC 323-326'],
  'IPC 326': ['Criminal Law', 'Assault', 'Violence', 'IPC 323-326'],
  'IPC 326A': ['Criminal Law', 'Assault', 'Acid Attack', 'Women Rights'],
  'IPC 326B': ['Criminal Law', 'Assault', 'Acid Attack', 'Women Rights'],
  
  // Murder & Culpable Homicide
  'IPC 299': ['Criminal Law', 'Murder', 'Serious Offenses'],
  'IPC 300': ['Criminal Law', 'Murder', 'Serious Offenses'],
  'IPC 302': ['Criminal Law', 'Murder', 'Serious Offenses'],
  'IPC 304': ['Criminal Law', 'Murder', 'Serious Offenses'],
  'IPC 304A': ['Criminal Law', 'Murder', 'Serious Offenses'],
  'IPC 304B': ['Criminal Law', 'Murder', 'Dowry Death', 'Women Rights'],
  'IPC 305': ['Criminal Law', 'Murder', 'Serious Offenses'],
  'IPC 306': ['Criminal Law', 'Abetment of Suicide', 'Serious Offenses'],
  'IPC 307': ['Criminal Law', 'Attempted Murder', 'Serious Offenses'],
  'IPC 308': ['Criminal Law', 'Attempted Murder', 'Serious Offenses'],
  
  // Domestic Violence & Women
  'IPC 498': ['Domestic Violence', 'Family Law', 'Criminal Law'],
  'IPC 498A': ['Domestic Violence', 'Family Law', 'Women Rights', 'Criminal Law'],
  'IPC 113A': ['Domestic Violence', 'Family Law', 'Women Rights'],
  'IPC 113B': ['Domestic Violence', 'Family Law', 'Women Rights'],
  
  // Sexual Offenses
  'IPC 354': ['Criminal Law', 'Sexual Offenses', 'Women Rights'],
  'IPC 354A': ['Criminal Law', 'Sexual Offenses', 'Women Rights'],
  'IPC 354B': ['Criminal Law', 'Sexual Offenses', 'Women Rights'],
  'IPC 354C': ['Criminal Law', 'Sexual Offenses', 'Women Rights'],
  'IPC 354D': ['Criminal Law', 'Sexual Offenses', 'Stalking', 'Women Rights'],
  'IPC 375': ['Criminal Law', 'Sexual Offenses', 'Rape', 'Women Rights'],
  'IPC 376': ['Criminal Law', 'Sexual Offenses', 'Rape', 'Women Rights'],
  'IPC 376A': ['Criminal Law', 'Sexual Offenses', 'Rape', 'Women Rights'],
  'IPC 376B': ['Criminal Law', 'Sexual Offenses', 'Rape', 'Women Rights'],
  'IPC 376C': ['Criminal Law', 'Sexual Offenses', 'Rape', 'Women Rights'],
  'IPC 376D': ['Criminal Law', 'Sexual Offenses', 'Rape', 'Women Rights'],
  'IPC 509': ['Criminal Law', 'Sexual Offenses', 'Women Rights'],
  
  // Kidnapping & Abduction
  'IPC 363': ['Criminal Law', 'Kidnapping'],
  'IPC 364': ['Criminal Law', 'Kidnapping'],
  'IPC 364A': ['Criminal Law', 'Kidnapping', 'Serious Offenses'],
  'IPC 365': ['Criminal Law', 'Kidnapping'],
  'IPC 366': ['Criminal Law', 'Kidnapping'],
  'IPC 367': ['Criminal Law', 'Kidnapping'],
  'IPC 368': ['Criminal Law', 'Kidnapping'],
  
  // Defamation
  'IPC 499': ['Criminal Law', 'Defamation', 'Civil Rights'],
  'IPC 500': ['Criminal Law', 'Defamation', 'Civil Rights'],
  'IPC 501': ['Criminal Law', 'Defamation', 'Civil Rights'],
  
  // Hate Speech & Communal
  'IPC 153A': ['Criminal Law', 'Hate Speech', 'Constitutional Law'],
  'IPC 153B': ['Criminal Law', 'Hate Speech', 'Constitutional Law'],
  'IPC 295': ['Criminal Law', 'Religious Offenses', 'Constitutional Law'],
  'IPC 295A': ['Criminal Law', 'Religious Offenses', 'Constitutional Law'],
  'IPC 296': ['Criminal Law', 'Religious Offenses'],
  'IPC 298': ['Criminal Law', 'Religious Offenses'],
  
  // Corruption & Bribery
  'IPC 161': ['Criminal Law', 'Corruption', 'Public Law'],
  'IPC 162': ['Criminal Law', 'Corruption', 'Public Law'],
  'IPC 163': ['Criminal Law', 'Corruption', 'Public Law'],
  'IPC 164': ['Criminal Law', 'Corruption', 'Public Law'],
  'IPC 165': ['Criminal Law', 'Corruption', 'Public Law'],
  'IPC 171': ['Criminal Law', 'Election Offenses', 'Public Law'],
  'IPC 171A': ['Criminal Law', 'Election Offenses', 'Public Law'],
  'IPC 171B': ['Criminal Law', 'Election Offenses', 'Public Law'],
  
  // Forgery
  'IPC 463': ['Criminal Law', 'Forgery', 'Fraud'],
  'IPC 464': ['Criminal Law', 'Forgery', 'Fraud'],
  'IPC 465': ['Criminal Law', 'Forgery', 'Fraud'],
  'IPC 466': ['Criminal Law', 'Forgery', 'Fraud'],
  'IPC 467': ['Criminal Law', 'Forgery', 'Fraud'],
  'IPC 468': ['Criminal Law', 'Forgery', 'Fraud'],
  'IPC 469': ['Criminal Law', 'Forgery', 'Fraud'],
  'IPC 470': ['Criminal Law', 'Forgery', 'Fraud'],
  'IPC 471': ['Criminal Law', 'Forgery', 'Fraud'],
  
  // Counterfeiting
  'IPC 489A': ['Criminal Law', 'Counterfeiting', 'Economic Offenses'],
  'IPC 489B': ['Criminal Law', 'Counterfeiting', 'Economic Offenses'],
  'IPC 489C': ['Criminal Law', 'Counterfeiting', 'Economic Offenses'],
  'IPC 489D': ['Criminal Law', 'Counterfeiting', 'Economic Offenses'],
};

/**
 * Maps case types to practice areas
 */
const CASE_TYPE_MAPPING: Record<string, string[]> = {
  cyber: ['Cyber Crime', 'IT Law', 'Criminal Law'],
  theft: ['Criminal Law', 'Property Law', 'Theft'],
  fraud: ['Criminal Law', 'Fraud', 'Consumer Protection'],
  criminal: ['Criminal Law', 'General Practice'],
  civil: ['Civil Law', 'General Practice'],
  family: ['Family Law', 'Divorce', 'Matrimonial'],
  property: ['Property Law', 'Real Estate', 'Civil Law'],
  business: ['Corporate Law', 'Business Law', 'Commercial'],
  labor: ['Labor Law', 'Employment Law'],
  consumer: ['Consumer Protection', 'Consumer Law'],
};

export interface Lawyer {
  id?: string;
  name: string;
  barNumber: string;
  yearsOfPractice: number;
  location: string;
  city: string;
  state: string;
  practiceAreas: string[];
  courts: string[];
  languages: string[];
  consultationFee: string;
  feeMin: number;
  feeMax: number;
  availability: string;
  image: string;
  verified: boolean;
  active: boolean;
  email: string;
  phone: string;
  rating?: number;
  totalCases?: number;
  successRate?: number;
}

export interface MatchedLawyer extends Lawyer {
  matchScore: number;
  matchReason: string;
  relevantAreas: string[];
}

/**
 * Calculate match score between case and lawyer
 * ✨ ENHANCED: Better scoring with location, expertise depth, and specialization bonus
 */
function calculateMatchScore(
  lawyer: Lawyer,
  sections: Array<{ code: string; isPrimary?: boolean }>,
  caseType?: string,
  userLocation?: string
): { score: number; reason: string; relevantAreas: string[] } {
  let score = 0;
  const matchedAreas = new Set<string>();
  const reasons: string[] = [];
  let specialtyMatchCount = 0;

  // Check practice areas against sections (MOST IMPORTANT)
  sections.forEach((section) => {
    const sectionCode = section.code;
    const relevantAreas = PRACTICE_AREA_MAPPING[sectionCode] || [];
    
    relevantAreas.forEach((area) => {
      if ((lawyer.practiceAreas || []).some(pa => (pa || '').toLowerCase().includes(area.toLowerCase()))) {
        matchedAreas.add(area);
        specialtyMatchCount++;
        
        // ✨ ENHANCED: Primary sections get much higher weight
        if (section.isPrimary) {
          score += 60; // Increased from 50
        } else {
          score += 35; // Increased from 30
        }
      }
    });
  });

  // ✨ NEW: Bonus for multiple specialty matches (deep expertise)
  if (specialtyMatchCount >= 3) {
    score += 20; // Multiple practice areas match = deep expertise
    reasons.push('Deep expertise in this area');
  } else if (specialtyMatchCount >= 2) {
    score += 10;
  }

  if (caseType) {
    const caseAreas = CASE_TYPE_MAPPING[caseType.toLowerCase()] || [];
    caseAreas.forEach((area) => {
      if ((lawyer.practiceAreas || []).some(pa => (pa || '').toLowerCase().includes(area.toLowerCase()))) {
        matchedAreas.add(area);
        score += 15; // Reduced from 20 (sections more important than case type)
      }
    });
  }

  // ✨ NEW: Location matching bonus
  if (userLocation) {
    const userLocationLower = userLocation.toLowerCase();
    const lawyerCityLower = lawyer.city?.toLowerCase() || '';
    const lawyerStateLower = lawyer.state?.toLowerCase() || '';
    
    if (lawyerCityLower.includes(userLocationLower) || userLocationLower.includes(lawyerCityLower)) {
      score += 25; // Same city = significant bonus
      reasons.push('Local lawyer');
    } else if (lawyerStateLower.includes(userLocationLower) || userLocationLower.includes(lawyerStateLower)) {
      score += 10; // Same state = small bonus
      reasons.push('In your state');
    }
  }

  // Bonus for verified lawyers (trust indicator)
  if (lawyer.verified) {
    score += 12; // Increased from 10
  }

  // ✨ ENHANCED: Experience bonuses (more granular)
  if (lawyer.yearsOfPractice >= 20) {
    score += 20; // Senior advocate
    reasons.push(`${lawyer.yearsOfPractice}+ years experience`);
  } else if (lawyer.yearsOfPractice >= 15) {
    score += 17;
    reasons.push(`${lawyer.yearsOfPractice}+ years experience`);
  } else if (lawyer.yearsOfPractice >= 10) {
    score += 15;
    reasons.push(`${lawyer.yearsOfPractice}+ years experience`);
  } else if (lawyer.yearsOfPractice >= 5) {
    score += 10;
  }

  // ✨ ENHANCED: Rating bonuses (quality indicator)
  if (lawyer.rating && lawyer.rating >= 4.8) {
    score += 15; // Exceptional
  } else if (lawyer.rating && lawyer.rating >= 4.5) {
    score += 12;
  } else if (lawyer.rating && lawyer.rating >= 4.0) {
    score += 7;
  }

  // ✨ ENHANCED: Success rate bonuses
  if (lawyer.successRate && lawyer.successRate >= 90) {
    score += 15; // Exceptional success rate
  } else if (lawyer.successRate && lawyer.successRate >= 85) {
    score += 12;
  } else if (lawyer.successRate && lawyer.successRate >= 80) {
    score += 10;
  }

  // ✨ NEW: Bonus for high case volume (experience indicator)
  if (lawyer.totalCases && lawyer.totalCases >= 500) {
    score += 10; // Very experienced
  } else if (lawyer.totalCases && lawyer.totalCases >= 300) {
    score += 5;
  }

  // Generate match reason
  const relevantAreasArray = Array.from(matchedAreas);
  if (relevantAreasArray.length > 0) {
    const topAreas = relevantAreasArray.slice(0, 3); // Limit to top 3 for readability
    reasons.unshift(`Specializes in ${topAreas.join(', ')}`);
  }
  
  if (lawyer.verified) {
    reasons.push('Verified');
  }

  const reason = reasons.length > 0 ? reasons.join(' • ') : 'General practice lawyer';

  return {
    score,
    reason,
    relevantAreas: relevantAreasArray,
  };
}

/**
 * Find and rank lawyers based on case analysis
 * ✨ ENHANCED: Added location support and better filtering
 */
export function matchLawyers(
  allLawyers: Lawyer[],
  sections: Array<{ code: string; name: string; isPrimary?: boolean }>,
  caseType?: string,
  options: {
    limit?: number;
    minScore?: number;
    userLocation?: string; // ✨ NEW: User's location for proximity matching
  } = {}
): MatchedLawyer[] {
  const { limit = 5, minScore = 20, userLocation } = options;

  // Calculate match scores for all lawyers
  const matchedLawyers: MatchedLawyer[] = allLawyers
    .filter(lawyer => lawyer.active) // ✨ Only active lawyers
    .map((lawyer) => {
      const { score, reason, relevantAreas } = calculateMatchScore(
        lawyer, 
        sections, 
        caseType,
        userLocation // ✨ Pass location for proximity bonus
      );
      
      return {
        ...lawyer,
        matchScore: score,
        matchReason: reason,
        relevantAreas,
      };
    });

  // Filter by minimum score and sort by score descending
  return matchedLawyers
    .filter((lawyer) => lawyer.matchScore >= minScore)
    .sort((a, b) => {
      // First sort by score (most important)
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      // Then by success rate (quality)
      if ((b.successRate || 0) !== (a.successRate || 0)) {
        return (b.successRate || 0) - (a.successRate || 0);
      }
      // Then by years of practice (experience)
      if (b.yearsOfPractice !== a.yearsOfPractice) {
        return b.yearsOfPractice - a.yearsOfPractice;
      }
      // Then by rating (user feedback)
      if ((b.rating || 0) !== (a.rating || 0)) {
        return (b.rating || 0) - (a.rating || 0);
      }
      // Finally by total cases (volume)
      return (b.totalCases || 0) - (a.totalCases || 0);
    })
    .slice(0, limit);
}

/**
 * Get practice area suggestions based on sections
 */
export function getPracticeAreaSuggestions(
  sections: Array<{ code: string }>
): string[] {
  const areas = new Set<string>();
  
  sections.forEach((section) => {
    const sectionAreas = PRACTICE_AREA_MAPPING[section.code] || [];
    sectionAreas.forEach((area) => areas.add(area));
  });
  
  return Array.from(areas);
}

/**
 * Format match score as percentage
 */
export function getMatchPercentage(score: number): number {
  // Normalize score to 0-100 range
  // Max realistic score is around 150 (primary section + case type + all bonuses)
  const maxScore = 150;
  const percentage = Math.min(Math.round((score / maxScore) * 100), 100);
  return Math.max(percentage, 0);
}

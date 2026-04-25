// Community Voting Interface - Main Component
// Handles the entire voting flow with conditional questions

import { useState, useEffect } from 'react';
import type { CommunityResponse, CommunityStats } from '../lib/convexData';
import { 
  generateInsights,
  checkHasVoted
} from '../lib/convexData';
import { getOrCreateSessionId } from '../lib/convexMutations';
import { CheckCircle2, AlertCircle } from 'lucide-react';

import { triggerStatsRefresh } from '../lib/stores/communityStore';

interface Props {
  initialStats: CommunityStats | null;
}

export default function CommunityVoting({ initialStats }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<CommunityStats | null>(initialStats);
  const [sessionId, setSessionId] = useState<string>('');
  
  const [formData, setFormData] = useState<CommunityResponse>({
    had_phone_stolen: 'yes',
    phone_recovered: null,
    replacement_method: null,
    theft_location: null,
    security_measures: [],
    reported_to_police: null,
  });

  // Check if user has already voted
  useEffect(() => {
    const sid = getOrCreateSessionId();
    setSessionId(sid);
    
    checkHasVoted(sid).then(voted => {
      setHasVoted(voted);
    });
  }, []);

  // Fetch latest stats
  useEffect(() => {
    if (!initialStats) {
      fetch('/api/community/stats')
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(err => console.error('Error fetching stats:', err));
    }
  }, [initialStats]);

  const handleOptionClick = (field: keyof CommunityResponse, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSecurityMeasure = (measure: string) => {
    setFormData(prev => {
      const current = prev.security_measures || [];
      const newMeasures = current.includes(measure)
        ? current.filter(m => m !== measure)
        : [...current, measure];
      return { ...prev, security_measures: newMeasures };
    });
  };

  const handleNext = () => {
    // Skip questions if phone not stolen
    if (currentStep === 1 && formData.had_phone_stolen !== 'yes') {
      setCurrentStep(5); // Jump to security measures
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    // Handle back navigation with skipped questions
    if (currentStep === 5 && formData.had_phone_stolen !== 'yes') {
      setCurrentStep(1);
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/community/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          session_id: sessionId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setHasVoted(true);
        // Refresh stats
        const statsRes = await fetch('/api/community/stats');
        const newStats = await statsRes.json();
        setStats(newStats);
        // Trigger update in other components
        triggerStatsRefresh();
      } else {
        setError(result.error || 'Failed to submit response');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.had_phone_stolen !== null;
      case 2: return formData.phone_recovered !== null;
      case 3: return formData.replacement_method !== null;
      case 4: return formData.theft_location !== null;
      case 5: return formData.security_measures && formData.security_measures.length > 0;
      case 6: return formData.reported_to_police !== null;
      default: return false;
    }
  };

  // If already voted, show thank you
  if (hasVoted && stats) {
    const insights = generateInsights(formData, stats);
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 md:p-8 border-2 border-green-200">
        <div className="flex items-start gap-4 mb-6">
          <CheckCircle2 className="h-8 w-8 text-green-600 flex-shrink-0" />
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Thank You!</h3>
            <p className="text-neutral-700">
              Your response helps us understand phone theft patterns and protect others.
            </p>
          </div>
        </div>

        {insights.length > 0 && (
          <div className="bg-card rounded-lg p-6 mb-6">
            <h4 className="font-semibold text-foreground mb-3 flex items-center">
              <span className="mr-2">💡</span> Insights Based On Your Response
            </h4>
            <ul className="space-y-2">
              {insights.map((insight, i) => (
                <li key={i} className="text-sm text-neutral-700 flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <a
            href="/prevention"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            View Prevention Tips
          </a>
          <a
            href="#analytics"
            className="px-4 py-2 bg-neutral-100 text-foreground rounded-md hover:bg-neutral-200 transition-colors"
          >
            View Full Analytics
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-md p-6 md:p-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-neutral-700">
            Question {currentStep} of 6
          </span>
          <span className="text-xs text-neutral-500">
            {Math.round((currentStep / 6) * 100)}% complete
          </span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div
            className="bg-primary rounded-full h-2 transition-all duration-300"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* Question 1: Had Phone Stolen */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Have you had a phone stolen?
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {[
              { value: 'yes', label: 'Yes, my phone was stolen', icon: '📱' },
              { value: 'no', label: 'No, never had a phone stolen', icon: '✅' },
              { value: 'someone_i_know', label: 'Not me, but someone I know', icon: '👥' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => handleOptionClick('had_phone_stolen', option.value)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  formData.had_phone_stolen === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <span className="text-2xl mr-3">{option.icon}</span>
                <span className="font-medium text-foreground">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Question 2: Phone Recovered (only if stolen) */}
      {currentStep === 2 && formData.had_phone_stolen === 'yes' && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Was your phone recovered?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { value: 'yes_fully', label: 'Yes, fully recovered', icon: '✅' },
              { value: 'partially', label: 'Partially recovered', icon: '⚠️' },
              { value: 'no', label: 'No, never recovered', icon: '❌' },
              { value: 'investigating', label: 'Still waiting/investigating', icon: '🔍' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => handleOptionClick('phone_recovered', option.value)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  formData.phone_recovered === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <span className="text-2xl mr-3">{option.icon}</span>
                <span className="font-medium text-foreground">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Question 3: Replacement Method */}
      {currentStep === 3 && formData.had_phone_stolen === 'yes' && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            How did you replace your phone?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { value: 'new_outright', label: 'Bought new phone outright', icon: '🆕' },
              { value: 'second_hand', label: 'Bought second-hand phone', icon: '♻️' },
              { value: 'insurance', label: 'Insurance replacement', icon: '🛡️' },
              { value: 'contract', label: 'Contract upgrade', icon: '📋' },
              { value: 'not_yet', label: "Haven't replaced it yet", icon: '⏳' },
              { value: 'backup_phone', label: 'Using old backup phone', icon: '📞' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => handleOptionClick('replacement_method', option.value)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  formData.replacement_method === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <span className="text-2xl mr-3">{option.icon}</span>
                <span className="font-medium text-foreground">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Question 4: Theft Location */}
      {currentStep === 4 && formData.had_phone_stolen === 'yes' && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Where did the theft occur?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { value: 'public_transport', label: 'On public transport', icon: '🚇' },
              { value: 'restaurant', label: 'In a restaurant/café', icon: '☕' },
              { value: 'street', label: 'On the street', icon: '🛣️' },
              { value: 'event', label: 'At an event/venue', icon: '🎭' },
              { value: 'shop', label: 'In a shop/mall', icon: '🛍️' },
              { value: 'other', label: 'Other public place', icon: '📍' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => handleOptionClick('theft_location', option.value)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  formData.theft_location === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <span className="text-2xl mr-3">{option.icon}</span>
                <span className="font-medium text-foreground">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Question 5: Security Measures (multiple choice) */}
      {currentStep === 5 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            What security measures {formData.had_phone_stolen === 'yes' ? 'did you have' : 'do you have'}?
          </h3>
          <p className="text-sm text-neutral-600 mb-4">Select all that apply</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { value: 'pin', label: 'PIN/Password lock', icon: '🔢' },
              { value: 'biometric', label: 'Biometric (fingerprint/face)', icon: '👆' },
              { value: 'find_my_device', label: 'Find My Device enabled', icon: '📍' },
              { value: 'sim_pin', label: 'SIM PIN', icon: '📶' },
              { value: 'none', label: 'No security measures', icon: '⚠️' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => toggleSecurityMeasure(option.value)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  formData.security_measures?.includes(option.value)
                    ? 'border-primary bg-primary/5'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{option.icon}</span>
                    <span className="font-medium text-foreground">{option.label}</span>
                  </div>
                  {formData.security_measures?.includes(option.value) && (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Question 6: Police Reporting */}
      {currentStep === 6 && formData.had_phone_stolen === 'yes' && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Did you report to police?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { value: 'yes_crime_ref', label: 'Yes, got crime reference number', icon: '✅' },
              { value: 'yes_no_followup', label: 'Yes, but no follow-up', icon: '📋' },
              { value: 'no', label: "No, didn't report", icon: '❌' },
              { value: 'network_only', label: 'Reported to network only', icon: '📱' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => handleOptionClick('reported_to_police', option.value)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  formData.reported_to_police === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <span className="text-2xl mr-3">{option.icon}</span>
                <span className="font-medium text-foreground">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 bg-destructive-subtle border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-200">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className="px-4 py-2 text-neutral-700 hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← Back
        </button>
        
        {currentStep < 6 || (currentStep === 6 && formData.had_phone_stolen !== 'yes') ? (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canProceed() || isSubmitting}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Anonymously'}
          </button>
        )}
      </div>
    </div>
  );
}

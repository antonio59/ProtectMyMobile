// Community Voting Interface - Main Component
// Handles the entire voting flow with conditional questions

import { useState, useEffect } from 'react';
import type { CommunityResponse, CommunityStats } from '../lib/convexData';
import { checkHasVoted } from '../lib/convexData';
import { AlertCircle } from 'lucide-react';
import { getOrCreateSessionId } from '../lib/convexMutations';
import { triggerStatsRefresh } from '../lib/stores/communityStore';
import VotingSuccess from './VotingSuccess';
import OptionGrid from './OptionGrid';

interface Props {
  initialStats: CommunityStats | null;
}

interface StepConfig {
  stepNumber: number;
  title: string | ((d: CommunityResponse) => string);
  field: keyof CommunityResponse;
  options: { value: string; label: string; icon: string }[];
  showWhen: (d: CommunityResponse) => boolean;
  multiSelect: boolean;
  singleColumn: boolean;
}

const STEPS: StepConfig[] = [
  { stepNumber: 1, title: 'Have you had a phone stolen?', field: 'had_phone_stolen', options: [{value:'yes',label:'Yes, my phone was stolen',icon:'📱'},{value:'no',label:'No, never had a phone stolen',icon:'✅'},{value:'someone_i_know',label:'Not me, but someone I know',icon:'👥'}], showWhen: () => true, multiSelect: false, singleColumn: true },
  { stepNumber: 2, title: 'Was your phone recovered?', field: 'phone_recovered', options: [{value:'yes_fully',label:'Yes, fully recovered',icon:'✅'},{value:'partially',label:'Partially recovered',icon:'⚠️'},{value:'no',label:'No, never recovered',icon:'❌'},{value:'investigating',label:'Still waiting/investigating',icon:'🔍'}], showWhen: (d) => d.had_phone_stolen === 'yes', multiSelect: false, singleColumn: false },
  { stepNumber: 3, title: 'How did you replace your phone?', field: 'replacement_method', options: [{value:'new_outright',label:'Bought new phone outright',icon:'🆕'},{value:'second_hand',label:'Bought second-hand phone',icon:'♻️'},{value:'insurance',label:'Insurance replacement',icon:'🛡️'},{value:'contract',label:'Contract upgrade',icon:'📋'},{value:'not_yet',label:"Haven't replaced it yet",icon:'⏳'},{value:'backup_phone',label:'Using old backup phone',icon:'📞'}], showWhen: (d) => d.had_phone_stolen === 'yes', multiSelect: false, singleColumn: false },
  { stepNumber: 4, title: 'Where did the theft occur?', field: 'theft_location', options: [{value:'public_transport',label:'On public transport',icon:'🚇'},{value:'restaurant',label:'In a restaurant/café',icon:'☕'},{value:'street',label:'On the street',icon:'🛣️'},{value:'event',label:'At an event/venue',icon:'🎭'},{value:'shop',label:'In a shop/mall',icon:'🛍️'},{value:'other',label:'Other public place',icon:'📍'}], showWhen: (d) => d.had_phone_stolen === 'yes', multiSelect: false, singleColumn: false },
  { stepNumber: 5, title: (d) => `What security measures ${d.had_phone_stolen === 'yes' ? 'did you have' : 'do you have'}?`, field: 'security_measures', options: [{value:'pin',label:'PIN/Password lock',icon:'🔢'},{value:'biometric',label:'Biometric (fingerprint/face)',icon:'👆'},{value:'find_my_device',label:'Find My Device enabled',icon:'📍'},{value:'sim_pin',label:'SIM PIN',icon:'📶'},{value:'none',label:'No security measures',icon:'⚠️'}], showWhen: () => true, multiSelect: true, singleColumn: false },
  { stepNumber: 6, title: 'Did you report to police?', field: 'reported_to_police', options: [{value:'yes_crime_ref',label:'Yes, got crime reference number',icon:'✅'},{value:'yes_no_followup',label:'Yes, but no follow-up',icon:'📋'},{value:'no',label:"No, didn't report",icon:'❌'},{value:'network_only',label:'Reported to network only',icon:'📱'}], showWhen: (d) => d.had_phone_stolen === 'yes', multiSelect: false, singleColumn: false },
];

function canProceed(formData: CommunityResponse, currentStep: number) {
  switch (currentStep) {
    case 1: return formData.had_phone_stolen !== null;
    case 2: return formData.phone_recovered !== null;
    case 3: return formData.replacement_method !== null;
    case 4: return formData.theft_location !== null;
    case 5: return !!formData.security_measures?.length;
    case 6: return formData.reported_to_police !== null;
    default: return false;
  }
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

  useEffect(() => {
    const sid = getOrCreateSessionId();
    setSessionId(sid);
    checkHasVoted(sid).then(voted => setHasVoted(voted));
  }, []);

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
    if (currentStep === 1 && formData.had_phone_stolen !== 'yes') {
      setCurrentStep(5);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
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
        body: JSON.stringify({ ...formData, session_id: sessionId }),
      });
      const result = await response.json();
      if (result.success) {
        setHasVoted(true);
        const statsRes = await fetch('/api/community/stats');
        setStats(await statsRes.json());
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

  if (hasVoted && stats) {
    return <VotingSuccess stats={stats} formData={formData} />;
  }

  const stepConfig = STEPS.find(s => s.stepNumber === currentStep);
  const showStep = stepConfig?.showWhen(formData) ?? false;

  return (
    <div className="bg-card rounded-lg shadow-md p-6 md:p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-neutral-700">Question {currentStep} of 6</span>
          <span className="text-xs text-neutral-500">{Math.round((currentStep / 6) * 100)}% complete</span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2"><div className="bg-primary rounded-full h-2 transition-all duration-300" style={{ width: `${(currentStep / 6) * 100}%` }} /></div>
      </div>
      {showStep && stepConfig && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground mb-4">{typeof stepConfig.title === 'function' ? stepConfig.title(formData) : stepConfig.title}</h3>
          {stepConfig.multiSelect && <p className="text-sm text-neutral-600 mb-4">Select all that apply</p>}
          <OptionGrid options={stepConfig.options} selected={formData[stepConfig.field] as string | string[] | null} onSelect={(value) => { if (stepConfig.multiSelect) toggleSecurityMeasure(value); else handleOptionClick(stepConfig.field, value); }} multiSelect={stepConfig.multiSelect} singleColumn={stepConfig.singleColumn} />
        </div>
      )}
      {error && (
        <div className="mt-6 p-4 bg-destructive-subtle border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="size-5 text-destructive flex-shrink-0 mt-0.5" /><p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
        <button onClick={handleBack} disabled={currentStep === 1} className="px-4 py-2 text-neutral-700 hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors">← Back</button>
        {currentStep < 6 || (currentStep === 6 && formData.had_phone_stolen !== 'yes') ? (
          <button onClick={handleNext} disabled={!canProceed(formData, currentStep)} className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Next →</button>
        ) : (
          <button onClick={handleSubmit} disabled={!canProceed(formData, currentStep) || isSubmitting} className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{isSubmitting ? 'Submitting...' : 'Submit Anonymously'}</button>
        )}
      </div>
    </div>
  );
}

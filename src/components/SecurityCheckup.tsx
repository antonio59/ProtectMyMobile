import { useState } from 'react';
import { Check, X, Shield, AlertTriangle, CheckCircle2, Share2 } from 'lucide-react';

// Generate a cryptographically secure session ID for analytics
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('pmm_session');
  if (!sessionId) {
    // Use crypto.randomUUID() for secure random ID generation
    sessionId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Array.from(crypto.getRandomValues(new Uint8Array(16)))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
    sessionStorage.setItem('pmm_session', sessionId);
  }
  return sessionId;
}

// Track analytics event via API
async function trackAnalytics(eventType: string, metadata?: Record<string, unknown>) {
  try {
    const CONVEX_URL = (import.meta as any).env?.PUBLIC_CONVEX_URL || '';
    if (!CONVEX_URL) return;

    await fetch(`${CONVEX_URL}/api/mutation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'analytics:trackEvent',
        args: {
          eventType,
          metadata,
          sessionId: getSessionId(),
          userAgent: navigator.userAgent,
          referrer: document.referrer || undefined,
        },
      }),
    });
  } catch (err) {
    // Silently fail - analytics shouldn't break the app
    console.debug('Analytics tracking failed:', err);
  }
}

interface Question {
  id: string;
  question: string;
  category: 'device' | 'sim' | 'apps' | 'backup' | 'awareness';
  points: number;
}

const questions: Question[] = [
  // Device Security
  { id: 'q1', question: 'Do you have a screen lock enabled (PIN, password, pattern, or biometric)?', category: 'device', points: 10 },
  { id: 'q2', question: 'Is your screen lock set to auto-lock within 30 seconds of inactivity?', category: 'device', points: 10 },
  { id: 'q3', question: 'Do you use biometric authentication (fingerprint or face recognition)?', category: 'device', points: 10 },
  { id: 'q4', question: 'Have you enabled Find My Device/iPhone on your phone?', category: 'device', points: 10 },
  
  // SIM & Network
  { id: 'q5', question: 'Have you set up a SIM PIN lock?', category: 'sim', points: 10 },
  { id: 'q6', question: 'Do you know your phone\'s IMEI number and have it written down somewhere safe?', category: 'sim', points: 10 },
  
  // Apps & Banking
  { id: 'q7', question: 'Do your banking apps require separate authentication (PIN or biometric)?', category: 'apps', points: 10 },
  { id: 'q8', question: 'Have you enabled two-factor authentication (2FA) on important accounts?', category: 'apps', points: 10 },
  { id: 'q9', question: 'Are your app permissions set to only what\'s necessary?', category: 'apps', points: 5 },
  
  // Backup & Recovery
  { id: 'q10', question: 'Do you regularly back up your phone data to cloud or computer?', category: 'backup', points: 5 },
  { id: 'q11', question: 'Have you saved emergency contact numbers (bank, network provider) elsewhere?', category: 'backup', points: 5 },
  
  // Awareness
  { id: 'q12', question: 'Do you avoid using your phone while walking in busy or high-risk areas?', category: 'awareness', points: 5 },
];

const categoryNames = {
  device: 'Device Security',
  sim: 'SIM & Network',
  apps: 'Apps & Banking',
  backup: 'Backup & Recovery',
  awareness: 'Awareness',
};

export default function SecurityCheckup() {
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
  const [showResults, setShowResults] = useState(false);
  const [hasTrackedStart, setHasTrackedStart] = useState(false);

  // Track when user starts the checkup (first answer)
  const handleAnswer = (questionId: string, answer: boolean) => {
    if (!hasTrackedStart) {
      trackAnalytics('security_checkup_started');
      setHasTrackedStart(true);
    }
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const calculateScore = () => {
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const earnedPoints = questions.reduce((sum, q) => {
      return sum + (answers[q.id] === true ? q.points : 0);
    }, 0);
    const percentage = Math.round((earnedPoints / totalPoints) * 100);
    return { earnedPoints, totalPoints, percentage };
  };

  const getScoreLevel = (percentage: number) => {
    if (percentage >= 90) return { level: 'Excellent', color: 'text-success', bg: 'bg-success-subtle', border: 'border-border' };
    if (percentage >= 70) return { level: 'Good', color: 'text-primary', bg: 'bg-primary-subtle', border: 'border-border' };
    if (percentage >= 50) return { level: 'Fair', color: 'text-warning', bg: 'bg-warning-subtle', border: 'border-border' };
    return { level: 'Needs Improvement', color: 'text-destructive', bg: 'bg-destructive-subtle', border: 'border-destructive-muted' };
  };

  const getRecommendations = () => {
    const recs: { title: string; description: string; priority: 'high' | 'medium' }[] = [];
    questions.forEach(q => {
      if (answers[q.id] === false) {
        switch (q.id) {
          case 'q1':
            recs.push({ title: 'Enable Screen Lock', description: 'Set up a PIN, password, or biometric lock immediately. This is your first line of defence.', priority: 'high' });
            break;
          case 'q4':
            recs.push({ title: 'Enable Find My Device', description: 'Turn on Find My iPhone (iOS) or Find My Device (Android) to track and remotely lock your phone.', priority: 'high' });
            break;
          case 'q5':
            recs.push({ title: 'Set SIM PIN', description: 'Prevent thieves from using your SIM in another device by setting a SIM PIN in your phone settings.', priority: 'high' });
            break;
          case 'q6':
            recs.push({ title: 'Record IMEI Number', description: 'Dial *#06# to find your IMEI and save it securely. You\'ll need this to report theft to police.', priority: 'medium' });
            break;
          case 'q7':
            recs.push({ title: 'Secure Banking Apps', description: 'Enable app-specific authentication for banking apps, separate from your device lock.', priority: 'high' });
            break;
          case 'q8':
            recs.push({ title: 'Enable 2FA', description: 'Turn on two-factor authentication for email, social media, and banking accounts.', priority: 'medium' });
            break;
        }
      }
    });
    return recs;
  };

  const allAnswered = questions.every(q => answers[q.id] !== undefined && answers[q.id] !== null);

  const handleSubmit = () => {
    if (allAnswered) {
      // Calculate scores for tracking
      const score = calculateScore();
      const scoreLevel = getScoreLevel(score.percentage);

      // Calculate category breakdown for analytics
      const categoryBreakdown: Record<string, number> = {};
      Object.keys(categoryNames).forEach(key => {
        const categoryQuestions = questions.filter(q => q.category === key);
        const categoryTotal = categoryQuestions.reduce((sum, q) => sum + q.points, 0);
        const categoryEarned = categoryQuestions.reduce((sum, q) => sum + (answers[q.id] ? q.points : 0), 0);
        categoryBreakdown[key] = Math.round((categoryEarned / categoryTotal) * 100);
      });

      // Track completion with detailed analytics
      trackAnalytics('security_checkup_completed', {
        score: score.percentage,
        scoreLevel: scoreLevel.level,
        categoryBreakdown: JSON.stringify(categoryBreakdown),
      });

      setShowResults(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setAnswers({});
    setShowResults(false);
    setHasTrackedStart(false); // Allow tracking start again on retake
  };

  if (showResults) {
    const score = calculateScore();
    const scoreLevel = getScoreLevel(score.percentage);
    const recommendations = getRecommendations();

    const handleShare = async () => {
      const shareData = {
        title: 'Mobile Security Score',
        text: `I just checked my phone's security score on ProtectMyMobile! I scored ${score.percentage}%. Check yours here:`,
        url: window.location.href,
      };
      
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          console.error('Share failed:', err);
        }
      } else {
        navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        alert('Link copied to clipboard!');
      }
    };

    return (
      <div className="space-y-6">
        {/* Score Card */}
        <div className={`${scoreLevel.bg} border-2 ${scoreLevel.border} rounded-xl p-8 text-center`}>
          <div className="mb-4">
            <Shield className={`h-16 w-16 ${scoreLevel.color} mx-auto mb-2`} />
          </div>
          <h2 className="text-3xl font-bold mb-2">Your Security Score</h2>
          <div className={`text-6xl font-bold ${scoreLevel.color} mb-2`}>
            {score.percentage}%
          </div>
          <div className="text-xl font-semibold mb-1">{scoreLevel.level}</div>
          <div className="text-muted-foreground">
            {score.earnedPoints} out of {score.totalPoints} points
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="bg-card rounded-lg  p-6">
          <h3 className="text-xl font-semibold mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(categoryNames).map(([key, name]) => {
              const categoryQuestions = questions.filter(q => q.category === key);
              const categoryTotal = categoryQuestions.reduce((sum, q) => sum + q.points, 0);
              const categoryEarned = categoryQuestions.reduce((sum, q) => sum + (answers[q.id] ? q.points : 0), 0);
              const categoryPercent = Math.round((categoryEarned / categoryTotal) * 100);

              return (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{name}</span>
                    <span className="text-muted-foreground">{categoryPercent}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${categoryPercent >= 70 ? 'bg-success' : categoryPercent >= 50 ? 'bg-warning' : 'bg-destructive'}`}
                      style={{ width: `${categoryPercent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-card rounded-lg  p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <AlertTriangle className="size-6 text-warning mr-2" />
              Your Action Plan
            </h3>
            <p className="text-muted-foreground mb-4">
              Based on your answers, here are the top security improvements you should make:
            </p>
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-l-4 ${rec.priority === 'high' ? 'border-destructive-muted bg-destructive-subtle' : 'border-border bg-warning-subtle'}`}
                >
                  <div className="flex items-start">
                    <div className={`rounded-full p-1 mr-3 mt-0.5 ${rec.priority === 'high' ? 'bg-destructive-muted' : 'bg-warning-subtle'}`}>
                      <AlertTriangle className={`size-4 ${rec.priority === 'high' ? 'text-destructive-hover' : 'text-warning'}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{rec.title}</h4>
                      <p className="text-sm text-foreground">{rec.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Perfect Score */}
        {score.percentage === 100 && (
          <div className="bg-success-subtle border-2 border-border rounded-lg p-6 text-center">
            <CheckCircle2 className="size-12 text-success mx-auto mb-3" />
            <h3 className="text-xl font-bold text-success mb-2">Perfect Security Setup! 🎉</h3>
            <p className="text-success">
              You've implemented all recommended security measures. Keep maintaining these practices to stay protected.
            </p>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">Next Steps</h3>
          <div className="space-y-2 text-sm">
            <p>✅ Review our <a href="/prevention" className="text-primary hover:underline font-medium">prevention guides</a> for detailed setup instructions</p>
            <p>✅ Save emergency contacts for your <a href="/banks" className="text-primary hover:underline font-medium">bank</a> and <a href="/mobile-providers" className="text-primary hover:underline font-medium">network provider</a></p>
            <p>✅ Bookmark our <a href="/emergency" className="text-primary hover:underline font-medium">emergency response guide</a> for quick access if theft occurs</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={handleShare}
            className="flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors"
          >
            <Share2 className="mr-2 size-5" />
            Share Result
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-neutral-200 text-foreground rounded-lg font-medium hover:bg-neutral-300 transition-colors"
          >
            Retake Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="bg-card rounded-lg  p-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-muted-foreground">
            {Object.keys(answers).length} of {questions.length} answered
          </span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-card rounded-lg  p-6">
            <div className="flex items-start">
              <div className="bg-primary/10 rounded-full size-8 flex items-center justify-center flex-shrink-0 mr-3 mt-1">
                <span className="text-primary font-bold text-sm">{idx + 1}</span>
              </div>
              <div className="flex-1">
                <p className="text-lg font-medium mb-3">{q.question}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAnswer(q.id, true)}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                      answers[q.id] === true
                        ? 'border-success bg-success-subtle text-success'
                        : 'border-neutral-300 hover:border-success text-foreground'
                    }`}
                  >
                    <Check className="size-5 inline mr-2" />
                    Yes
                  </button>
                  <button
                    onClick={() => handleAnswer(q.id, false)}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                      answers[q.id] === false
                        ? 'border-destructive-muted bg-destructive-subtle text-destructive-hover'
                        : 'border-neutral-300 hover:border-destructive-muted text-foreground'
                    }`}
                  >
                    <X className="size-5 inline mr-2" />
                    No
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="sticky bottom-4 bg-card rounded-lg  p-4 border-2 border-primary/20">
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className={`w-full px-6 py-4 rounded-lg font-bold text-lg transition-all ${
            allAnswered
              ? 'bg-primary text-white hover:bg-primary-hover cursor-pointer'
              : 'bg-neutral-300 text-muted-foreground cursor-not-allowed'
          }`}
        >
          {allAnswered ? 'Get My Security Score' : `Answer All Questions (${Object.keys(answers).length}/${questions.length})`}
        </button>
      </div>
    </div>
  );
}

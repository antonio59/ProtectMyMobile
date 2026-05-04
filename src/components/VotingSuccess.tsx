import { CheckCircle2 } from 'lucide-react';
import type { CommunityStats, CommunityResponse } from '../lib/convexData';
import { generateInsights } from '../lib/convexData';

interface VotingSuccessProps {
  stats: CommunityStats | null;
  formData: CommunityResponse;
}

export default function VotingSuccess({ stats, formData }: VotingSuccessProps) {
  if (!stats) return null;

  const insights = generateInsights(formData, stats);

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 md:p-8 border-2 border-green-200">
      <div className="flex items-start gap-4 mb-6">
        <CheckCircle2 className="size-8 text-green-600 flex-shrink-0" />
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-2">Thank You!</h3>
          <p className="text-foreground">
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
              <li key={i} className="text-sm text-foreground flex items-start">
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
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
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

import React from 'react';
import { cn } from '@/src/lib/utils';
import { Send, CheckCircle2 } from 'lucide-react';

interface JobCardProps {
  score: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  tags: string[];
  highlightTags?: string[];
  matchReason?: string;
  isNew?: boolean;
  onApply?: () => void;
  isApplied?: boolean;
  isApplying?: boolean;
  showApplyButton?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({ 
  score, 
  title, 
  company, 
  location, 
  salary, 
  tags, 
  highlightTags = [],
  matchReason,
  isNew,
  onApply,
  isApplied,
  isApplying,
  showApplyButton = false
}) => {
  return (
    <div className="flex gap-4 p-5 bg-brand-surface border border-brand-border rounded-radius-item hover:shadow-md hover:border-brand-primary/20 transition-all group relative">
      {isNew && (
        <span className="absolute top-4 right-4 bg-brand-accent text-white text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-tighter shadow-sm animate-pulse">
          New Match
        </span>
      )}
      <div className="relative flex-shrink-0">
        <div className={cn(
          "w-12 h-12 rounded-full border-[3px] flex items-center justify-center font-black text-sm transition-transform group-hover:scale-110",
          score >= 90 ? "border-brand-success text-brand-success" : 
          score >= 70 ? "border-brand-accent text-brand-accent" : 
          "border-brand-text-muted text-brand-text-muted"
        )}>
          {score}%
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h4 className="text-[15px] font-black text-brand-text-main group-hover:text-brand-primary transition-colors truncate pr-4">
              {title}
            </h4>
            <p className="text-[13px] text-brand-text-muted flex items-center gap-1.5 mt-1 font-medium italic">
              {company}
            </p>
          </div>
          
          {showApplyButton && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (!isApplied && !isApplying && onApply) onApply();
              }}
              disabled={isApplied || isApplying}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shadow-sm active:scale-95 flex-shrink-0 ml-2",
                isApplied 
                  ? "bg-brand-success/10 text-brand-success border border-brand-success/20 cursor-default"
                  : "bg-brand-primary text-white hover:bg-brand-primary/90"
              )}
            >
              {isApplying ? (
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isApplied ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              {isApplied ? 'Applied' : isApplying ? 'Applying' : 'Apply'}
            </button>
          )}
        </div>

        <p className="text-[13px] text-brand-text-muted flex items-center gap-1.5 mt-1 font-medium">
          {location} &bull; {salary}
        </p>

        {matchReason && (
          <p className="text-[11px] text-brand-accent mt-2 font-bold bg-brand-accent/5 px-2 py-1 rounded inline-block">
            AI Insight: {matchReason}
          </p>
        )}
        
        <div className="flex flex-wrap gap-1.5 mt-3">
          {tags.map(tag => (
            <span 
              key={tag}
              className={cn(
                "px-2.5 py-1 rounded-radius-tag text-[11px] font-bold transition-colors",
                highlightTags.includes(tag) 
                  ? "bg-brand-primary text-white shadow-sm" 
                  : "bg-brand-bg text-brand-text-muted hover:bg-brand-border/50"
              )}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
